// ~250 ejercicios organizados por tipo de plan, lugar y grupo muscular

export const EXERCISES = [

  // ─── HIPERTROFIA — PECHO ───────────────────────────────────────
  { name: "Press de banca plano",        tipos: ["Hipertrofia","Fit"], lugares: ["Gym"], muscleGroup: "pecho",    equipment: ["barra","banco"], tags: ["pecho","press","banca","barra"] },
  { name: "Press de banca inclinado",    tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "pecho",    equipment: ["barra","banco inclinado"], tags: ["pecho","press","inclinado"] },
  { name: "Press de banca declinado",    tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "pecho",    equipment: ["barra","banco declinado"], tags: ["pecho","press","declinado"] },
  { name: "Press de pecho con mancuernas", tipos: ["Hipertrofia","Fit"], lugares: ["Gym","Casa"], muscleGroup: "pecho", equipment: ["mancuernas","banco"], tags: ["pecho","press","mancuernas"] },
  { name: "Aperturas con mancuernas",    tipos: ["Hipertrofia"],       lugares: ["Gym","Casa"], muscleGroup: "pecho", equipment: ["mancuernas","banco"], tags: ["pecho","aperturas","mancuernas"] },
  { name: "Cruces en polea",             tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "pecho",    equipment: ["polea"], tags: ["pecho","cruces","polea","cable"] },
  { name: "Pec deck",                    tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "pecho",    equipment: ["maquina"], tags: ["pecho","maquina","pec deck"] },
  { name: "Fondos para pecho",           tipos: ["Hipertrofia","Calistenia"], lugares: ["Gym","Aire libre"], muscleGroup: "pecho", equipment: ["paralelas"], tags: ["pecho","fondos","paralelas"] },
  { name: "Pull over con mancuerna",     tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "pecho",    equipment: ["mancuerna","banco"], tags: ["pecho","espalda","pullover"] },

  // ─── HIPERTROFIA — ESPALDA ─────────────────────────────────────
  { name: "Jalón al pecho",              tipos: ["Hipertrofia","Fit"], lugares: ["Gym"], muscleGroup: "espalda",  equipment: ["polea alta"], tags: ["espalda","jalon","dorsal","polea"] },
  { name: "Jalón tras nuca",             tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "espalda",  equipment: ["polea alta"], tags: ["espalda","jalon","dorsal"] },
  { name: "Remo con barra",              tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "espalda",  equipment: ["barra"], tags: ["espalda","remo","barra"] },
  { name: "Remo con mancuerna",          tipos: ["Hipertrofia","Fit"], lugares: ["Gym","Casa"], muscleGroup: "espalda", equipment: ["mancuerna","banco"], tags: ["espalda","remo","mancuerna"] },
  { name: "Remo en polea baja",          tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "espalda",  equipment: ["polea baja"], tags: ["espalda","remo","polea","cable"] },
  { name: "Remo en máquina",             tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "espalda",  equipment: ["maquina"], tags: ["espalda","remo","maquina"] },
  { name: "Peso muerto convencional",    tipos: ["Hipertrofia","Fit"], lugares: ["Gym"], muscleGroup: "espalda",  equipment: ["barra"], tags: ["espalda","peso muerto","barra","compuesto"] },
  { name: "Peso muerto rumano",          tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "espalda",  equipment: ["barra","mancuernas"], tags: ["espalda","isquiotibiales","peso muerto"] },
  { name: "Hiperextensiones de espalda", tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "espalda",  equipment: ["banco roman"], tags: ["espalda","lumbar","hiperextension"] },

  // ─── HIPERTROFIA — PIERNAS ─────────────────────────────────────
  { name: "Sentadilla con barra",        tipos: ["Hipertrofia","Fit"], lugares: ["Gym"], muscleGroup: "piernas",  equipment: ["barra","rack"], tags: ["piernas","sentadilla","cuadriceps","compuesto"] },
  { name: "Prensa de piernas",           tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "piernas",  equipment: ["maquina prensa"], tags: ["piernas","prensa","cuadriceps","maquina"] },
  { name: "Extensión de cuádriceps",     tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "piernas",  equipment: ["maquina"], tags: ["piernas","cuadriceps","extension","maquina"] },
  { name: "Curl de isquiotibiales",      tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "piernas",  equipment: ["maquina"], tags: ["piernas","isquiotibiales","curl","maquina"] },
  { name: "Sentadilla búlgara",          tipos: ["Hipertrofia","Fit"], lugares: ["Gym","Casa"], muscleGroup: "piernas", equipment: ["mancuernas","banco"], tags: ["piernas","sentadilla","bulgara","unilateral"] },
  { name: "Zancada con mancuernas",      tipos: ["Hipertrofia","Fit","Ejercicio en Casa"], lugares: ["Gym","Casa"], muscleGroup: "piernas", equipment: ["mancuernas"], tags: ["piernas","zancada","mancuernas"] },
  { name: "Elevación de talones de pie", tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "piernas",  equipment: ["maquina","escalon"], tags: ["gemelos","elevacion","talones"] },
  { name: "Sentadilla Hack",             tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "piernas",  equipment: ["maquina hack"], tags: ["piernas","cuadriceps","hack","maquina"] },
  { name: "Peso muerto sumo",            tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "piernas",  equipment: ["barra"], tags: ["piernas","gluteos","sumo","peso muerto"] },

  // ─── HIPERTROFIA — GLÚTEOS ─────────────────────────────────────
  { name: "Hip thrust con barra",        tipos: ["Hipertrofia","Fit"], lugares: ["Gym"], muscleGroup: "gluteos",  equipment: ["barra","banco"], tags: ["gluteos","hip thrust","barra"] },
  { name: "Hip thrust con mancuerna",    tipos: ["Hipertrofia","Ejercicio en Casa"], lugares: ["Gym","Casa"], muscleGroup: "gluteos", equipment: ["mancuerna"], tags: ["gluteos","hip thrust","mancuerna"] },
  { name: "Patada de glúteo en polea",   tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "gluteos",  equipment: ["polea baja"], tags: ["gluteos","patada","cable","polea"] },
  { name: "Abducción de cadera",         tipos: ["Hipertrofia","Fit"], lugares: ["Gym"], muscleGroup: "gluteos",  equipment: ["maquina abduccion"], tags: ["gluteos","abduccion","maquina"] },
  { name: "Sentadilla sumo con mancuerna", tipos: ["Hipertrofia","Ejercicio en Casa"], lugares: ["Gym","Casa"], muscleGroup: "gluteos", equipment: ["mancuerna"], tags: ["gluteos","piernas","sentadilla","sumo"] },

  // ─── HIPERTROFIA — HOMBROS ─────────────────────────────────────
  { name: "Press militar con barra",     tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "hombros",  equipment: ["barra"], tags: ["hombros","press","militar","barra"] },
  { name: "Press de hombros con mancuernas", tipos: ["Hipertrofia","Fit"], lugares: ["Gym","Casa"], muscleGroup: "hombros", equipment: ["mancuernas"], tags: ["hombros","press","mancuernas"] },
  { name: "Elevaciones laterales",       tipos: ["Hipertrofia","Fit"], lugares: ["Gym","Casa"], muscleGroup: "hombros", equipment: ["mancuernas"], tags: ["hombros","laterales","mancuernas","deltoides"] },
  { name: "Elevaciones frontales",       tipos: ["Hipertrofia"],       lugares: ["Gym","Casa"], muscleGroup: "hombros", equipment: ["mancuernas","disco"], tags: ["hombros","frontales","deltoides"] },
  { name: "Pájaro con mancuernas",       tipos: ["Hipertrofia"],       lugares: ["Gym","Casa"], muscleGroup: "hombros", equipment: ["mancuernas","banco"], tags: ["hombros","pajaro","deltoides posterior"] },
  { name: "Press Arnold",                tipos: ["Hipertrofia"],       lugares: ["Gym","Casa"], muscleGroup: "hombros", equipment: ["mancuernas"], tags: ["hombros","press","arnold"] },
  { name: "Remo al mentón",              tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "hombros",  equipment: ["barra","polea"], tags: ["hombros","trapecio","remo","menton"] },
  { name: "Face pull",                   tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "hombros",  equipment: ["polea alta"], tags: ["hombros","rotadores","face pull","polea"] },

  // ─── HIPERTROFIA — BÍCEPS ─────────────────────────────────────
  { name: "Curl de bíceps con barra",    tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "biceps",   equipment: ["barra"], tags: ["biceps","curl","barra"] },
  { name: "Curl de bíceps con mancuernas", tipos: ["Hipertrofia","Fit"], lugares: ["Gym","Casa"], muscleGroup: "biceps", equipment: ["mancuernas"], tags: ["biceps","curl","mancuernas"] },
  { name: "Curl martillo",               tipos: ["Hipertrofia"],       lugares: ["Gym","Casa"], muscleGroup: "biceps", equipment: ["mancuernas"], tags: ["biceps","braquial","curl","martillo"] },
  { name: "Curl en banco Scott",         tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "biceps",   equipment: ["barra","banco scott"], tags: ["biceps","curl","scott","aislamiento"] },
  { name: "Curl en polea baja",          tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "biceps",   equipment: ["polea baja"], tags: ["biceps","curl","polea","cable"] },
  { name: "Curl concentrado",            tipos: ["Hipertrofia"],       lugares: ["Gym","Casa"], muscleGroup: "biceps", equipment: ["mancuerna"], tags: ["biceps","curl","concentrado"] },

  // ─── HIPERTROFIA — TRÍCEPS ─────────────────────────────────────
  { name: "Press francés",               tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "triceps",  equipment: ["barra EZ","banco"], tags: ["triceps","press","frances","barra"] },
  { name: "Extensión de tríceps en polea", tipos: ["Hipertrofia","Fit"], lugares: ["Gym"], muscleGroup: "triceps", equipment: ["polea alta"], tags: ["triceps","extension","polea","cable"] },
  { name: "Patada de tríceps",           tipos: ["Hipertrofia"],       lugares: ["Gym","Casa"], muscleGroup: "triceps", equipment: ["mancuerna","banco"], tags: ["triceps","patada","mancuerna"] },
  { name: "Press de tríceps en polea",   tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "triceps",  equipment: ["polea alta"], tags: ["triceps","press","polea","cable"] },
  { name: "Press cerrado con barra",     tipos: ["Hipertrofia"],       lugares: ["Gym"], muscleGroup: "triceps",  equipment: ["barra","banco"], tags: ["triceps","press","cerrado","barra"] },
  { name: "Fondos para tríceps en banco", tipos: ["Hipertrofia","Ejercicio en Casa"], lugares: ["Gym","Casa"], muscleGroup: "triceps", equipment: ["banco","silla"], tags: ["triceps","fondos","banco"] },

  // ─── CALISTENIA — EMPUJE ───────────────────────────────────────
  { name: "Flexiones estándar",          tipos: ["Calistenia","Ejercicio en Casa","Fit"], lugares: ["Gym","Aire libre","Casa"], muscleGroup: "pecho", equipment: [], tags: ["pecho","triceps","flexiones","peso corporal"] },
  { name: "Flexiones diamante",          tipos: ["Calistenia","Ejercicio en Casa"], lugares: ["Gym","Aire libre","Casa"], muscleGroup: "triceps", equipment: [], tags: ["triceps","flexiones","diamante"] },
  { name: "Flexiones declinadas",        tipos: ["Calistenia","Ejercicio en Casa"], lugares: ["Gym","Aire libre","Casa"], muscleGroup: "pecho", equipment: ["silla","banco"], tags: ["pecho","hombros","flexiones","declinadas"] },
  { name: "Flexiones inclinadas",        tipos: ["Calistenia","Ejercicio en Casa"], lugares: ["Gym","Aire libre","Casa"], muscleGroup: "pecho", equipment: ["banco","silla"], tags: ["pecho","flexiones","inclinadas"] },
  { name: "Flexiones arqueras",          tipos: ["Calistenia"],        lugares: ["Gym","Aire libre","Casa"], muscleGroup: "pecho", equipment: [], tags: ["pecho","triceps","flexiones","avanzado"] },
  { name: "Flexiones con palmada",       tipos: ["Calistenia","Fit"],  lugares: ["Gym","Aire libre","Casa"], muscleGroup: "pecho", equipment: [], tags: ["pecho","pliometrico","potencia","flexiones"] },
  { name: "Fondos en paralelas",         tipos: ["Calistenia"],        lugares: ["Gym","Aire libre"], muscleGroup: "pecho", equipment: ["paralelas"], tags: ["pecho","triceps","fondos","paralelas"] },
  { name: "Pike push up",                tipos: ["Calistenia","Ejercicio en Casa"], lugares: ["Gym","Aire libre","Casa"], muscleGroup: "hombros", equipment: [], tags: ["hombros","pike","push up","calistenia"] },

  // ─── CALISTENIA — TIRÓN ───────────────────────────────────────
  { name: "Dominadas presas",            tipos: ["Calistenia","Hipertrofia","Fit"], lugares: ["Gym","Aire libre"], muscleGroup: "espalda", equipment: ["barra dominadas"], tags: ["espalda","biceps","dominadas","peso corporal"] },
  { name: "Dominadas supinas",           tipos: ["Calistenia","Hipertrofia"],       lugares: ["Gym","Aire libre"], muscleGroup: "biceps",   equipment: ["barra dominadas"], tags: ["biceps","espalda","dominadas","supinas"] },
  { name: "Dominadas neutras",           tipos: ["Calistenia","Hipertrofia"],       lugares: ["Gym","Aire libre"], muscleGroup: "espalda",  equipment: ["barra dominadas"], tags: ["espalda","biceps","dominadas","neutras"] },
  { name: "Remo australiano",            tipos: ["Calistenia","Fit"],               lugares: ["Gym","Aire libre"], muscleGroup: "espalda",  equipment: ["barra baja"], tags: ["espalda","remo","australiano","peso corporal"] },
  { name: "Muscle up",                   tipos: ["Calistenia"],                     lugares: ["Gym","Aire libre"], muscleGroup: "espalda",  equipment: ["barra dominadas"], tags: ["espalda","pecho","muscle up","avanzado"] },

  // ─── CALISTENIA — PIERNAS ─────────────────────────────────────
  { name: "Sentadilla",                  tipos: ["Calistenia","Ejercicio en Casa","Fit"], lugares: ["Gym","Aire libre","Casa"], muscleGroup: "piernas", equipment: [], tags: ["piernas","sentadilla","cuadriceps","peso corporal"] },
  { name: "Sentadilla sumo",             tipos: ["Calistenia","Ejercicio en Casa","Fit"], lugares: ["Gym","Aire libre","Casa"], muscleGroup: "gluteos", equipment: [], tags: ["gluteos","piernas","sentadilla","sumo"] },
  { name: "Zancada",                     tipos: ["Calistenia","Ejercicio en Casa","Fit"], lugares: ["Gym","Aire libre","Casa"], muscleGroup: "piernas", equipment: [], tags: ["piernas","zancada","cuadriceps"] },
  { name: "Pistol squat",                tipos: ["Calistenia"],        lugares: ["Gym","Aire libre","Casa"], muscleGroup: "piernas", equipment: [], tags: ["piernas","pistol","squat","unilateral","avanzado"] },
  { name: "Sentadilla jump",             tipos: ["Calistenia","Fit"],  lugares: ["Gym","Aire libre","Casa"], muscleGroup: "piernas", equipment: [], tags: ["piernas","salto","pliometrico","cardio"] },
  { name: "Glute bridge",                tipos: ["Calistenia","Ejercicio en Casa","Fit"], lugares: ["Gym","Casa","Aire libre"], muscleGroup: "gluteos", equipment: [], tags: ["gluteos","puente","glute bridge","suelo"] },
  { name: "Zancada inversa",             tipos: ["Calistenia","Ejercicio en Casa","Fit"], lugares: ["Gym","Casa","Aire libre"], muscleGroup: "piernas", equipment: [], tags: ["piernas","zancada","inversa"] },

  // ─── CORE ──────────────────────────────────────────────────────
  { name: "Plancha frontal",             tipos: ["Calistenia","Hipertrofia","Fit","Ejercicio en Casa"], lugares: ["Gym","Aire libre","Casa"], muscleGroup: "core", equipment: [], tags: ["core","plancha","abdominales","isometrico"] },
  { name: "Plancha lateral",             tipos: ["Calistenia","Fit","Ejercicio en Casa"],               lugares: ["Gym","Aire libre","Casa"], muscleGroup: "core", equipment: [], tags: ["core","plancha","lateral","oblicuos"] },
  { name: "Crunch abdominal",            tipos: ["Hipertrofia","Ejercicio en Casa","Fit"],              lugares: ["Gym","Casa"], muscleGroup: "core", equipment: [], tags: ["core","crunch","abdominales"] },
  { name: "Crunch inverso",              tipos: ["Hipertrofia","Ejercicio en Casa"],                    lugares: ["Gym","Casa"], muscleGroup: "core", equipment: [], tags: ["core","crunch","inverso","abdominales"] },
  { name: "Elevación de piernas tumbado", tipos: ["Hipertrofia","Ejercicio en Casa","Calistenia"],     lugares: ["Gym","Casa","Aire libre"], muscleGroup: "core", equipment: [], tags: ["core","abdominales","elevacion","piernas"] },
  { name: "Elevación de piernas en barra", tipos: ["Calistenia","Hipertrofia"],                        lugares: ["Gym","Aire libre"], muscleGroup: "core", equipment: ["barra dominadas"], tags: ["core","abdominales","colgado","barra"] },
  { name: "Rueda abdominal",             tipos: ["Calistenia","Hipertrofia"],                          lugares: ["Gym","Casa"], muscleGroup: "core", equipment: ["rueda abdominal"], tags: ["core","rueda","abdominales","avanzado"] },
  { name: "Mountain climbers",           tipos: ["Fit","Ejercicio en Casa","Calistenia"],              lugares: ["Gym","Casa","Aire libre"], muscleGroup: "core", equipment: [], tags: ["core","cardio","mountain climbers","dinamico"] },
  { name: "Hollow body hold",            tipos: ["Calistenia"],                                        lugares: ["Gym","Aire libre","Casa"], muscleGroup: "core", equipment: [], tags: ["core","hollow body","calistenia","isometrico"] },
  { name: "Dead bug",                    tipos: ["Fit","Ejercicio en Casa"],                           lugares: ["Gym","Casa"], muscleGroup: "core", equipment: [], tags: ["core","dead bug","activacion","suelo"] },
  { name: "Russian twist",               tipos: ["Fit","Ejercicio en Casa"],                           lugares: ["Gym","Casa"], muscleGroup: "core", equipment: ["disco","mancuerna"], tags: ["core","oblicuos","russian twist","rotacion"] },
  { name: "Cable crunch",                tipos: ["Hipertrofia"],                                       lugares: ["Gym"], muscleGroup: "core", equipment: ["polea alta"], tags: ["core","crunch","cable","polea"] },
  { name: "Bicycle crunch",              tipos: ["Fit","Ejercicio en Casa"],                           lugares: ["Gym","Casa","Aire libre"], muscleGroup: "core", equipment: [], tags: ["core","oblicuos","bicicleta","crunch"] },

  // ─── FIT / FUNCIONAL ───────────────────────────────────────────
  { name: "Burpees",                     tipos: ["Fit","Ejercicio en Casa"],  lugares: ["Gym","Aire libre","Casa"], muscleGroup: "cuerpo_completo", equipment: [], tags: ["funcional","cardio","burpees","cuerpo completo"] },
  { name: "Jumping jacks",               tipos: ["Fit","Ejercicio en Casa"],  lugares: ["Gym","Aire libre","Casa"], muscleGroup: "cardio",          equipment: [], tags: ["cardio","jumping jacks","calentamiento","dinamico"] },
  { name: "Box jump",                    tipos: ["Fit"],                      lugares: ["Gym","Aire libre"],        muscleGroup: "piernas",         equipment: ["box","caja"], tags: ["piernas","salto","pliometrico","potencia"] },
  { name: "Kettlebell swing",            tipos: ["Fit"],                      lugares: ["Gym"],                    muscleGroup: "cuerpo_completo",  equipment: ["kettlebell"], tags: ["kettlebell","swing","funcional","cardio"] },
  { name: "Thruster con mancuernas",     tipos: ["Fit"],                      lugares: ["Gym","Casa"],             muscleGroup: "cuerpo_completo",  equipment: ["mancuernas"], tags: ["funcional","thruster","mancuernas","cuerpo completo"] },
  { name: "Sentadilla goblet",           tipos: ["Fit","Ejercicio en Casa"],  lugares: ["Gym","Casa"],             muscleGroup: "piernas",          equipment: ["kettlebell","mancuerna"], tags: ["piernas","sentadilla","goblet","kettlebell"] },
  { name: "Remo con banda elástica",     tipos: ["Fit","Ejercicio en Casa"],  lugares: ["Gym","Casa","Aire libre"], muscleGroup: "espalda",         equipment: ["banda elástica"], tags: ["espalda","remo","banda","elastica"] },
  { name: "Press de hombros con banda",  tipos: ["Fit","Ejercicio en Casa"],  lugares: ["Casa","Gym"],             muscleGroup: "hombros",          equipment: ["banda elástica"], tags: ["hombros","press","banda","elastica"] },
  { name: "Step up con mancuernas",      tipos: ["Fit"],                      lugares: ["Gym","Casa"],             muscleGroup: "piernas",          equipment: ["mancuernas","step"], tags: ["piernas","step up","mancuernas","funcional"] },
  { name: "Farmer's walk",               tipos: ["Fit","Hipertrofia"],        lugares: ["Gym","Aire libre"],       muscleGroup: "cuerpo_completo",  equipment: ["mancuernas","kettlebell"], tags: ["funcional","caminata","mancuernas","agarre"] },
  { name: "TRX row",                     tipos: ["Fit"],                      lugares: ["Gym"],                    muscleGroup: "espalda",          equipment: ["TRX"], tags: ["espalda","TRX","remo","funcional"] },
  { name: "TRX push up",                 tipos: ["Fit"],                      lugares: ["Gym"],                    muscleGroup: "pecho",            equipment: ["TRX"], tags: ["pecho","TRX","flexiones","funcional"] },
  { name: "Bear crawl",                  tipos: ["Fit","Ejercicio en Casa"],  lugares: ["Gym","Aire libre","Casa"], muscleGroup: "cuerpo_completo", equipment: [], tags: ["funcional","bear crawl","cuerpo completo","suelo"] },
  { name: "Saltar la soga",              tipos: ["Fit","Ejercicio en Casa"],  lugares: ["Gym","Aire libre","Casa"], muscleGroup: "cardio",          equipment: ["soga"], tags: ["cardio","soga","coordinacion","saltar"] },
  { name: "Battle ropes",                tipos: ["Fit"],                      lugares: ["Gym"],                    muscleGroup: "cuerpo_completo",  equipment: ["battle ropes"], tags: ["cardio","battle ropes","funcional","ondas"] },

  // ─── EJERCICIO EN CASA ─────────────────────────────────────────
  { name: "Superman",                    tipos: ["Ejercicio en Casa","Fit"],  lugares: ["Casa","Gym"],             muscleGroup: "espalda",          equipment: [], tags: ["espalda","lumbar","superman","suelo"] },
  { name: "Tricep dips en silla",        tipos: ["Ejercicio en Casa"],        lugares: ["Casa"],                   muscleGroup: "triceps",          equipment: ["silla"], tags: ["triceps","fondos","silla","casa"] },
  { name: "Curl de bíceps con banda",    tipos: ["Ejercicio en Casa","Fit"],  lugares: ["Casa","Gym"],             muscleGroup: "biceps",           equipment: ["banda elástica"], tags: ["biceps","curl","banda","elastica"] },
  { name: "Sentadilla con pausa",        tipos: ["Ejercicio en Casa","Calistenia"], lugares: ["Casa","Aire libre","Gym"], muscleGroup: "piernas", equipment: [], tags: ["piernas","sentadilla","pausa","control"] },
  { name: "Plancha dinámica",            tipos: ["Ejercicio en Casa","Fit"],  lugares: ["Casa","Gym","Aire libre"], muscleGroup: "core",            equipment: [], tags: ["core","plancha","dinamica","funcional"] },
  { name: "Elevación de piernas lateral", tipos: ["Ejercicio en Casa"],       lugares: ["Casa","Gym"],             muscleGroup: "gluteos",          equipment: [], tags: ["gluteos","abduccion","lateral","suelo"] },
  { name: "Good morning con peso corporal", tipos: ["Ejercicio en Casa"],     lugares: ["Casa","Gym"],             muscleGroup: "espalda",          equipment: [], tags: ["espalda","isquiotibiales","good morning","peso corporal"] },
  { name: "Curl de isquiotibiales en suelo", tipos: ["Ejercicio en Casa","Calistenia"], lugares: ["Casa","Aire libre"], muscleGroup: "piernas", equipment: [], tags: ["isquiotibiales","curl","suelo","peso corporal"] },
  { name: "Sentadilla en pared",         tipos: ["Ejercicio en Casa","Fit"],  lugares: ["Casa","Gym"],             muscleGroup: "piernas",          equipment: [], tags: ["piernas","pared","isometrico","sentadilla"] },
  { name: "Patada trasera de glúteo",    tipos: ["Ejercicio en Casa","Fit"],  lugares: ["Casa","Gym"],             muscleGroup: "gluteos",          equipment: [], tags: ["gluteos","patada","trasera","suelo"] },

  // ─── RUNNING / CARDIO ──────────────────────────────────────────
  { name: "Trote suave",                 tipos: ["Running","Fit"],            lugares: ["Aire libre","Gym"],       muscleGroup: "cardio",           equipment: [], tags: ["cardio","trote","running","aerobico"] },
  { name: "Carrera a ritmo moderado",    tipos: ["Running"],                  lugares: ["Aire libre","Gym"],       muscleGroup: "cardio",           equipment: [], tags: ["cardio","carrera","ritmo","running"] },
  { name: "Intervalos de velocidad",     tipos: ["Running","Fit"],            lugares: ["Aire libre","Gym"],       muscleGroup: "cardio",           equipment: [], tags: ["cardio","intervalos","velocidad","HIIT"] },
  { name: "Fartlek",                     tipos: ["Running"],                  lugares: ["Aire libre"],             muscleGroup: "cardio",           equipment: [], tags: ["cardio","fartlek","running","variado"] },
  { name: "Carrera cuesta arriba",       tipos: ["Running","Fit"],            lugares: ["Aire libre"],             muscleGroup: "cardio",           equipment: [], tags: ["cardio","cuesta","running","fuerza"] },
  { name: "Caminata activa",             tipos: ["Running","Fit"],            lugares: ["Aire libre","Gym"],       muscleGroup: "cardio",           equipment: [], tags: ["cardio","caminata","activa","aerobico"] },
  { name: "Skipping",                    tipos: ["Running","Fit"],            lugares: ["Aire libre","Gym","Casa"], muscleGroup: "cardio",          equipment: [], tags: ["cardio","skipping","coordinacion","calentamiento"] },
  { name: "Carrera lateral",             tipos: ["Running","Fit"],            lugares: ["Aire libre","Gym"],       muscleGroup: "cardio",           equipment: [], tags: ["cardio","lateral","agilidad","running"] },
  { name: "Sprint",                      tipos: ["Running","Fit"],            lugares: ["Aire libre","Gym"],       muscleGroup: "cardio",           equipment: [], tags: ["cardio","sprint","velocidad","potencia"] },
  { name: "Cinta a inclinación",         tipos: ["Running"],                  lugares: ["Gym"],                    muscleGroup: "cardio",           equipment: ["cinta"], tags: ["cardio","cinta","inclinacion","running"] },
  { name: "Elíptica",                    tipos: ["Running","Fit"],            lugares: ["Gym"],                    muscleGroup: "cardio",           equipment: ["eliptica"], tags: ["cardio","eliptica","aerobico","maquina"] },
  { name: "Bicicleta estática",          tipos: ["Running","Fit"],            lugares: ["Gym"],                    muscleGroup: "cardio",           equipment: ["bicicleta"], tags: ["cardio","bicicleta","aerobico","maquina"] },
  { name: "Remo en máquina ergómetro",   tipos: ["Fit"],                      lugares: ["Gym"],                    muscleGroup: "cuerpo_completo",  equipment: ["remo ergometro"], tags: ["cardio","remo","ergometro","cuerpo completo"] },
];
