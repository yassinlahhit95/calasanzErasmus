export const CICLOS_MEDIO = [
  "Cuidados Auxiliares de Enfermería",
  "Farmacia y Parafarmacia",
  "Gestión Administrativa",
  "Emergencias Sanitarias",
] as const;

export const CICLOS_SUPERIOR = [
  "Administración y Finanzas",
  "Marketing y Publicidad",
  "Educación Infantil",
  "Integración Social",
  "Imagen para el Diagnóstico",
  "Radioterapia",
  "Documentación Sanitaria",
  "Laboratorio Clínico y Biomédico",
] as const;

export const DOCUMENT_TYPES = [
  { key: "memoria_practicas", label: "Memoria de Prácticas" },
  { key: "learning_agreement", label: "Learning Agreement" },
  { key: "convenio_erasmus", label: "Convenio Erasmus+" },
  { key: "certificado_empresa", label: "Certificado de Empresa" },
  { key: "prueba_idioma_inicial", label: "Prueba de Idioma Inicial" },
  { key: "prueba_idioma_final", label: "Prueba de Idioma Final" },
  { key: "tarjetas_embarque", label: "Tarjetas de Embarque" },
  { key: "encuesta_colegio", label: "Encuesta del Colegio" },
  { key: "encuesta_gobierno_vasco", label: "Encuesta del Gobierno Vasco" },
  { key: "encuesta_europea", label: "Encuesta Europea" },
] as const;

export const WEEKS = Array.from({ length: 12 }, (_, i) => i + 1);

export const GUIDE_SECTIONS = [
  {
    title: "Tu Misión: Una Experiencia Académica y Profesional",
    content: "Financiada por fondos europeos y gestionada por Calasanz Santurtzi y socios locales. Eres la imagen de Calasanz y del País Vasco en Europa. La beca está condicionada al 100% de cumplimiento: obligaciones académicas, entrega documental y comportamiento ejemplar.",
    icon: "🎯",
  },
  {
    title: "Checklist Previo a la Salida",
    content: "VIAJE: Billete de avión • IDENTIDAD: DNI/Pasaporte/NIE en vigor • SALUD: Tarjeta Sanitaria Europea + Póliza de seguro • DINERO: Tarjetas bancarias activas • BUROCRACIA: Documentación Erasmus firmada • ESPECÍFICO: Formulario extra para Italia, Malta, Francia o Irlanda • MENORES/NO COMUNITARIOS: Revisar documentación adicional.",
    icon: "✅",
  },
  {
    title: "Normas Generales: Tu Día a Día",
    content: "PERMANENCIA: Prohibido salir del país de destino sin autorización previa (riesgo de pérdida de cobertura). HORARIO: Lo determina la empresa, no existen vacaciones adicionales. IDIOMA: OLS obligatorio, completar pruebas de nivel inicial y final.",
    icon: "📋",
  },
  {
    title: "Líneas Rojas y Consecuencias",
    content: "Conductas graves: Suspensión inmediata de la beca, pérdida de la ayuda económica, no superación del módulo de FCT. DAÑOS: El participante paga cualquier desperfecto en el alojamiento. CAMBIOS: No se puede cambiar de empresa ni de alojamiento sin aprobación.",
    icon: "🚫",
  },
  {
    title: "Protocolo de Comunicación: Tus 3 Referentes",
    content: "1. TUTOR/A DE EMPRESA: Tu referencia diaria. 2. SOCIO INTERMEDIARIO: Responsable de tu estancia en el país. 3. CALASANZ SANTURTZI: Centro de envío y coordinación. Es fundamental respetar el orden de comunicación según la gravedad.",
    icon: "📞",
  },
  {
    title: "Gestión de Incidencias",
    content: "NIVEL 1 (LEVES): Dudas de tareas, ajustes de horario, organización menor → Contacta al tutor de empresa. NIVEL 2 (GRAVES): Conflictos laborales, problemas de convivencia, adaptación difícil, salud emergente → Contacta al socio intermediario.",
    icon: "⚠️",
  },
  {
    title: "Situaciones Críticas y Urgencias",
    content: "EN CASO DE ACCIDENTE: 1. Protocolo del seguro. 2. Avisar al Socio Intermediario. 3. Avisar a Calasanz. CONTACTO INMEDIATO: Rafael Pilar - rafael.pilar@calasanz.eus. Conserva todos los informes médicos.",
    icon: "🆘",
  },
  {
    title: "Eres Embajador/a de Calasanz",
    content: "Respeto, puntualidad y profesionalidad. Actitud proactiva. Uso adecuado de redes sociales. No solo viajas tú: representas a Calasanz, al País Vasco y a Erasmus+.",
    icon: "🌟",
  },
  {
    title: "Documentación de Regreso",
    content: "Todo debe ser ORIGINAL y entregado al tutor del colegio: Learning Agreement firmado/sellado, Convenio, Traineeship Certificate, Quality Commitment (Grado Medio), Tarjetas de Embarque originales (ida y vuelta).",
    icon: "📄",
  },
  {
    title: "Encuestas Obligatorias y Memoria",
    content: "5 ENCUESTAS OBLIGATORIAS: 1. Encuesta inicial y final de idioma (OLS). 2. Encuesta oficial de la UE. 3. Encuesta del Gobierno Vasco. 4. Encuesta del colegio. 5. Encuesta online con tu tutor/a. LA MEMORIA DE PRÁCTICAS: Reflexión sobre competencias y valoración personal/profesional.",
    icon: "📝",
  },
  {
    title: "Cierre de Movilidad",
    content: "Entrega de documentación + encuestas → Validación de memoria + OLS + justificantes de viaje → BECA CERRADA Y JUSTIFICADA. Hasta que no se completa este proceso, la beca no se considera justificada.",
    icon: "🏁",
  },
];
