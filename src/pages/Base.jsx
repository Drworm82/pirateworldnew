import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Base() {
  const navigate = useNavigate();

  // Placeholders para datos de backend
  const baseName = ''; // Backend
  const baseLevel = 0; // Backend
  const resources = {}; // Backend
  const buildings = []; // Backend

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Base</h1>

      {/* Información de la base */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Mi Base</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Nombre:</span>
            <span className="font-mono text-gray-800">[Backend: {baseName}]</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Nivel:</span>
            <span className="font-mono text-gray-800">[Backend: {baseLevel}]</span>
          </div>
        </div>
      </div>

      {/* Vista de la base */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Vista de Base</h2>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((cell) => (
            <div
              key={cell}
              className="aspect-square border border-gray-300 bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
            >
              <span className="text-xs text-gray-400">{cell}</span>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-500 text-center">
          [Placeholder: Vista top-down de tu base]
        </div>
      </div>

      {/* Recursos */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Recursos</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-gray-300 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Madera</div>
            <div className="text-xl font-bold text-gray-800">[Backend]</div>
          </div>
          <div className="border border-gray-300 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Piedra</div>
            <div className="text-xl font-bold text-gray-800">[Backend]</div>
          </div>
          <div className="border border-gray-300 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Comida</div>
            <div className="text-xl font-bold text-gray-800">[Backend]</div>
          </div>
          <div className="border border-gray-300 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Oro</div>
            <div className="text-xl font-bold text-gray-800">[Backend]</div>
          </div>
        </div>
      </div>

      {/* Edificios */}
      <div className="bg-white border border-gray-300 rounded p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Edificios</h2>
        
        {buildings.length === 0 ? (
          <div className="text-sm text-gray-500">[Backend: Lista de edificios en tu base]</div>
        ) : (
          <div className="space-y-2">
            {buildings.map((building, idx) => (
              <div key={idx} className="border border-gray-300 rounded p-3">
                <div className="font-semibold text-gray-700">{building.name}</div>
                <div className="text-sm text-gray-600">Nivel: {building.level}</div>
              </div>
            ))}
          </div>
        )}

        {/* Edificios de ejemplo */}
        <div className="space-y-2 mt-4">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="border border-gray-300 rounded p-3">
              <div className="font-semibold text-gray-700">Edificio {idx}</div>
              <div className="text-sm text-gray-600">Nivel: [Backend]</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}