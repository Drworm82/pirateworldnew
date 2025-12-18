import React from 'react';

export default function Perfil() {
  // Placeholders para datos de backend
  const profile = {
    name: '', // Backend
    level: 0, // Backend
    reputation: 0, // Backend
    ownedShips: [], // Backend
    stats: {}, // Backend
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Perfil de Capitán</h1>

      {/* Información básica */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Información Básica</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Nombre:</span>
            <span className="font-mono text-gray-800">[Backend: {profile.name}]</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Nivel:</span>
            <span className="font-mono text-gray-800">[Backend: {profile.level}]</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Reputación:</span>
            <span className="font-mono text-gray-800">[Backend: {profile.reputation}]</span>
          </div>
        </div>
      </div>

      {/* Barcos poseídos */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Barcos Poseídos</h2>
        
        {profile.ownedShips.length === 0 ? (
          <div className="text-sm text-gray-500 mb-4">
            [Backend: Lista de barcos poseídos]
          </div>
        ) : (
          <div className="space-y-2">
            {profile.ownedShips.map((ship, idx) => (
              <div key={idx} className="border border-gray-300 rounded p-3">
                <div className="font-semibold text-gray-700">{ship.name}</div>
                <div className="text-sm text-gray-600">Tipo: {ship.type}</div>
                <div className="text-sm text-gray-600">Estado: {ship.status}</div>
              </div>
            ))}
          </div>
        )}

        {/* Barcos de ejemplo */}
        <div className="space-y-2 mt-4">
          {[1, 2].map((idx) => (
            <div key={idx} className="border border-gray-300 rounded p-3">
              <div className="font-semibold text-gray-700">Barco {idx}</div>
              <div className="text-sm text-gray-600">Tipo: [Backend]</div>
              <div className="text-sm text-gray-600">Estado: [Backend]</div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-white border border-gray-300 rounded p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Estadísticas</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-gray-300 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Dungeons completados</div>
            <div className="text-xl font-bold text-gray-800">[Backend]</div>
          </div>
          <div className="border border-gray-300 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Viajes realizados</div>
            <div className="text-xl font-bold text-gray-800">[Backend]</div>
          </div>
          <div className="border border-gray-300 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Tesoros encontrados</div>
            <div className="text-xl font-bold text-gray-800">[Backend]</div>
          </div>
          <div className="border border-gray-300 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Distancia navegada</div>
            <div className="text-xl font-bold text-gray-800">[Backend]</div>
          </div>
          <div className="border border-gray-300 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Combates ganados</div>
            <div className="text-xl font-bold text-gray-800">[Backend]</div>
          </div>
          <div className="border border-gray-300 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Días jugados</div>
            <div className="text-xl font-bold text-gray-800">[Backend]</div>
          </div>
        </div>
      </div>
    </div>
  );
}