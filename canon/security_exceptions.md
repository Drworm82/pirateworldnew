# Security Exceptions — Supabase

## Vistas SECURITY DEFINER aceptadas

Las siguientes vistas usan SECURITY DEFINER por diseño:

- ship_state_runtime
- ship_state_clean
- user_wallet_view

### Justificación

- Solo lectura
- No exponen PII
- No dependen de auth.users
- Requeridas para agregación runtime

### Estado
Aceptadas explícitamente como excepción CANON.
