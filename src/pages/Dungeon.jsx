import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dungeon() {
  const navigate = useNavigate();

  // Placeholders para datos de backend
  const dungeonLayout = []; // Backend
  const availableActions = []; // Backend

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dungeon</h1>

      {/* Layout del dungeon */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Layout</h2>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cell) => (
            <div
              key={cell}
              className="aspect-square border border-gray-300 bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
            >
              <span className="text-xs text-gray-400">{cell}</span>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-500 text-center">
          [Placeholder: Layout simple del dungeon]
        </div>
      </div>

      {/* Acciones disponibles */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Acciones Disponibles</h2>
        
        {availableActions.length === 0 ? (
          <div className="text-sm text-gray-500">[Backend: Lista de acciones disponibles]</div>
        ) : (
          <div className="space-y-2">
            {availableActions.map((action, idx) => (
              <button
                key={idx}
                className="w-full border border-gray-300 rounded p-3 hover:bg-gray-50"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="border border-gray-300 rounded p-3 hover:bg-gray-50">
            Acción 1
          </button>
          <button className="border border-gray-300 rounded p-3 hover:bg-gray-50">
            Acción 2
          </button>
          <button className="border border-gray-300 rounded p-3 hover:bg-gray-50">
            Acción 3
          </button>
          <button className="border border-gray-300 rounded p-3 hover:bg-gray-50">
            Acción 4
          </button>
        </div>
      </div>

      {/* Botón salir */}
      <button
        onClick={() => navigate(createPageUrl('GPS'))}
        className="w-full bg-gray-800 text-white py-3 rounded font-semibold hover:bg-gray-700"
      >
        Salir
      </button>
    </div>
  );
}