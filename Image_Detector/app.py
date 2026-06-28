from fastapi import FastAPI, UploadFile, File
from inference import predict_with_confidence

app = FastAPI()

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    label, confidence = predict_with_confidence(image_bytes)

    return {
        "prediction": label,
        "confidence": round(confidence, 2),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
