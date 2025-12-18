import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Viaje() {
  const navigate = useNavigate();

  // Placeholders para datos de backend
  const progress = 0; // Backend (0-100)
  const eta = ''; // Backend
  const currentSpeed = 0; // Backend
  const weatherStatus = ''; // Backend
  const currentRisk = 0; // Backend
  const shipHP = 100; // Backend
  const eventsLog = []; // Backend

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Viaje en Curso</h1>

      {/* Barra de progreso */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progreso del viaje</span>
          <span className="text-sm font-mono text-gray-800">[Backend: {progress}%]</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-600"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Estado del viaje */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Estado</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">ETA:</span>
            <span className="font-mono text-gray-800">[Backend: {eta}]</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Velocidad actual:</span>
            <span className="font-mono text-gray-800">[Backend: {currentSpeed} nudos]</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Estado del clima:</span>
            <span className="font-mono text-gray-800">[Backend: {weatherStatus}]</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Riesgo actual:</span>
            <span className="font-mono text-gray-800">[Backend: {currentRisk}%]</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">HP del barco:</span>
            <span className="font-mono text-gray-800">[Backend: {shipHP}%]</span>
          </div>
        </div>
      </div>

      {/* Eventos ocurridos */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Eventos</h2>
        <div className="space-y-2">
          {eventsLog.length === 0 ? (
            <div className="text-sm text-gray-500">[Backend: Lista de eventos ocurridos]</div>
          ) : (
            eventsLog.map((event, idx) => (
              <div key={idx} className="text-sm text-gray-600 border-l-2 border-gray-300 pl-2">
                {event}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="space-y-3">
        <button className="w-full bg-white border-2 border-gray-600 py-3 rounded font-semibold hover:bg-gray-50">
          Acelerar (ver anuncio)
        </button>
        
        <button
          onClick={() => navigate(createPageUrl('Barco'))}
          className="w-full bg-gray-800 text-white py-3 rounded font-semibold hover:bg-gray-700"
        >
          Explorar barco
        </button>

        <button
          onClick={() => navigate(createPageUrl('GPS'))}
          className="w-full bg-white border border-gray-300 py-3 rounded hover:bg-gray-50"
        >
          Volver al mapa GPS
        </button>
      </div>
    </div>
  );
}