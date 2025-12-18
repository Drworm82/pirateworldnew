import React, { useState } from 'react';

export default function MapaMundo() {
  const [activeLayers, setActiveLayers] = useState({
    descubierto: true,
    noDescubierto: false,
    mapasFalsos: false,
    mapasOficiales: true,
  });

  // Placeholders para datos de backend
  const explorationProgress = 0; // Backend (0-100)
  const ownedMaps = []; // Backend

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mapa Mundo</h1>

      {/* Controles de capas */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Capas</h2>
        
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.descubierto}
              onChange={() => toggleLayer('descubierto')}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Descubierto</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.noDescubierto}
              onChange={() => toggleLayer('noDescubierto')}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">No descubierto</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.mapasFalsos}
              onChange={() => toggleLayer('mapasFalsos')}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Mapas falsos</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.mapasOficiales}
              onChange={() => toggleLayer('mapasOficiales')}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Mapas oficiales</span>
          </label>
        </div>
      </div>

      {/* Mapa general */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <div className="h-96 border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-100">
          <span className="text-gray-500">[Placeholder: Mapa general del mundo]</span>
        </div>
      </div>

      {/* Progreso de exploración (ecúmene) */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Exploración (Ecúmene)</h2>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progreso</span>
          <span className="text-sm font-mono text-gray-800">[Backend: {explorationProgress}%]</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-600"
            style={{ width: `${explorationProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Lista de mapas poseídos */}
      <div className="bg-white border border-gray-300 rounded p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Mapas Poseídos</h2>
        
        {ownedMaps.length === 0 ? (
          <div className="text-sm text-gray-500">[Backend: Lista de mapas que posees]</div>
        ) : (
          <div className="space-y-2">
            {ownedMaps.map((map, idx) => (
              <div key={idx} className="border border-gray-300 rounded p-3">
                <div className="font-semibold text-gray-700">{map.name}</div>
                <div className="text-sm text-gray-600">{map.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}