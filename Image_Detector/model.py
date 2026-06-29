from inference import predict_label

def predict(image_path: str) -> str:
    """
    Predict if the image is real or Deep-Fake.

    Args:
        image_path (str): Absolute or relative path to the image file.

    Returns:
        str: "ai" or "real".
    """
    return predict_label(image_path)
