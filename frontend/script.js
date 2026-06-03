const API_URL = "https://proyecto-limpiausos.onrender.com/predict";

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if(file){

        preview.src = URL.createObjectURL(file);

        preview.style.display = "block";
    }

});

async function enviarImagen(){

    const file = imageInput.files[0];

    if(!file){
        alert("Selecciona una imagen");
        return;
    }

    const formData = new FormData();

    formData.append("file", file);

    const resultado = document.getElementById("resultado");

    resultado.innerHTML = "Analizando imagen...";

    try{

        const response = await fetch(API_URL,{
            method:"POST",
            body:formData
        });

        const data = await response.json();

        resultado.innerHTML = `
            <h3>Resultado</h3>

            <p><b>Envase correcto:</b> ${data.envase_correcto}</p>

            <p><b>Botella llena:</b> ${data.botella_llena}</p>

            <p><b>Producto aprobado:</b> ${data.producto_aprobado}</p>

            <hr>

            <p>Probabilidad envase:
            ${(data.prob_envase*100).toFixed(2)}%</p>

            <p>Probabilidad llenado:
            ${(data.prob_botella*100).toFixed(2)}%</p>

            <p>Probabilidad aprobación:
            ${(data.prob_producto*100).toFixed(2)}%</p>
        `;

    }catch(error){

        resultado.innerHTML =
        "<p>Error al conectar con la API</p>";

        console.error(error);
    }
}