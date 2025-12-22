# PirateWorld — Sistema de Trabajo CANON

Este documento define **la forma oficial de trabajar** en PirateWorld usando
chats de IA, workers desechables y separación estricta de responsabilidades.

Este sistema existe para:
- Evitar pérdida de contexto
- Evitar chats lentos o contaminados
- Proteger decisiones CANON
- Permitir experimentación sin riesgo
- Avanzar más rápido y con menos errores

---

## 🧠 PRINCIPIO FUNDAMENTAL

> El código es reemplazable.  
> Las decisiones CANON no.

Por lo tanto:
- Los workers se eliminan
- Los chats se descartan
- Los commits se pueden revertir
- **CANON permanece**

---

## 🧩 ROLES DE CHATS

### 1️⃣ CHAT CANON (FIJO, NO CODE)

Rol:
- Fuente de verdad del proyecto
- Define:
  - FSM
  - pantallas
  - overlays
  - reglas
  - prohibiciones
- Valida si algo es correcto o no

Reglas:
- ❌ No escribe código
- ❌ No experimenta
- ❌ No opina fuera de lo solicitado
- ✅ Puede decir “NO”

---

### 2️⃣ CAPATAZ / PROJECT MANAGER (FIJO, NO CODE)

Rol:
- Define sprints
- Acota alcance
- Decide cuándo crear workers
- Decide cuándo cerrar un sprint

Reglas:
- ❌ No escribe código
- ❌ No diseña UI
- ✅ Traduce CANON a tareas ejecutables

---

### 3️⃣ CONSULTOR TÉCNICO (FIJO, NO CODE)

Rol:
- Evaluar alternativas
- Detectar riesgos
- Comparar enfoques técnicos

Reglas:
- ❌ No escribe código final
- ❌ No toma decisiones
- ✅ Recomienda con argumentos

---

### 4️⃣ WORKERS DE SPRINT (DESECHABLES, CODE)

Rol:
- Ejecutar **una tarea específica**
- Escribir código completo
- Respetar límites estrictos

Reglas:
- ❌ No rediseñan
- ❌ No expanden alcance
- ❌ No modifican CANON
- ❌ No se reciclan

Un worker vive **solo durante un sprint**.

---

## 🔒 PROMPT BASE — WORKER DE SPRINT

