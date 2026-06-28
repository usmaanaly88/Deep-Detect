import io
import json
import os

import torch
from PIL import Image
from torchvision import transforms

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "resnet50.pt")
META_PATH = os.path.join(BASE_DIR, "model", "model_meta.json")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

with open(META_PATH, "r") as meta_file:
    meta = json.load(meta_file)

optimal_threshold = meta.get("optimal_threshold", 0.5)
img_size = meta.get("img_size", 224)
mean = meta.get("mean", [0.485, 0.456, 0.406])
std = meta.get("std", [0.229, 0.224, 0.225])

transform = transforms.Compose(
    [
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ]
)

model = torch.jit.load(MODEL_PATH, map_location=device)
model.eval()


def _predict_probability(image: Image.Image) -> float:
    input_tensor = transform(image.convert("RGB")).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(input_tensor)
        return torch.sigmoid(output).item()


def _load_image(image_source: str | bytes | Image.Image) -> Image.Image:
    if isinstance(image_source, Image.Image):
        return image_source
    if isinstance(image_source, bytes):
        return Image.open(io.BytesIO(image_source))
    return Image.open(image_source)


def predict_label(image_source: str | bytes | Image.Image) -> str:
    image = _load_image(image_source)
    probability = _predict_probability(image)
    return "real" if probability > optimal_threshold else "fake"


def predict_with_confidence(image_source: str | bytes | Image.Image) -> tuple[str, float]:
    image = _load_image(image_source)
    probability = _predict_probability(image)

    if probability > optimal_threshold:
        return "real", probability * 100

    return "fake", (1.0 - probability) * 100
