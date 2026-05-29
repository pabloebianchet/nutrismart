/**
 * generateImage — intenta generar una imagen probando modelos en orden.
 * Saltea 403 (sin acceso al modelo) y pasa al siguiente.
 * Lanza error en cualquier otro fallo.
 */

// Orden de preferencia: del más nuevo al más viejo
const IMAGE_MODELS = ["gpt-image-1-mini", "gpt-image-1", "dall-e-3"];

export const generateImage = async (openai, { prompt, size = "1024x1024" }) => {
  let lastError = null;

  for (const model of IMAGE_MODELS) {
    try {
      const params = { model, prompt, n: 1 };

      if (model.startsWith("gpt-image")) {
        // gpt-image-* acepta tamaños flexibles y quality low/medium/high
        params.size              = size;
        params.quality           = "medium";
        params.output_format     = "jpeg";
        params.output_compression = 80;
      } else {
        // dall-e-3: solo acepta 1024x1024, 1792x1024, 1024x1792
        params.size    = size === "1536x1024" ? "1792x1024" : "1024x1024";
        params.quality = "standard";
      }

      const response = await openai.images.generate(params);
      const item     = response.data?.[0];
      const imageUrl = item?.url
        ?? (item?.b64_json ? `data:image/${model.startsWith("gpt-image") ? "jpeg" : "png"};base64,${item.b64_json}` : null);

      if (!imageUrl) throw new Error("La API no devolvió imagen.");

      console.log(`✅ Imagen generada con ${model}`);
      return { imageUrl, model };

    } catch (err) {
      lastError = err;
      const is403 = err?.status === 403
        || err?.message?.includes("does not have access")
        || err?.message?.includes("does not exist");

      if (is403) {
        console.warn(`⚠️  Modelo ${model} no disponible, probando siguiente...`);
        continue;
      }
      // Cualquier otro error (400 parámetro incorrecto, 500, etc.) → fallar ya
      throw err;
    }
  }

  // Todos los modelos fallaron por 403
  const msg = lastError?.message || "Sin acceso a modelos de imagen";
  throw Object.assign(new Error(msg), { status: 403, allModelsFailed: true });
};
