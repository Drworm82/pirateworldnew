import React from 'react';

export default function Tripulacion() {
  // Placeholders para datos de backend
  const crewMembers = []; // Backend
  const synergies = []; // Backend
  const shipStatus = ''; // Backend

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tripulación</h1>

      {/* Estado del barco */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Estado del Barco</h2>
        <div className="text-sm text-gray-600">
          [Backend: Estado del barco respecto a roles]
        </div>
        <div className="mt-2 p-3 bg-gray-100 rounded">
          <span className="font-mono text-gray-800">{shipStatus || 'Estado placeholder'}</span>
        </div>
      </div>

      {/* Miembros de la tripulación */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Miembros</h2>
        
        {crewMembers.length === 0 ? (
          <div className="text-sm text-gray-500 mb-4">
            [Backend: Lista de miembros de la tripulación]
          </div>
        ) : (
          <div className="space-y-2">
            {crewMembers.map((member, idx) => (
              <div key={idx} className="border border-gray-300 rounded p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-700">{member.name}</div>
                    <div className="text-sm text-gray-600">Rol: {member.role}</div>
                  </div>
                  <div className="text-sm text-gray-500">{member.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Miembros de ejemplo */}
        <div className="space-y-2 mt-4">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="border border-gray-300 rounded p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-700">Miembro {idx}</div>
                  <div className="text-sm text-gray-600">Rol: [Rol placeholder]</div>
                </div>
                <div className="text-sm text-gray-500">[Estado]</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bonificaciones de sinergia */}
      <div className="bg-white border border-gray-300 rounded p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Bonificaciones de Sinergia</h2>
        
        {synergies.length === 0 ? (
          <div className="text-sm text-gray-500">
            [Backend: Lista de bonificaciones activas por sinergias]
          </div>
        ) : (
          <div className="space-y-2">
            {synergies.map((synergy, idx) => (
              <div key={idx} className="bg-green-50 border border-green-200 rounded p-3">
                <div className="font-semibold text-gray-700">{synergy.name}</div>
                <div className="text-sm text-gray-600">{synergy.bonus}</div>
              </div>
            ))}
          </div>
        )}

        {/* Sinergias de ejemplo */}
        <div className="space-y-2 mt-4">
          {[1, 2].map((idx) => (
            <div key={idx} className="bg-green-50 border border-green-200 rounded p-3">
              <div className="font-semibold text-gray-700">Sinergia {idx}</div>
              <div className="text-sm text-gray-600">[Bonificación placeholder]</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}