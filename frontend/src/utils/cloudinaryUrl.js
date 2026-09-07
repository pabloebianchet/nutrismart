/**
 * Inserta una transformación de Cloudinary (formato + calidad automáticos,
 * ancho máximo) en una URL ya subida — sin esto se sirve el archivo
 * original a resolución completa sin importar el tamaño en pantalla.
 * Encontrado en vivo: el 92% del gasto de la cuenta de Cloudinary era
 * ancho de banda, con un promedio de ~1.5MB por imagen entregada, para
 * imágenes que en pantalla ocupan una fracción de eso.
 *
 * No modifica el archivo original ni lo que está guardado en la base —
 * solo agrega el segmento de transformación a la URL en el momento de
 * mostrarla; Cloudinary genera y cachea la versión liviana la primera vez
 * que se pide esa combinación de ancho.
 *
 * Pasa intacta cualquier URL que no sea de Cloudinary (ej. fotos de perfil
 * de Google, `lh3.googleusercontent.com`).
 */
export const cldResize = (url, width) => {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};
