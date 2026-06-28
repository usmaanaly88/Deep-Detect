from inference import predict_label

def predict(image_path: str) -> str:
    """
    Predict if the image is real or fake (AI-generated).

    Returns:
        str: "fake" or "real".
    """
    return predict_label(image_path)
