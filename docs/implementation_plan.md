# Implementation Plan - Custom CNN Standalone Model Integration & Professional Refactoring

This plan details the steps to integrate the new TorchScript standalone model (`custom_cnn_standalone.pt`) into the FastAPI backend, resolve compatibility issues with the React Native frontend, refactor the code to professional industry standards, and write comprehensive end-to-end documentation.

## User Review Required

> [!IMPORTANT]
> The current mobile frontend expects `"ai"` or `"real"` from the backend, but the previous backend was configured to return `"fake"` or `"real"`. We will standardize the backend to return `"ai"` or `"real"` to fix this bug.
> 
> The PyTorch library is not installed in the global Python environment. We will document how to set up a virtual environment and install the required dependencies (which are listed in `requirements.txt`).

## Open Questions

None. The integration is straightforward: the new model is in TorchScript format and uses the same 224x224 input shape and normalization as typical ResNet architectures.

---

## Proposed Changes

### Backend Component

Refactoring the FastAPI backend to load the custom TorchScript model and follow production-grade practices.

#### [MODIFY] [inference.py](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/Image_Detector/inference.py)
* Update `MODEL_PATH` to point to `models/custom_cnn_standalone.pt`.
* Remove loading of `model_meta.json` (which does not exist) and instead hardcode/use configuration variables for 224x224 size and standard ImageNet normalization.
* Change prediction classes from `"fake"` to `"ai"` to match frontend expectations.
* Optimize image loading and error handling.

#### [MODIFY] [app.py](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/Image_Detector/app.py)
* Add CORS Middleware (crucial for local development with mobile devices/web apps).
* Add a root URL `/` for health check and API metadata.
* Implement structured logging.
* Add exception handlers to return standard JSON responses when image processing fails.

#### [MODIFY] [predict.py](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/Image_Detector/predict.py)
* Update label checking to support both `"fake"` and `"ai"` as AI-generated signals for the Tkinter desktop GUI.

#### [NEW] [requirements.txt](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/Image_Detector/requirements.txt)
* Define the python dependencies: `fastapi`, `uvicorn`, `python-multipart`, `torch`, `torchvision`, `pillow`.

---

### Documentation Component

Transforming the codebase into a professional, industry-standard project with complete documentation.

#### [MODIFY] [README.md (root)](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/README.md)
* Write a professional markdown description of the Deep-Detect project.
* Include a System Architecture Diagram using Mermaid.
* Document backend installation, configuration, and execution instructions.
* Document frontend mobile app installation, connection (via ngrok), and running instructions on physical devices (including USB debugging setup).
* Provide API contracts (request/response schemas).

#### [NEW] [README.md (Image_Detector)](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/Image_Detector/README.md)
* Document the Deep Learning model details, training hyperparameters, Custom CNN architecture layers, and dataset details.

---

## Verification Plan

### Automated Tests
* Run a Python test script `verify_model.py` to ensure the TorchScript model loads successfully and makes correct inference on dummy tensors and actual images.

### Manual Verification
* Start the FastAPI backend and test the `/predict` endpoint using `curl` or PowerShell `Invoke-WebRequest`.
* Launch the Metro bundler and run the React Native application, verifying connection and prediction display.
