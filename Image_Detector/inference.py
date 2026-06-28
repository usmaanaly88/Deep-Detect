import io
import os
import logging
import torch
from PIL import Image
from torchvision import transforms

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("inference")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Note: The folder is "models", and model is "custom_cnn_standalone.pt"
MODEL_PATH = os.path.join(BASE_DIR, "models", "custom_cnn_standalone.pt")

# GPU/CPU Device mapping
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"Using device: {device} for inference.")

# Hyperparameters matching the Custom CNN Standalone training
IMG_SIZE = 224
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]
OPTIMAL_THRESHOLD = 0.5

# Image Preprocessing Transformation Pipeline
transform = transforms.Compose(
    [
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=MEAN, std=STD),
    ]
)

# Load the compiled TorchScript model
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")

try:
    logger.info(f"Loading TorchScript model from {MODEL_PATH}...")
    model = torch.jit.load(MODEL_PATH, map_location=device)
    model.eval()
    logger.info("Model loaded successfully and set to evaluation mode.")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    raise e


def _predict_probability(image: Image.Image) -> float:
    """
    Pass the preprocessed image through the loaded Custom CNN model.
    Applies Sigmoid to the output logit to compute probability.
    """
    input_tensor = transform(image.convert("RGB")).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(input_tensor)
        # Apply sigmoid since model outputs a single class raw logit
        probability = torch.sigmoid(output).item()
        return probability


def _load_image(image_source: str | bytes | Image.Image) -> Image.Image:
    """
    Load an image from filepath, raw bytes, or an existing PIL Image.
    """
    if isinstance(image_source, Image.Image):
        return image_source
    if isinstance(image_source, bytes):
        return Image.open(io.BytesIO(image_source))
    return Image.open(image_source)


def predict_label(image_source: str | bytes | Image.Image) -> str:
    """
    Predict if the image is 'real' or 'ai'.
    """
    image = _load_image(image_source)
    probability = _predict_probability(image)
    return "real" if probability > OPTIMAL_THRESHOLD else "ai"


def predict_with_confidence(image_source: str | bytes | Image.Image) -> tuple[str, float]:
    """
    Predict if the image is 'real' or 'ai' and return the confidence percentage.
    
    If probability > 0.5: Class 1 (real). Confidence is probability * 100
    If probability <= 0.5: Class 0 (ai). Confidence is (1.0 - probability) * 100
    """
    image = _load_image(image_source)
    probability = _predict_probability(image)

    if probability > OPTIMAL_THRESHOLD:
        return "real", probability * 100

    return "ai", (1.0 - probability) * 100
