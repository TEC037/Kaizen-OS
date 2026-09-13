/**
 * Lógica de Progresión Alquímica v2.0:
 * Los valores se expanden basándose en dos pilares:
 * 1. Cristalización (Total): Progreso permanente por repetición.
 * 2. Momentum (Racha): Bonus temporal por disciplina ininterrumpida.
 */
export const calculateIntensity = (base, streak, total, step, max) => {
  
  const crystalBonus = Math.floor(total / 5) * step;
  
  
  const momentumBonus = Math.floor(streak / 3) * step;
  
  const totalValue = base + crystalBonus + momentumBonus;
  return max ? Math.min(totalValue, max) : totalValue;
};

export const habitDefinitions = [
  {
    id: "h_1", 
    name: "Me levanté antes de las {v}:00 AM", 
    method: "Alineación del ciclo circadiano suprimiendo la inercia del sueño.",
    area: "Dominio del Ser", 
    icon: "sunrise",
    description: "Reclama la primera hora del día. En el silencio del alba se purifica la voluntad débil.",
    coach_education: "El primer sacrificio es el más duro. Quien lidera su mañana, somete su destino.",
    treeLevel: 1,
    prerequisiteId: null,
    intensity: {
      v: (s, t) => {
        const base = 6;
        const reduction = (Math.floor(t / 10) * 0.25) + (Math.floor(s / 7) * 0.25);
        return Math.max(base - reduction, 4).toFixed(2).replace('.00', '').replace('0', '').replace('.', ':');
      }
    }
  },
  {
    id: "h_2", 
    name: "Bebí {v}ml de agua al despertar", 
    method: "Restauración del volumen sanguíneo basal post-sueño.",
    area: "Salud Física", 
    icon: "droplets",
    description: "El vehículo físico clama por fluidos para reiniciar los motores celulares.",
    coach_education: "El agua es el conductor de la alquimia. Un cuerpo deshidratado produce una mente fragmentada.",
    treeLevel: 2,
    prerequisiteId: "h_1",
    intensity: {
      v: (s, t) => calculateIntensity(500, s, t, 50, 2000)
    }
  },
  {
    id: "h_3", 
    name: "Apagué pantallas {v} min antes de dormir", 
    method: "Supresión de luz artificial para proteger la ruta de melatonina.",
    area: "Foco Mental", 
    icon: "moon",
    description: "Las luces antinaturales sabotean tu ciclo. Asegura la noche anterior para vencer hoy.",
    coach_education: "La victoria de las 6 AM no se forja en la mañana, se asegura protegiendo el descanso.",
    treeLevel: 3,
    prerequisiteId: "h_2",
    intensity: {
      v: (s, t) => calculateIntensity(60, s, t, 10, 180)
    }
  },
  {
    id: "h_4", 
    name: "Entrené intensamente por {v} minutos", 
    method: "Inducción de estrés metabólico para provocar supercompensación.",
    area: "Salud Física", 
    icon: "dumbbell",
    description: "Mueve el cuerpo con vigor. El sudor es el subproducto de la transmutación pesada.",
    coach_education: "El dolor de la disciplina es más ligero que el peso del arrepentimiento.",
    treeLevel: 4,
    prerequisiteId: "h_3",
    intensity: {
      v: (s, t) => calculateIntensity(20, s, t, 5, 90)
    }
  },
  {
    id: "h_5", 
    name: "Medité en silencio por {v} minutos", 
    method: "Supresión de la Red Neuronal por Defecto mediante foco sostenido.",
    area: "Foco Mental", 
    icon: "eye",
    description: "Enfrenta al mono mental. El verdadero poder reside en el presente absoluto.",
    coach_education: "Toda ansiedad proviene del futuro o del pasado. Aquí y ahora eres infinito.",
    treeLevel: 5,
    prerequisiteId: "h_4",
    intensity: {
      v: (s, t) => calculateIntensity(10, s, t, 2, 60)
    }
  },
  {
    id: "h_6", 
    name: "Leí {v} páginas de sabiduría", 
    method: "Mielinización de nuevas rutas mediante exposición a modelos mentales complejos.",
    area: "Mente Abierta", 
    icon: "book",
    description: "Codifica nuevos patrones de pensamiento mediante la lectura profunda.",
    coach_education: "Un libro es una conversación con un gigante. No camines solo.",
    treeLevel: 6,
    prerequisiteId: "h_5",
    intensity: {
      v: (s, t) => calculateIntensity(10, s, t, 5, 100)
    }
  },
  {
    id: "h_7", 
    name: "Tomé una ducha de agua gélida ({v} seg)", 
    method: "Exposición al frío para generar un pico prolongado de dopamina basal.",
    area: "Dominio del Ser", 
    icon: "snowflake",
    description: "El choque térmico purifica el sistema nervioso y fortalece la resiliencia.",
    coach_education: "Si controlas tu reacción al frío extremo, controlas tus emociones en el caos.",
    treeLevel: 7,
    prerequisiteId: "h_6",
    intensity: {
      v: (s, t) => calculateIntensity(30, s, t, 15, 300)
    }
  },
  {
    id: "h_8", 
    name: "Mantuve ayuno por {v} horas", 
    method: "Abstención metabólica para activar procesos celulares de autofagia.",
    area: "Salud Física", 
    icon: "flame",
    description: "Permite que la autofagia limpie tus células de impurezas metabólicas.",
    coach_education: "Estar hambriento de comida es estar hambriento de vida. Claridad por privación.",
    treeLevel: 8,
    prerequisiteId: "h_7",
    intensity: {
      v: (s, t) => calculateIntensity(4, s, t, 0.5, 16)
    }
  },
  {
    id: "h_9", 
    name: "Trabajo Ininterrumpido por {v} min", 
    method: "Estado de Flujo bloqueando todo cambio asintótico de contexto.",
    area: "Foco Mental", 
    icon: "laptop",
    description: "Aplica tu foco sobre la tarea de mayor impacto sin una sola concesión a la dopamina barata.",
    coach_education: "En la era de la distracción masiva, retener foco continuo es obtener un superpoder.",
    treeLevel: 9,
    prerequisiteId: "h_8",
    intensity: {
      v: (s, t) => calculateIntensity(30, s, t, 10, 180)
    }
  },
  {
    id: "h_10", 
    name: "Anoté el Plan del Día ({v} hábitos mañana)", 
    method: "Descarga neuro-cognitiva (cierre del Efecto Zeigarnik) previa al sueño.",
    area: "Dominio del Ser", 
    icon: "pencil",
    description: "Traslada los bucles abiertos de la mente al papel para permitir el apagado parasimpático.",
    coach_education: "Despertar sin plan es trabajar para los planes de otros.",
    treeLevel: 10,
    prerequisiteId: "h_9",
    intensity: {
      v: (s, t) => calculateIntensity(1, s, t, 1, 5)
    }
  }
];

export const achievementsDefinitions = [
  { id: "ach_1", name: "Primera Chispa", description: "Victoria inicial.", icon: "sparkles", conditionType: "total_completions", conditionValue: 1 },
  { id: "ach_2", name: "Hierro Caliente", description: "Racha de 7 ciclos.", icon: "flame", conditionType: "max_streak", conditionValue: 7 },
  { id: "ach_3", name: "Voluntad de Titanio", description: "Racha de 21 ciclos.", icon: "shield", conditionType: "max_streak", conditionValue: 21 },
  { id: "ach_4", name: "Alquimista Despierto", description: "50 transmutaciones totales.", icon: "eye", conditionType: "total_completions", conditionValue: 50 },
  { id: "ach_5", name: "El Gran Opus", description: "Dominio del Árbol Sagrado.", icon: "sunrise", conditionType: "tree_completed", conditionValue: 8 }
];
