import React from 'react';

export default function Territorio() {
  // Placeholders para datos de backend
  const parcels = []; // Backend
  const currentLocation = ''; // Backend
  const locationReputation = 0; // Backend

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Territorio / Parcelas</h1>

      {/* Ubicación actual */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Ubicación Actual</h2>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Isla/Ciudad:</span>
            <span className="font-mono text-gray-800">[Backend: {currentLocation}]</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Reputación:</span>
            <span className="font-mono text-gray-800">[Backend: {locationReputation}]</span>
          </div>
        </div>
      </div>

      {/* Vista tipo Atlas Earth */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Vista de Territorio</h2>
        
        <div className="h-64 border-2 border-dashed border-gray-400 bg-gray-50 flex items-center justify-center">
          <span className="text-gray-500">[Placeholder: Vista tipo Atlas Earth]</span>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          Vista informativa de las parcelas y territorio
        </div>
      </div>

      {/* Parcelas del jugador */}
      <div className="bg-white border border-gray-300 rounded p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Mis Parcelas</h2>
        
        {parcels.length === 0 ? (
          <div className="text-sm text-gray-500 mb-4">
            [Backend: Estado de parcelas del jugador]
          </div>
        ) : (
          <div className="space-y-2">
            {parcels.map((parcel, idx) => (
              <div key={idx} className="border border-gray-300 rounded p-3">
                <div className="font-semibold text-gray-700">{parcel.name}</div>
                <div className="text-sm text-gray-600">Estado: {parcel.status}</div>
                <div className="text-sm text-gray-600">Ubicación: {parcel.location}</div>
              </div>
            ))}
          </div>
        )}

        {/* Parcelas de ejemplo */}
        <div className="space-y-2 mt-4">
          {[1, 2].map((idx) => (
            <div key={idx} className="border border-gray-300 rounded p-3">
              <div className="font-semibold text-gray-700">Parcela {idx}</div>
              <div className="text-sm text-gray-600">Estado: [Backend]</div>
              <div className="text-sm text-gray-600">Ubicación: [Backend]</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}