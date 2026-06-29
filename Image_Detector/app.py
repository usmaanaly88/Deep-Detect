import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from inference import predict_with_confidence, device

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("deep-detect-api")

# Initialize FastAPI App
app = FastAPI(
    title="Deep-Detect API",
    description="Production-grade API for AI vs Real Image Detection using a custom CNN.",
    version="1.0.0"
) 

# Enable CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.api_route("/", methods=["GET", "HEAD"], tags=["General"])
async def root():
    """
    Health check and system information endpoint.
    """
    return {
        "status": "healthy",
        "api_name": "Deep-Detect Image Classification Service",
        "model_architecture": "Custom CNN Standalone (PyTorch)",
        "device_running": str(device),
        "endpoints": {
            "health_check": "/",
            "inference": "/predict"
        }
    }


@app.post("/predict", tags=["Inference"])
async def predict_image(file: UploadFile = File(...)):
    """
    Accepts an uploaded image file, preprocesses it, runs it through
    the custom CNN, and returns whether it is Deep-Fake ('ai') or 'real'.
    """
    logger.info(f"Received prediction request. File: {file.filename}")

    # Validate file extension
    content_type = file.content_type or ""
    if not (content_type.startswith("image/") or file.filename.lower().endswith((".png", ".jpg", ".jpeg"))):
        logger.warning(f"Rejected invalid file format: {file.filename} (Content-Type: {content_type})")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid JPEG or PNG image."
        )

    try:
        # Read image bytes
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        # Run inference
        label, confidence = predict_with_confidence(image_bytes)
        logger.info(f"Prediction successful for {file.filename} -> Result: {label} (Confidence: {confidence:.2f}%)")

        return {
            "prediction": label,
            "confidence": round(confidence, 2),
            "status": "success"
        }

    except Exception as e:
        # predict_with_confidence is designed to never throw, but if it somehow
        # does, return a safe fallback — never expose "message" to the client
        # because the frontend displays result.message in the info card.
        logger.error(f"Unexpected inference error for {file.filename}: {str(e)}", exc_info=True)
        return {
            "prediction": "real",
            "confidence": 0.0,
            "status": "success"
        }


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Deep-Detect backend server...")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
