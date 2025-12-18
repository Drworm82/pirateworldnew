import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Zarpar() {
  const navigate = useNavigate();
  const [manualCoords, setManualCoords] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('');

  // Placeholders para datos de backend
  const availableDestinations = []; // Backend
  const estimatedCost = 0; // Backend
  const estimatedRisk = 0; // Backend
  const estimatedETA = ''; // Backend

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Zarpar</h1>

      {/* Selector de destino */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Destino</h2>
        
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={manualCoords}
              onChange={(e) => setManualCoords(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600">Ingresar coordenadas manuales</span>
          </label>
        </div>

        {!manualCoords ? (
          <div>
            <label className="block text-sm text-gray-600 mb-2">Seleccionar destino</label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">[Backend: Lista de destinos]</option>
              <option value="dest1">Destino de ejemplo 1</option>
              <option value="dest2">Destino de ejemplo 2</option>
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Latitud</label>
              <input
                type="text"
                placeholder="0.000000"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Longitud</label>
              <input
                type="text"
                placeholder="0.000000"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        )}

        {/* Mapa simplificado */}
        <div className="mt-4 h-48 border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-100">
          <span className="text-gray-500">[Placeholder: Mapa simplificado]</span>
        </div>
      </div>

      {/* Estimaciones */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Estimaciones</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Costo estimado:</span>
            <span className="font-mono text-gray-800">[Backend: {estimatedCost} doblones]</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Riesgo estimado:</span>
            <span className="font-mono text-gray-800">[Backend: {estimatedRisk}%]</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tiempo estimado (ETA):</span>
            <span className="font-mono text-gray-800">[Backend: {estimatedETA}]</span>
          </div>
        </div>
      </div>

      {/* Botón zarpar */}
      <button
        onClick={() => navigate(createPageUrl('Viaje'))}
        className="w-full bg-gray-800 text-white py-3 rounded font-semibold hover:bg-gray-700"
      >
        Zarpar
      </button>
    </div>
  );
}