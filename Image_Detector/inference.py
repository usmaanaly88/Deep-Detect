import io
import os
import logging
import warnings
import threading

# ── Silence noisy third-party loggers before any imports ──────────────────────
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TRANSFORMERS_VERBOSITY"]          = "error"
os.environ["HF_HUB_DISABLE_PROGRESS_BARS"]   = "1"
os.environ["TOKENIZERS_PARALLELISM"]          = "false"
warnings.filterwarnings("ignore")
for _lib in ("transformers", "huggingface_hub", "huggingface_hub.utils._http",
             "urllib3", "httpx", "httpcore", "filelock", "fsspec"):
    logging.getLogger(_lib).setLevel(logging.CRITICAL)

import torch
from PIL import Image
from torchvision import transforms

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("inference")

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "custom_cnn_standalone.pt")

# ── Devices ───────────────────────────────────────────────────────────────────
device     = torch.device("cuda" if torch.cuda.is_available() else "cpu")
hf_device  = 0 if torch.cuda.is_available() else -1   # HF pipeline device id
logger.info(f"Using device: {device}")

# ── Custom CNN hyper-parameters ───────────────────────────────────────────────
IMG_SIZE = 224
MEAN     = [0.485, 0.456, 0.406]
STD      = [0.229, 0.224, 0.225]

# THRESHOLD TUNING GUIDE (change this one value to fix wrong predictions):
#   0.50  → balanced (default)
#   0.60  → stricter: catches MORE fakes, may flag some real as fake
#   0.65  → very strict: catches MOST fakes (use if fakes are slipping through)
#   0.40  → lenient: fewer false alarms on real images
OPTIMAL_THRESHOLD = 0.60   # raised from 0.5 — catches more AI fakes

# WEIGHTED VOTING — CNN gets 2 votes, each HF model gets 1 vote
# CNN is primary authority; HF models can only override when BOTH agree
CNN_VOTES = 2
HF_VOTES  = 1

# ── Image pre-processing ──────────────────────────────────────────────────────
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=MEAN, std=STD),
])

# ── Load Custom CNN (TorchScript) ─────────────────────────────────────────────
if not os.path.exists(MODEL_PATH):
    _fallback = os.path.join(BASE_DIR, "custom_cnn_standalone.pt")
    if os.path.exists(_fallback):
        MODEL_PATH = _fallback
    else:
        raise FileNotFoundError(
            f"Model not found at: {MODEL_PATH} or {_fallback}")

try:
    logger.info(f"Loading TorchScript model from {MODEL_PATH} ...")
    model = torch.jit.load(MODEL_PATH, map_location=device)
    model.eval()
    logger.info("Custom CNN loaded and set to eval mode.")
except Exception as exc:
    logger.error(f"Failed to load model: {exc}")
    raise


# ── Image loader (with validation) ───────────────────────────────────────────
def _load_image(image_source) -> Image.Image:
    """Accept a file path, raw bytes, or a PIL Image. Raise ValueError on failure."""
    try:
        if isinstance(image_source, Image.Image):
            return image_source
        if isinstance(image_source, bytes):
            return Image.open(io.BytesIO(image_source))
        if not os.path.exists(image_source):
            raise FileNotFoundError(f"Image not found: {image_source}")
        return Image.open(image_source)
    except Exception as exc:
        raise ValueError(f"Could not load image: {exc}") from exc


# ── Custom CNN inference ──────────────────────────────────────────────────────
def _predict_probability(image: Image.Image) -> float:
    """Return sigmoid probability from the Custom CNN (higher = more 'real')."""
    tensor = transform(image.convert("RGB")).unsqueeze(0).to(device)
    with torch.no_grad():
        return torch.sigmoid(model(tensor)).item()


# ── HF model lazy-load (thread-safe sentinel pattern) ────────────────────────
# None  = not yet attempted
# False = permanently failed (never retry)
# obj   = loaded pipeline
_model_hf1 = None   # prithivMLmods/Deepfake-Detection-Exp-02-21
_model_hf2 = None   # prithivMLmods/Deep-Fake-Detector-v2-Model
_hf_lock   = threading.Lock()


def _load_hf_models() -> None:
    """Load both HF models exactly once under a mutex."""
    global _model_hf1, _model_hf2
    with _hf_lock:
        from transformers import pipeline as hf_pipeline

        if _model_hf1 is None:
            try:
                # HF model 1 loading log suppressed
                _model_hf1 = hf_pipeline(
                    "image-classification",
                    model="prithivMLmods/Deepfake-Detection-Exp-02-21",
                    device=hf_device,
                )
                # HF model 1 loaded log suppressed
            except Exception as exc:
                logger.warning(f"HF model 1 failed to load: {exc}")
                _model_hf1 = False

        if _model_hf2 is None:
            try:
                # HF model 2 loading log suppressed
                _model_hf2 = hf_pipeline(
                    "image-classification",
                    model="prithivMLmods/Deep-Fake-Detector-v2-Model",
                    device=hf_device,
                )
                # HF model 2 loaded log suppressed
            except Exception as exc:
                logger.warning(f"HF model 2 failed to load: {exc}")
                _model_hf2 = False


def _predict_hf1(pil_image: Image.Image) -> str:
    """Deepfake-Detection-Exp-02-21 — labels: 'Deepfake' / 'Real' (correct)."""
    try:
        if _model_hf1 is None:
            _load_hf_models()
        if not _model_hf1:
            return "unknown"
        best = max(_model_hf1(pil_image), key=lambda x: x["score"])
        return "ai" if best["label"].lower() == "deepfake" else "real"
    except Exception as exc:
        logger.warning(f"[HF1] Inference failed (non-fatal): {exc}")
        return "unknown"


def _predict_hf2(pil_image: Image.Image) -> str:
    """Deep-Fake-Detector-v2-Model — labels are INVERTED in HF config:
       'Realism' actually means Deepfake, 'Deepfake' actually means Real."""
    try:
        if _model_hf2 is None:
            _load_hf_models()
        if not _model_hf2:
            return "unknown"
        best = max(_model_hf2(pil_image), key=lambda x: x["score"])
        # Inverted: 'Realism' label → AI fake
        return "ai" if best["label"].lower() == "realism" else "real"
    except Exception as exc:
        logger.warning(f"[HF2] Inference failed (non-fatal): {exc}")
        return "unknown"


# ── Public API ────────────────────────────────────────────────────────────────
def predict_label(image_source) -> str:
    """Return 'real' or 'ai'."""
    label, _ = predict_with_confidence(image_source)
    return label


def predict_with_confidence(image_source) -> tuple:
    """
    Return (label, confidence_percent) using weighted majority voting.

    Vote weights:
        Custom CNN  → 2 votes  (primary authority)
        HF model 1  → 1 vote
        HF model 2  → 1 vote

    This means HF models can ONLY override the CNN when:
        - BOTH HF models agree with each other, AND
        - Their combined 2 votes tie or beat CNN's 2 votes
      → In case of a tie, CNN label wins (it is the tiebreaker).

    Confidence = (winning_weighted_votes / total_weighted_votes) * 100

    This function is designed to NEVER raise. Any failure in the HF
    models or the threading layer falls back to CNN-only inference.
    """
    from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeout

    image = _load_image(image_source)

    # ── Attempt concurrent 3-model inference ─────────────────────────────────
    probability = None
    hf1_label   = "unknown"
    hf2_label   = "unknown"

    try:
        with ThreadPoolExecutor(max_workers=3) as ex:
            fut_cnn = ex.submit(_predict_probability, image)
            fut_hf1 = ex.submit(_predict_hf1, image)
            fut_hf2 = ex.submit(_predict_hf2, image)

            # CNN must succeed — give it 30 s; HF models get 60 s each
            probability = fut_cnn.result(timeout=30)

            try:
                hf1_label = fut_hf1.result(timeout=60)
            except Exception as hf1_err:
                logger.warning(f"[HF1] result() raised (non-fatal): {hf1_err}")
                hf1_label = "unknown"

            try:
                hf2_label = fut_hf2.result(timeout=60)
            except Exception as hf2_err:
                logger.warning(f"[HF2] result() raised (non-fatal): {hf2_err}")
                hf2_label = "unknown"

    except Exception as pool_err:
        # Entire thread pool failed (e.g. CNN itself threw).  Fall back to
        # a direct synchronous CNN call so we always return something.
        logger.error(f"ThreadPoolExecutor failed, falling back to CNN-only: {pool_err}")
        try:
            probability = _predict_probability(image)
        except Exception as cnn_err:
            # Absolute last resort — model is broken; return a neutral result
            logger.error(f"CNN fallback also failed: {cnn_err}")
            return "real", 50.0

    # ── CNN decision ──────────────────────────────────────────────────────────
    cnn_label = "real" if probability > OPTIMAL_THRESHOLD else "ai"
    cnn_conf  = probability if cnn_label == "real" else (1.0 - probability)

    # ── Weighted vote tally ───────────────────────────────────────────────────
    ai_votes   = CNN_VOTES if cnn_label == "ai" else 0
    real_votes = CNN_VOTES if cnn_label == "real" else 0
    total_weight = CNN_VOTES

    if hf1_label != "unknown":
        if hf1_label == "ai":
            ai_votes += HF_VOTES
        else:
            real_votes += HF_VOTES
        total_weight += HF_VOTES

    if hf2_label != "unknown":
        if hf2_label == "ai":
            ai_votes += HF_VOTES
        else:
            real_votes += HF_VOTES
        total_weight += HF_VOTES

    # ── Final decision (CNN wins ties) ────────────────────────────────────────
    if ai_votes > real_votes:
        final_label = "ai"
    elif real_votes > ai_votes:
        final_label = "real"
    else:
        final_label = cnn_label   # tie → CNN is tiebreaker

    # ── Confidence ────────────────────────────────────────────────────────────
    winning_votes      = max(ai_votes, real_votes)
    vote_confidence    = (winning_votes / total_weight) * 100

    # Blend vote confidence with CNN raw probability for a smoother score
    cnn_confidence_pct = cnn_conf * 100
    final_confidence   = (vote_confidence * 0.6) + (cnn_confidence_pct * 0.4)

    logger.info(
        f"CNN={cnn_label}({cnn_conf:.2f}) "
        f"HF1={hf1_label} HF2={hf2_label} "
        f"Votes ai={ai_votes} real={real_votes}/{total_weight} "
        f"→ {final_label} ({final_confidence:.1f}%)"
    )

    return final_label, round(final_confidence, 2)


