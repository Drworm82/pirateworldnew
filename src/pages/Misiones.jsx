import React, { useState } from 'react';

export default function Misiones() {
  const [filter, setFilter] = useState('todas');

  // Placeholders para datos de backend
  const missions = []; // Backend

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Misiones</h1>

      {/* Filtros */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('todas')}
            className={`px-4 py-2 rounded ${
              filter === 'todas'
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('activas')}
            className={`px-4 py-2 rounded ${
              filter === 'activas'
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFilter('completadas')}
            className={`px-4 py-2 rounded ${
              filter === 'completadas'
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            Completadas
          </button>
        </div>
      </div>

      {/* Lista de misiones */}
      <div className="space-y-3">
        {missions.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded p-4">
            <div className="text-sm text-gray-500">
              [Backend: Lista de misiones según filtro]
            </div>
          </div>
        ) : (
          missions.map((mission, idx) => (
            <div key={idx} className="bg-white border border-gray-300 rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{mission.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  mission.status === 'activa'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {mission.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{mission.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Recompensa: {mission.reward}</span>
                {mission.status === 'activa' && (
                  <button className="px-3 py-1 bg-gray-800 text-white rounded text-xs">
                    Ver detalles
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Misiones de ejemplo */}
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="bg-white border border-gray-300 rounded p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">Misión ejemplo {idx}</h3>
              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                activa
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              [Backend: Descripción de la misión]
            </p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Recompensa: [Backend]</span>
              <button className="px-3 py-1 bg-gray-800 text-white rounded text-xs">
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}