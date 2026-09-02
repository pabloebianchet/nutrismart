/**
 * Banco de tips aleatorios para emails de Nui.
 * Dos categorías: alimentos y entrenamiento. Bilingüe (es/en).
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

const FOOD_TIPS_EN = [
  { title: "Fewer ingredients, better product", body: "If a label has more than 5 ingredients and several are hard-to-pronounce names, that's a sign of heavy processing. Favor foods with short lists." },
  { title: "Sugar has many names", body: "Corn syrup, dextrose, maltodextrin, sucrose… they're all sugar. If they show up among the first ingredients, the product has a high added-sugar content." },
  { title: "Ultra-processed foods and satiety", body: "Ultra-processed foods are often engineered to be hyper-palatable: more salt, sugar, and fat than you need, which can make it harder to notice hunger and fullness cues." },
  { title: "Fruits and vegetables: your safe base", body: "They're naturally unprocessed, full of fiber, vitamins, and water. Try to make them at least half of your plate at main meals." },
  { title: "Whole grains really do matter", body: "Oats, brown rice, quinoa, or rye bread provide fiber and are absorbed more slowly than their refined versions, helping keep your energy steady through the day." },
  { title: "Sodium on labels", body: "More than 400 mg of sodium per serving starts to be high. Excess sodium intake is linked to hypertension. Check labels especially on snacks, deli meats, and instant soups." },
  { title: "Trans fats: avoid them", body: "If the label says 'partially hydrogenated vegetable oil,' you're looking at trans fats. They raise cardiovascular risk. Thankfully, many countries are already banning them." },
  { title: "Eating without screens makes a real difference", body: "Mindful eating (no phone or TV) helps you chew better, notice fullness sooner, and enjoy your food more. It's one of the simplest, most effective habits." },
  { title: "Legumes: the great forgotten food", body: "Lentils, chickpeas, beans, and peas are inexpensive, rich in plant protein, fiber, and iron. They're an excellent base for partially replacing animal protein." },
  { title: "Water first", body: "Sometimes what feels like hunger is actually thirst. Before eating between meals, try drinking a glass of water and waiting 10 minutes." },
  { title: "What is NOVA?", body: "The NOVA classification splits foods into 4 groups by their level of industrial processing. Groups 3 and 4 (ultra-processed) are the ones most worth limiting in your daily diet." },
  { title: "Not all dairy is the same", body: "A plain yogurt with no added sugar is very different from a flavored yogurt with dyes and sweeteners. The first is minimally processed; the second can be ultra-processed." },
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

const TRAINING_TIPS_EN = [
  { title: "Consistency always wins", body: "Training regularly, even for just 30 minutes, gives better long-term results than very intense but irregular sessions. Frequency is the key." },
  { title: "Rest is part of training", body: "Muscles don't grow at the gym, they grow while you rest. Sleep 7 to 9 hours a night to maximize recovery and performance." },
  { title: "Gradual progression", body: "Increase load or volume little by little, no more than 10% per week. Gradual progression reduces injury risk and allows for sustainable adaptations." },
  { title: "Warming up isn't optional", body: "5-10 minutes of dynamic warm-up activate your muscles, lubricate your joints, and prep your nervous system. It prevents injuries and improves performance from the first set." },
  { title: "Hydration during exercise", body: "Drink water before, during, and after training. Even mild dehydration (2%) can significantly reduce physical performance." },
  { title: "Technique before weight", body: "Doing an exercise with bad form and heavy weight is a recipe for injury. Master the movement with moderate loads before increasing intensity." },
  { title: "Protein for recovery", body: "Eating protein within 2 hours post-workout supports muscle repair and growth. Eggs, chicken, legumes, or Greek yogurt are good options." },
  { title: "Strength training is cardio too", body: "Training with short rest between sets raises your heart rate and improves aerobic capacity. You don't always need to separate strength and cardio." },
  { title: "Listen to your body", body: "Telling normal fatigue apart from sharp pain is key. If something hurts (not just burns or tires), stop. Pushing through real pain can turn a minor issue into a serious injury." },
  { title: "Variety prevents plateaus", body: "Changing exercises, angles, or training methods every 4-6 weeks helps your body keep adapting. Monotony is the enemy of progress." },
  { title: "Timing matters less than you think", body: "Whether you train in the morning, midday, or at night, the benefits are similar. The most important thing is finding a schedule you can stick to consistently." },
  { title: "Your mind trains too", body: "The mind-muscle connection matters. Focusing on the muscle you're working (not just moving the weight) improves activation and results, especially in isolation exercises." },
];

/**
 * Devuelve un tip aleatorio del banco indicado.
 * @param {"food"|"training"|"any"} category
 * @param {"es"|"en"} lang
 */
export const getRandomTip = (category = "any", lang = "es") => {
  const isEN = lang === "en";
  const food = isEN ? FOOD_TIPS_EN : FOOD_TIPS;
  const training = isEN ? TRAINING_TIPS_EN : TRAINING_TIPS;

  const pool =
    category === "food"     ? food :
    category === "training" ? training :
    [...food, ...training];

  return pool[Math.floor(Math.random() * pool.length)];
};
