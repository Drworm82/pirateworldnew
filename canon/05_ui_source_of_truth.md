# CANON — UI Source of Truth

## Regla principal
La interfaz visual "trabajada" existente del proyecto PirateWorld
(layouts, navegación, estilos, jerarquía visual)
es la FUENTE DE VERDAD del UI.

Esta UI NO debe:
- ser reemplazada
- ser simplificada
- ser reescrita
- ser “limpiada” por refactor

## Qué significa “UI trabajada”
Se considera UI trabajada aquella que:
- tiene layout coherente
- navegación definida (header / bottom nav)
- estilos intencionales
- jerarquía visual clara
- fue iterada manualmente

## Obligaciones para desarrollo futuro
- El frontend conecta lógica NUEVA a la UI existente.
- La lógica se adapta al UI, NO al revés.
- Si hay duda, se debe:
  1) identificar el archivo trabajado
  2) preservar JSX y estilos
  3) inyectar datos sin alterar estructura

## Prohibiciones
- ❌ Reemplazar componentes visuales completos
- ❌ Introducir layouts “temporales”
- ❌ Cambiar navegación sin documento CANON
- ❌ Regresar a wireframes o skeletons antiguos

## Aplicación a workers
Todo worker frontend:
- debe asumir esta UI como intocable
- debe preguntar antes de cambiar estructura visual
