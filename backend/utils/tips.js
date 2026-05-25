/**
 * Banco de tips aleatorios para emails de Nui.
 * Dos categorías: alimentos y entrenamiento.
 */

const FOOD_TIPS = [
  { title: "Menos ingredientes, mejor producto", body: "Si una etiqueta tiene más de 5 ingredientes y varios son nombres difíciles de pronunciar, es una señal de alto procesamiento. Preferí alimentos con listas cortas." },
  { title: "El azúcar tiene muchos nombres", body: "Jarabe de maíz, dextrosa, maltodextrina, sacarosa… son todos azúcares. Si aparecen entre los primeros ingredientes, el producto tiene un alto contenido de azúcar agregada." },
  { title: "Los ultraprocesados y la saciedad", body: "Los alimentos ultraprocesados suelen diseñarse para ser hiperapetitosos: más sal, azúcar y grasa de lo que necesitás, lo que puede dificultar escuchar las señales de hambre y saciedad." },
  { title: "Frutas y verduras: tu base segura", body: "Son naturalmente no procesadas, llenas de fibra, vitaminas y agua. Intentá que ocupen al menos la mitad de tu plato en las comidas principales." },
  { title: "Los cereales integrales sí importan", body: "Avena, arroz integral, quinoa o pan de centeno aportan fibra y se absorben más lento que sus versiones refinadas, ayudando a mantener energía estable durante el día." },
  { title: "El sodio en las etiquetas", body: "Más de 400 mg de sodio por porción empieza a ser elevado. El consumo excesivo de sodio está asociado a hipertensión. Revisá las etiquetas especialmente en snacks, fiambres y sopas instantáneas." },
  { title: "Grasas trans: a evitar", body: "Si en la etiqueta decía 'aceite vegetal parcialmente hidrogenado', tenés grasas trans. Aumentan el riesgo cardiovascular. Por suerte, muchos países ya las están prohibiendo." },
  { title: "Comer sin pantallas, una diferencia real", body: "Comer con atención (sin teléfono o TV) te ayuda a masticar mejor, notar la saciedad antes y disfrutar más la comida. Es uno de los hábitos más simples y efectivos." },
  { title: "Legumbres: las grandes olvidadas", body: "Lentejas, garbanzos, porotos y arvejas son económicos, ricos en proteínas vegetales, fibra y hierro. Son una base excelente para reemplazar parcialmente las proteínas animales." },
  { title: "El agua primero", body: "A veces lo que sentimos como hambre es en realidad sed. Antes de comer entre comidas, probá tomar un vaso de agua y esperá 10 minutos." },
  { title: "¿Qué es NOVA?", body: "La clasificación NOVA divide los alimentos en 4 grupos según su nivel de procesamiento industrial. Los grupos 3 y 4 (ultraprocesados) son los que más conviene limitar en la alimentación diaria." },
  { title: "Los lácteos no son todos iguales", body: "Un yogur natural sin azúcar agregada es muy diferente a un yogur saborizado con colorantes y edulcorantes. El primero es procesado mínimamente; el segundo puede ser ultraprocesado." },
];

const TRAINING_TIPS = [
  { title: "La consistencia gana siempre", body: "Un entrenamiento regular, aunque sea de 30 minutos, da mejores resultados a largo plazo que sesiones muy intensas pero irregulares. La clave está en la frecuencia." },
  { title: "El descanso es parte del entrenamiento", body: "Los músculos no crecen en el gym, crecen mientras descansás. Dormí entre 7 y 9 horas por noche para maximizar la recuperación y el rendimiento." },
  { title: "Progresión gradual", body: "Aumentá la carga o el volumen de a poco, no más del 10% por semana. La progresión gradual reduce el riesgo de lesiones y permite adaptaciones sostenibles." },
  { title: "El calentamiento no es opcional", body: "5-10 minutos de calentamiento dinámico activan los músculos, lubrifican las articulaciones y preparan el sistema nervioso. Evitan lesiones y mejoran el rendimiento desde la primera serie." },
  { title: "Hidratación durante el ejercicio", body: "Tomá agua antes, durante y después del entrenamiento. Incluso una deshidratación leve (2%) puede reducir el rendimiento físico de manera significativa." },
  { title: "La técnica antes que el peso", body: "Hacer un ejercicio con mala técnica y mucho peso es la receta para lesionarse. Dominá el movimiento con cargas moderadas antes de aumentar la intensidad." },
  { title: "Proteínas para la recuperación", body: "Consumir proteínas dentro de las 2 horas post-entrenamiento favorece la reparación y el crecimiento muscular. Huevos, pollo, legumbres o un yogur griego son buenas opciones." },
  { title: "El entrenamiento de fuerza también es cardio", body: "Entrenar con poco descanso entre series eleva la frecuencia cardíaca y mejora la capacidad aeróbica. No necesitás separar siempre fuerza y cardio." },
  { title: "Escuchá tu cuerpo", body: "Diferenciar fatiga normal de dolor agudo es clave. Si algo duele (no solo quema o cansa), paralo. Insistir con dolor real puede convertir una molestia leve en una lesión seria." },
  { title: "La variedad evita el estancamiento", body: "Cambiar ejercicios, ángulos o métodos de entrenamiento cada 4-6 semanas ayuda al cuerpo a seguir adaptándose. La monotonía es enemiga del progreso." },
  { title: "El timing importa menos de lo que creés", body: "Entrenés de mañana, al mediodía o de noche, los beneficios son similares. Lo más importante es encontrar el horario que podás mantener con consistencia." },
  { title: "La mente también entrena", body: "La conexión mente-músculo importa. Concentrarte en el músculo que trabajás (no solo mover el peso) mejora la activación y los resultados, especialmente en ejercicios de aislamiento." },
];

/**
 * Devuelve un tip aleatorio del banco indicado.
 * @param {"food"|"training"|"any"} category
 */
export const getRandomTip = (category = "any") => {
  const pool =
    category === "food"     ? FOOD_TIPS :
    category === "training" ? TRAINING_TIPS :
    [...FOOD_TIPS, ...TRAINING_TIPS];

  return pool[Math.floor(Math.random() * pool.length)];
};
