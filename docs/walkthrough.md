# Walkthrough - Deep-Detect Integration

This document outlines the modifications made to the project, verification results, and step-by-step instructions to run the backend and frontend on your physical device.

---

## 🛠️ Changes Made

### 1. Backend API & Inference (`Image_Detector/`)
* **[inference.py](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/Image_Detector/inference.py)**:
  * Redirected model loader to use `models/custom_cnn_standalone.pt`.
  * Removed non-existent `model_meta.json` dependencies.
  * Configured standard ImageNet Normalization (`mean = [0.485, 0.456, 0.406]`, `std = [0.229, 0.224, 0.225]`) and image resize parameters (`224x224`).
  * Updated class labels: mapped output probabilities to `"real"` and `"ai"` (previously returned `"fake"`) to align with frontend expectations.
* **[app.py](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/Image_Detector/app.py)**:
  * Added CORS Middleware configuration.
  * Added a health check `/` route.
  * Standardized logging format.
  * Implemented validation and error handling for image uploads.
* **[model.py](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/Image_Detector/model.py)**:
  * Updated docstrings to document return labels as `"ai"` or `"real"`.
* **[predict.py](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/Image_Detector/predict.py)**:
  * Updated class label checking to check if the prediction is `"fake"` or `"ai"` to remain backward compatible.
* **[requirements.txt](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/Image_Detector/requirements.txt)**:
  * Created the python dependencies list.

### 2. Project Documentation & Design
* **[README.md (root)](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/README.md)**:
  * Designed a high-quality readme containing System Architecture (Mermaid diagram), backend/frontend installation, tunneling, and API documentation.
* **[README.md (Image_Detector)](file:///c:/Users/USMAN-PC/OneDrive/Desktop/Deep-Detect/Image_Detector/README.md)**:
  * Documented deep learning details, layer-by-layer specifications of the Custom CNN model, training metrics, and folder layouts.

---

## 🔬 Integration Verification

We created a scratch script [verify_model.py](file:///C:/Users/USMAN-PC/.gemini/antigravity-ide/brain/0b719dab-7e7d-4204-8a6c-67f3f39fe748/scratch/verify_model.py) and ran it inside the virtual environment.

### Command Execution:
```bash
.\venv\Scripts\python.exe C:\Users\USMAN-PC\.gemini\antigravity-ide\brain\0b719dab-7e7d-4204-8a6c-67f3f39fe748\scratch\verify_model.py
```

### Execution Log output:
```text
INFO:inference:Using device: cpu for inference.
INFO:inference:Loading TorchScript model from c:\Users\USMAN-PC\OneDrive\Desktop\Deep-Detect\Image_Detector\models\custom_cnn_standalone.pt...
INFO:inference:Model loaded successfully and set to evaluation mode.
Model Path resolved in inference.py: c:\Users\USMAN-PC\OneDrive\Desktop\Deep-Detect\Image_Detector\models\custom_cnn_standalone.pt
Device in use: cpu

Loading model via torch.jit.load...
SUCCESS: Standalone TorchScript model loaded successfully.

Testing inference on dummy input...
Dummy inference successful! Output logit: -0.3121, Sigmoid probability: 0.4226

Testing inference on real image: c:\Users\USMAN-PC\OneDrive\Desktop\Deep-Detect\Image_Detector\images\WhatsApp Image 2026-06-28 at 11.22.35 AM (1).jpeg
SUCCESS! Prediction: real (Confidence: 84.92%)
```
> [!TIP]
> The verification confirms that the standalone TorchScript model loads successfully on the CPU and is capable of running correct inference outputs.

---

## 🚀 How to Run the End-to-End System

To run the backend server and display the mobile app on your physical phone, follow these steps:

### Phase 1: Run the Backend
Open a terminal in the `Image_Detector` directory:
1. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\activate
   ```
2. Start the FastAPI server:
   ```bash
   python app.py
   ```

### Phase 2: Start Local Tunneling (Ngrok)
To allow a physical mobile device to connect to your local computer's server, run `ngrok`:
1. Start ngrok on port 8000:
   ```bash
   ngrok http 8000
   ```
2. Copy the generated public URL (e.g. `https://xxxx-xxxx.ngrok-free.dev`).
3. Open `DeepDetectMobile/src/config/config.ts` and set `BASE_URL`:
   ```typescript
   export const BASE_URL = "https://xxxx-xxxx.ngrok-free.dev"
   ```

### Phase 3: Run the React Native Mobile App
Open another terminal in the `DeepDetectMobile` directory:
1. Connect your physical phone via USB:
   * **Android**: Enable **USB Debugging** in Developer Options.
   * **iOS**: Enable **Developer Mode** under Settings > Privacy & Security.
2. Build and launch the mobile client:
   * Start Metro server:
     ```bash
     npm start
     ```
   * Install and launch on device (keep your device connected via USB):
     * For **Android**:
       ```bash
       npm run android
       ```
     * For **iOS** (macOS only):
       ```bash
       cd ios && pod install && cd .. && npm run ios
       ```
3. Once the app starts building, it will deploy directly to your physical phone screen. You can scan images, send predictions to the local backend, and view history!
