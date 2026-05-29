/**
 * generateImage — genera imagen con gpt-image-1-mini (b64_json).
 * GPT Image devuelve base64, no URL.
 */
export const generateImage = async (openai, { prompt, size = "1024x1024" }) => {
  const result = await openai.images.generate({
    model: "gpt-image-2-2026-04-21",
    prompt,
    size,
  });

  const base64 = result.data?.[0]?.b64_json;
  if (!base64) throw new Error("OpenAI no devolvió b64_json.");

  console.log("✅ Imagen generada con gpt-image-2-2026-04-21");
  return { imageUrl: `data:image/png;base64,${base64}` };
};
