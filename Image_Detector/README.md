# Image_Detector — FastAPI Backend 🐍

This directory contains the complete Python backend for Deep-Detect. It exposes a REST API that accepts image uploads and returns an AI vs. Real classification result using a custom-trained PyTorch CNN.

---

## 📁 Directory Structure

```
Image_Detector/
├── app.py              # FastAPI application — server entry point, routes, CORS
├── inference.py        # Model loading, image preprocessing, prediction pipeline
├── model.py            # Custom CNN architecture (PyTorch nn.Module definition)
├── predict.py          # Standalone Tkinter desktop GUI for local inference
├── requirements.txt    # All Python package dependencies
├── models/             # Trained model weights (gitignored — download separately)
│   └── custom_cnn_standalone.pt   # TorchScript model (~103 MB)
└── notebooks/          # Jupyter notebooks for research and training
    ├── Preprocessing.ipynb         # Dataset loading, augmentation, visualization
    ├── Model_training.ipynb        # Full training loop with loss/accuracy tracking
    ├── Model_evaluation.ipynb      # Confusion matrix, ROC, per-class metrics
    └── Pretrained_Models.ipynb     # Experiments with ResNet50, EfficientNet, ViT
```

---

## ⚙️ Setup

### 1. Create Virtual Environment

```bash
cd Image_Detector

python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Dependencies:**
| Package | Version | Purpose |
|---|---|---|
| `fastapi` | ≥0.100.0 | REST API framework |
| `uvicorn` | ≥0.20.0 | ASGI server |
| `python-multipart` | ≥0.0.6 | File upload parsing |
| `torch` | ≥2.0.0 | PyTorch deep learning |
| `torchvision` | ≥0.15.0 | Image transforms |
| `pillow` | ≥9.5.0 | Image I/O |

### 3. Download Model Weights

The model file `custom_cnn_standalone.pt` is too large for GitHub (103 MB > 100 MB limit). Download it from the project's [Releases](../../../releases) page and place it at:

```
Image_Detector/models/custom_cnn_standalone.pt
```

---

## 🚀 Running the Server

```bash
python app.py
```

The server starts on **`http://0.0.0.0:8000`**. Verify it's healthy:

```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "status": "healthy",
  "api_name": "Deep-Detect Image Classification Service",
  "model_architecture": "Custom CNN Standalone (PyTorch)",
  "device_running": "cpu"
}
```

---

## 🔌 API Endpoints

### `POST /predict`

Classifies an uploaded image as AI-generated or Real.

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@/path/to/image.jpg"
```

**Success Response:**
```json
{
  "prediction": "ai",
  "confidence": 94.85,
  "status": "success"
}
```

- `prediction`: `"ai"` or `"real"`
- `confidence`: percentage confidence (0–100)

---

## 🧠 Model Details

| Property | Value |
|---|---|
| Architecture | Custom CNN (defined in `model.py`) |
| Input Size | 224 × 224 (RGB) |
| Normalization | ImageNet mean/std |
| Output | Single logit → Sigmoid → binary probability |
| Format | TorchScript (`.pt`) — runs without class definition at load time |
| Inference Device | CPU (configurable) |

**Inference Pipeline** (see [`inference.py`](inference.py)):
1. Load image bytes → convert to RGB PIL Image
2. Resize to 224×224
3. Normalize with ImageNet statistics
4. Run forward pass through TorchScript model
5. Apply Sigmoid to raw logit → confidence score
6. Threshold at 0.5: `< 0.5` → `"real"`, `≥ 0.5` → `"ai"`

---

## 🖥️ Desktop Utility

Run local inference via a GUI without starting the API server:

```bash
python predict.py
```

Opens a Tkinter window where you can browse and classify local image files directly.

---

## 📓 Notebooks

The [`notebooks/`](notebooks/) directory contains the full ML research workflow:

| Notebook | Description |
|---|---|
| [`Preprocessing.ipynb`](notebooks/Preprocessing.ipynb) | Dataset exploration, augmentation strategy, class balance analysis |
| [`Model_training.ipynb`](notebooks/Model_training.ipynb) | Custom CNN training from scratch with loss curves and checkpointing |
| [`Model_evaluation.ipynb`](notebooks/Model_evaluation.ipynb) | Confusion matrix, ROC-AUC, precision/recall metrics |
| [`Pretrained_Models.ipynb`](notebooks/Pretrained_Models.ipynb) | Transfer learning experiments: ResNet50, EfficientNet, ViT |
