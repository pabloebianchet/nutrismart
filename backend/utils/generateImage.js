/**
 * generateImage — prueba modelos de imagen de OpenAI en orden.
 * Saltea errores de acceso (403 / model not found) y pasa al siguiente.
 * Si todos fallan, lanza error.
 *
 * Para habilitar los modelos: platform.openai.com →
 * Settings → Organization → Verification
 */

const IMAGE_MODELS = ["gpt-image-1-mini", "gpt-image-1", "dall-e-3"];

const isAccessError = (err) =>
  err?.status === 403
  || err?.message?.includes("does not have access")
  || err?.message?.includes("does not exist")
  || err?.message?.includes("organization verification");

export const generateImage = async (openai, { prompt, size = "1024x1024" }) => {
  let lastError = null;

  for (const model of IMAGE_MODELS) {
    try {
      const params = { model, prompt, n: 1 };

      if (model.startsWith("gpt-image")) {
        params.size               = size;
        params.quality            = "medium";
        params.output_format      = "jpeg";
        params.output_compression = 80;
      } else {
        params.size    = size === "1536x1024" ? "1792x1024" : "1024x1024";
        params.quality = "standard";
      }

      const response = await openai.images.generate(params);
      const item     = response.data?.[0];
      const imageUrl = item?.url
        ?? (item?.b64_json
          ? `data:image/${model.startsWith("gpt-image") ? "jpeg" : "png"};base64,${item.b64_json}`
          : null);

      if (!imageUrl) throw new Error("La API no devolvió imagen.");

      console.log(`✅ Imagen generada con ${model}`);
      return { imageUrl, model };

    } catch (err) {
      lastError = err;
      if (isAccessError(err)) {
        console.warn(`⚠️  ${model} no disponible, probando siguiente...`);
        continue;
      }
      throw err;
    }
  }

  const msg = lastError?.message || "Sin acceso a modelos de imagen";
  throw Object.assign(new Error(msg), { status: 403, allModelsFailed: true });
};
