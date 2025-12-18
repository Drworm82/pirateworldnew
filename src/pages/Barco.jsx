import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Barco() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);

  const rooms = [
    { id: 'capitan', name: 'Puesto del capitán', bonus: '[Backend: Bonificación activa]' },
    { id: 'cocina', name: 'Cocina', bonus: '[Backend: Bonificación activa]' },
    { id: 'vigia', name: 'Cuarto del vigía', bonus: '[Backend: Bonificación activa]' },
    { id: 'generico', name: 'Cuarto genérico', bonus: '[Backend: Bonificación activa]' },
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Explorar Barco</h1>

      {/* Plano del barco */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Plano del Barco</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className="border-2 border-gray-400 rounded p-4 hover:bg-gray-100 hover:border-gray-600 transition-colors"
            >
              <div className="h-24 flex items-center justify-center border-b border-gray-300 mb-2">
                <span className="text-gray-400 text-xs">[Habitación]</span>
              </div>
              <div className="text-sm font-semibold text-gray-700 text-center">
                {room.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detalle de habitación seleccionada */}
      {selectedRoom && (
        <div className="bg-white border border-gray-300 rounded p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">{selectedRoom.name}</h2>
          <div className="text-sm text-gray-600 mb-2">Bonificación activa:</div>
          <div className="bg-gray-100 border border-gray-300 rounded p-3">
            <span className="font-mono text-sm text-gray-800">{selectedRoom.bonus}</span>
          </div>
        </div>
      )}

      {/* Botón volver */}
      <button
        onClick={() => navigate(createPageUrl('Viaje'))}
        className="w-full bg-gray-800 text-white py-3 rounded font-semibold hover:bg-gray-700"
      >
        Volver al viaje
      </button>
    </div>
  );
}