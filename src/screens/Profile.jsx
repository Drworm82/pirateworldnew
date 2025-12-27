// src/screens/Profile.jsx
import React, { useEffect, useState } from 'react';
import { deriveUiState, UI_STATES } from '../controllers/uiStateFSM';

// Mock RPC
const rpc_get_player_summary = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ 
        rank: 'Capitán Novato', 
        title: 'El Errante', 
        reputation_score: 150,
        crew_count: 12,
        islands_count: 3,
        travel_count: 45,
        inventory_counts: { rum: 10, gold: 500 }
      });
    }, 1000);
  });
};

export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    rpc_get_player_summary()
      .then(res => setData(res))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  const uiState = deriveUiState(data, error, loading);

  return (
    <div className="screen profile observer-only">
      <h1>Perfil de Capitán</h1>
      
      {uiState === UI_STATES.LOADING && <p>Cargando datos...</p>}
      
      {uiState === UI_STATES.ERROR && <p className="error">Error al cargar perfil.</p>}
      
      {uiState === UI_STATES.READY && (
        <div className="profile-details">
          <p>Rango: {data.rank}</p>
          <p>Título: {data.title}</p>
          <p>Reputación: {data.reputation_score}</p>
          <p>Tripulación: {data.crew_count}</p>
          <p>Islas: {data.islands_count}</p>
          <p>Viajes: {data.travel_count}</p>
          <p>Oro: {data.inventory_counts.gold}</p>
        </div>
      )}
    </div>
  );
}
