export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { userData, productText } = req.body;

  if (!userData || !productText) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const prompt = `
Rol:

Actuá como un nutricionista experto en alimentación saludable, con formación avanzada y actualización continua basada en evidencia científica y guías nutricionales europeas (EFSA, OMS Europa, dieta mediterránea).

1️⃣ Recolección de datos del usuario:
Sexo: ${userData.sexo}
Edad: ${userData.edad}
Nivel de actividad física: ${userData.actividad}
Peso: ${userData.peso} kg
Altura: ${userData.altura} cm

2️⃣ Producto recibido (ingredientes + tabla nutricional):
${productText}

3️⃣ Metodología de evaluación:
- Nivel de procesamiento (clasificación tipo NOVA)
- Calidad y origen de los ingredientes
- Perfil nutricional: sodio, grasas totales y saturadas, azúcares, proteínas, fibra
- Uso de aditivos, conservantes o aromatizantes
- Adecuación a una dieta equilibrada y al perfil del usuario

4️⃣ Sistema de puntuación (de 0 a 100):
🥗 Calidad de ingredientes: 30%
🏭 Nivel de procesamiento: 20%
📊 Perfil nutricional: 40%
👤 Adecuación al perfil del usuario: 10%

5️⃣ Formato de salida:
A. Clasificación: ¿Ultraprocesado? Sí / No + Categoría
B. Puntaje global: XX / 100
C. Interpretación: frecuencia recomendada y contexto ideal de consumo

6️⃣ Escala:
90–100 → Muy recomendable
75–89 → Recomendable
60–74 → Aceptable
45–59 → Poco recomendable
<45 → No recomendable

✅ Resultado:
Devolvé un análisis objetivo, sin prejuicios ni alarmismo, comprensible para usuarios no expertos. Que pueda mostrarse como barra de progreso, semáforo nutricional o texto.

`;

  try {
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4", // podés usar "gpt-3.5-turbo" si querés algo más económico
        messages: [
          { role: "system", content: "Sos un nutricionista experto." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await completion.json();

    const analysis = data.choices?.[0]?.message?.content || "No se obtuvo respuesta";

    res.status(200).json({ analysis });

  } catch (error) {
    console.error("Error al llamar a OpenAI:", error);
    res.status(500).json({ error: "Error al generar análisis" });
  }
}
