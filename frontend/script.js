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

    resultado.innerHTML = "<h3>🔍 Analizando imagen...</h3>";

    try{

        const response = await fetch(API_URL,{
            method:"POST",
            body:formData
        });

        const data = await response.json();

        const estadoEnvase = data.envase_correcto
            ? "Correcto y limpio"
            : "Defectuoso o roto";

        const nivelLlenado = data.botella_llena
            ? "Llena"
            : "Vacía";

        const resultadoFinal = data.producto_aprobado
            ? "Aprobado"
            : "Rechazado";

        const conclusion = data.producto_aprobado
            ? "Producto APROBADO para distribución."
            : "Producto RECHAZADO. Requiere revisión.";

        resultado.innerHTML = `
        <div class="resultado-card">

            <h2>🔍 RESULTADO DE INSPECCIÓN</h2>

            <p>
                <strong>Estado del envase:</strong>
                ${estadoEnvase}
                |
                <strong>Confianza:</strong>
                ${(data.prob_envase * 100).toFixed(2)}%
            </p>

            <p>
                <strong>Nivel de llenado:</strong>
                ${nivelLlenado}
                |
                <strong>Confianza:</strong>
                ${(data.prob_botella * 100).toFixed(2)}%
            </p>

            <p>
                <strong>Resultado final:</strong>
                ${resultadoFinal}
                |
                <strong>Confianza:</strong>
                ${(data.prob_producto * 100).toFixed(2)}%
            </p>

            <hr>

            <p>
                <strong>Conclusión:</strong>
                ${conclusion}
            </p>

        </div>
        `;

    }catch(error){

        resultado.innerHTML = `
            <p style="color:red;">
                Error al conectar con la API.
            </p>
        `;

        console.error(error);
    }
}