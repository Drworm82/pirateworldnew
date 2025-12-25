# HUD — Contrato CANON

## Principios
- Siempre observer-only.
- Datos read-only desde RPCs canónicas.
- Nunca acciona ni decide.

## Visible por estado
- FIRST_TIME_GPS: identidad mínima
- GPS_NOMAD: identidad + reputación
- PORT_IDLE: identidad + reputación + contadores
- PORT_TRAVEL: identidad + indicador estático de viaje
- PROFILE: identidad + reputación
- EVENT: bloqueado (solo identidad opcional)

## Negativos
- Nunca timers reales, % o costos
- Nunca botones ni enlaces
