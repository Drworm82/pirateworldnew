export function mockGetIslands() {
  return [
    {
      id: "island_1",
      name: "Isla Tortuga",
      coords: { x: 12, y: 8 },
      owned: true,
    },
    {
      id: "island_2",
      name: "Isla Bruma",
      coords: { x: 18, y: 14 },
      owned: false,
    },
    {
      id: "island_3",
      name: "Cayo Rojo",
      coords: { x: 7, y: 3 },
      owned: true,
    },
  ];
}
