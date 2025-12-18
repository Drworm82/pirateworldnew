import React, { useState } from 'react';

export default function ChatLocal() {
  const [message, setMessage] = useState('');

  // Placeholders para datos de backend
  const messages = []; // Backend
  const currentLocation = ''; // Backend

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-300">
        <h1 className="text-xl font-bold text-gray-800">Chat Local</h1>
        <div className="text-sm text-gray-600">
          Proximidad: <span className="font-mono">[Backend: {currentLocation}]</span>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            [Backend: Mensajes del chat local por proximidad]
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className="bg-white rounded p-3 border border-gray-300">
                <div className="font-semibold text-sm text-gray-800">{msg.username}</div>
                <div className="text-sm text-gray-700 mt-1">{msg.content}</div>
                <div className="text-xs text-gray-500 mt-1">{msg.timestamp}</div>
              </div>
            ))}
          </div>
        )}

        {/* Mensajes de ejemplo */}
        <div className="space-y-3 mt-4">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-white rounded p-3 border border-gray-300">
              <div className="font-semibold text-sm text-gray-800">Usuario {idx}</div>
              <div className="text-sm text-gray-700 mt-1">
                Mensaje de ejemplo {idx} en el chat local
              </div>
              <div className="text-xs text-gray-500 mt-1">[Timestamp]</div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-300">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <button className="px-6 py-2 bg-gray-800 text-white rounded font-semibold hover:bg-gray-700">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}   