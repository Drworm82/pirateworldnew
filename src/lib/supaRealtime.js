// src/lib/supaRealtime.js
import { getSupa } from "./supaApi.js";

/**
 * Suscribe a cambios en una tripulación concreta (crews + crew_members).
 * Devuelve el canal para poder hacer .unsubscribe() en el cleanup del efecto.
 *
 * Ahora escuchamos INSERT / UPDATE / DELETE de forma explícita para
 * asegurarnos de que expulsar (DELETE en crew_members) también dispare
 * el callback en todos los clientes.
 */
export function subscribeToCrewRealtime(crewId, onChange) {
  if (!crewId) return null;

  const supa = getSupa();

  const handler = (payload) => {
    // console.log("[RT] payload", payload);
    if (typeof onChange === "function") {
      onChange(payload);
    }
  };

  const channel = supa
    .channel(`crew-sync-${crewId}`)

    // ------ crew_members: INSERT / UPDATE / DELETE ------
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "crew_members",
        filter: `crew_id=eq.${crewId}`,
      },
      handler
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "crew_members",
        filter: `crew_id=eq.${crewId}`,
      },
      handler
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "crew_members",
        filter: `crew_id=eq.${crewId}`,
      },
      handler
    )

    // ------ crews: INSERT / UPDATE / DELETE ------
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "crews",
        filter: `id=eq.${crewId}`,
      },
      handler
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "crews",
        filter: `id=eq.${crewId}`,
      },
      handler
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "crews",
        filter: `id=eq.${crewId}`,
      },
      handler
    )

    .subscribe();

  return channel;
}
