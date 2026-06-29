---
title: Deep Detect Api
emoji: 🦀
colorFrom: red
colorTo: blue
sdk: docker
app_port: 7860
---
# Image_Detector - FastAPI Backend

This directory houses the PyTorch computer vision backend service for Deep-Detect. It exposes a robust FastAPI endpoint that accepts image payloads and predicts whether the image is Real or Deep-Fake (AI-generated) using a custom Convolutional Neural Network (CNN).

---

## Directory Structure

```
Image_Detector/
├── app.py              # FastAPI application - server entry point, CORS, and routes
├── inference.py        # Model loader, transform pipeline, and prediction execution
├── model.py            # Custom CNN architecture structure (PyTorch definition)
├── predict.py          # Tkinter desktop desktop utility for local file scans
├── requirements.txt    # Python module dependencies
├── models/             # Target folder for model weights (gitignored)
│   └── custom_cnn_standalone.pt
└── notebooks/          # Research and model training steps
    ├── Preprocessing.ipynb
    ├── Model_training.ipynb
    ├── Model_evaluation.ipynb
    └── Pretrained_Models.ipynb
```

---

## Technical Specifications

- **Model Framework**: PyTorch (compiled and exported as TorchScript `.pt` file).
- **Classification type**: Binary (Class 0: AI/Deep-Fake, Class 1: Real).
- **Input Dimension**: 224 x 224 pixels, 3 channels (RGB).
- **Inference logic**: Logit output -> Sigmoid function -> Probability.
- **Decision boundary**: Probability threshold of 0.5.
  - Probability > 0.5 -> Real (Class 1)
  - Probability <= 0.5 -> Deep-Fake/AI (Class 0)
- **Confidence Computation**:
  - For Real: `probability * 100`
  - For AI: `(1.0 - probability) * 100`

---

## Setup and Installation

### Prerequisites

- Python 3.10 or higher.
- pip package manager.

### Steps

1. **Activate Virtual Environment**:
   ```bash
   cd Image_Detector
   python -m venv venv
   
   # Windows (PowerShell)
   .\venv\Scripts\activate
   
   # Linux / macOS
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Provide Weight File**:
   Download `custom_cnn_standalone.pt` from the project's Releases tab and copy it into the `models` directory:
   ```
   Image_Detector/models/custom_cnn_standalone.pt
   ```

---

## Running the API Service

```bash
python app.py
```

The app will initialize and start listening on port 8000 by default.

### Health Verification

Request:
```bash
curl http://localhost:8000/
```

Expected Response:
```json
{
  "status": "healthy",
  "api_name": "Deep-Detect Image Classification Service",
  "model_architecture": "Custom CNN Standalone (PyTorch)",
  "device_running": "cpu",
  "endpoints": {
    "health_check": "/",
    "inference": "/predict"
  }
}
```

---

## API Reference

### Image Prediction Endpoint

- **Endpoint**: `/predict`
- **Method**: `POST`
- **Payload format**: `multipart/form-data`
- **Field Name**: `file` (must contain image data)

#### Success (200 OK)

```json
{
  "prediction": "ai",
  "confidence": 94.85,
  "status": "success"
}
```

#### Bad Request (400)

```json
{
  "detail": "Uploaded file must be a valid JPEG or PNG image."
}
```

---

## Standalone Desktop Interface

If you want to perform predictions locally without running the web server daemon, you can run the Tkinter GUI tool:

```bash
python predict.py
```

This launches a graphical interface to browse, view, and inspect images.
