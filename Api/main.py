from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

from PIL import Image
import numpy as np
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "model/modelo_limpiausos_calidad_imagenes.keras"

modelo = load_model(MODEL_PATH)

IMG_SIZE = (224, 224)

@app.get("/")
def home():
    return {
        "mensaje": "API LIMPIAUSOS funcionando"
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    contents = await file.read()

    imagen = Image.open(io.BytesIO(contents))
    imagen = imagen.convert("RGB")
    imagen = imagen.resize(IMG_SIZE)

    img_array = np.array(imagen)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)

    predicciones = modelo.predict(img_array)

    envase = float(predicciones[0][0][0])
    botella = float(predicciones[1][0][0])
    producto = float(predicciones[2][0][0])

    return {
        "envase_correcto": envase > 0.5,
        "prob_envase": round(envase, 4),

        "botella_llena": botella > 0.5,
        "prob_botella": round(botella, 4),

        "producto_aprobado": producto > 0.5,
        "prob_producto": round(producto, 4)
    }