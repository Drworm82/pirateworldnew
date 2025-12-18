import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Isla() {
  const navigate = useNavigate();

  // Placeholders para datos de backend
  const dungeonEntries = []; // Backend

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Isla</h1>

      {/* Vista general de la isla */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Vista General</h2>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((cell) => (
            <div
              key={cell}
              className="aspect-square border border-gray-300 bg-gray-100 flex items-center justify-center"
            >
              <span className="text-xs text-gray-400">{cell}</span>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-500 text-center">
          [Placeholder: Grid/Top-down view de la isla]
        </div>
      </div>

      {/* Entradas a dungeons */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Dungeons Locales</h2>
        
        {dungeonEntries.length === 0 ? (
          <div className="text-sm text-gray-500">[Backend: Lista de dungeons en esta isla]</div>
        ) : (
          <div className="space-y-2">
            {dungeonEntries.map((dungeon, idx) => (
              <button
                key={idx}
                onClick={() => navigate(createPageUrl('Dungeon'))}
                className="w-full border border-gray-300 rounded p-3 hover:bg-gray-50 text-left"
              >
                Dungeon {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Acciones de tesoro */}
      <div className="space-y-3">
        <button className="w-full bg-white border-2 border-gray-600 py-3 rounded font-semibold hover:bg-gray-50">
          Enterrar tesoro
        </button>
        
        <button className="w-full bg-white border-2 border-gray-600 py-3 rounded font-semibold hover:bg-gray-50">
          Desenterrar tesoro
        </button>
      </div>
    </div>
  );
}