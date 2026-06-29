import tkinter as tk
from tkinter import filedialog, Label, Button
from PIL import Image, ImageTk
from model import predict

root = tk.Tk()
root.title("AI vs Real Image Detector")
root.geometry("600x500")

def upload_image():
    file_path = filedialog.askopenfilename(
        filetypes=[("Image files", "*.jpg;*.jpeg;*.png")]
    )
    if not file_path:
        return

    # Display image
    img = Image.open(file_path)
    img_resized = img.resize((300, 300))
    img_tk = ImageTk.PhotoImage(img_resized)
    label_image.config(image=img_tk)
    label_image.image = img_tk

    # Predict
    label = predict(file_path)
    result_text = "Deep-Fake" if label.lower() in ("fake", "ai") else "Real"
    label_result.config(text=f"Prediction: {result_text}")

btn_upload = Button(root, text="Upload Image", command=upload_image)
btn_upload.pack(pady=20)

label_image = Label(root)
label_image.pack()

label_result = Label(root, text="Prediction: ", font=("Arial", 16))
label_result.pack(pady=20)

root.mainloop()
