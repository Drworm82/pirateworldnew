export const missions = [
  {
    code: "NAR01_MISSION_SAILS",
    title: "Primer Levantamiento de Velas",
    description: "Tu barco duerme desde hace siglos. Mira tu primer anuncio y deja que el viento vuelva a inflar las velas.",
    target: 1,
    reward: "1 doblón",
    lore_unlock: "Timón del capitán"
  },
  {
    code: "NAR01_MISSION_TREASURE",
    title: "El Tesoro Bajo Tus Pies",
    description: "Cava en tus bolsillos, capitán: junta 100 doblones y compra tu primera parcela de mar. Cada isla empieza con una pala.",
    target: 1,
    reward: "1 parcela común",
    lore_unlock: "Mapa del archipiélago"
  },
  {
    code: "NAR01_MISSION_ARCHIPELAGO",
    title: "La Niebla del Mantenimiento",
    description: "Haz check-in diario para disipar la niebla que rodea tu puerto. Si no apareces, los fantasmas del mar reclamarán tu botín.",
    target: 1,
    reward: "Bonificación de producción 1 h",
    lore_unlock: "Puerto activo"
  }
];

export const rarities = [
  { id: "common",    name: "Isla de Ron",          desc: "Pequeña, cálida y llena de promesas. Aquí los marineros novatos prueban su suerte.", mult: 1.0 },
  { id: "rare",      name: "Cayo del Kraken",      desc: "Aguas profundas que murmuran historias. No todos los capitanes sobreviven al primer chapuzón.", mult: 1.45 },
  { id: "epic",      name: "Bahía del Relámpago",  desc: "Truenos eternos iluminan el oro oculto. Cada tormenta deja algo nuevo en la arena.", mult: 2.0 },
  { id: "legendary", name: "Fortaleza del Horizonte", desc: "Una isla imposible, flotando entre mundos. Sus torres brillan con el botín de mil generaciones.", mult: 4.0 }
];
