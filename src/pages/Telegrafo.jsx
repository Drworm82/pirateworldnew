import React, { useState } from 'react';

export default function Telegrafo() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');

  // Placeholders para datos de backend
  const conversations = []; // Backend
  const rescueRequests = []; // Backend

  return (
    <div className="h-screen flex">
      {/* Lista de conversaciones */}
      <div className="w-1/3 border-r border-gray-300 bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-300">
          <h1 className="text-xl font-bold text-gray-800">Telégrafo</h1>
        </div>

        {/* Peticiones de rescate */}
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Peticiones de Rescate</h2>
          {rescueRequests.length === 0 ? (
            <div className="text-xs text-gray-500">[Backend: Peticiones de rescate]</div>
          ) : (
            <div className="space-y-2">
              {rescueRequests.map((request, idx) => (
                <div key={idx} className="bg-red-50 border border-red-200 rounded p-2 text-xs">
                  <div className="font-semibold text-red-800">{request.from}</div>
                  <div className="text-red-700">{request.message}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Ejemplo */}
          <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-xs">
            <div className="font-semibold text-red-800">Capitán X</div>
            <div className="text-red-700">¡Ayuda! Necesito rescate</div>
          </div>
        </div>

        {/* Conversaciones */}
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Mensajes Privados</h2>
          
          {conversations.length === 0 ? (
            <div className="text-xs text-gray-500">[Backend: Lista de conversaciones]</div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedConversation(conv)}
                  className="w-full text-left p-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <div className="font-semibold text-sm text-gray-800">{conv.name}</div>
                  <div className="text-xs text-gray-600 truncate">{conv.lastMessage}</div>
                </button>
              ))}
            </div>
          )}

          {/* Conversaciones de ejemplo */}
          <div className="space-y-2 mt-2">
            {[1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => setSelectedConversation({ id: idx, name: `Capitán ${idx}` })}
                className="w-full text-left p-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                <div className="font-semibold text-sm text-gray-800">Capitán {idx}</div>
                <div className="text-xs text-gray-600 truncate">Último mensaje...</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vista de conversación */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Header de conversación */}
            <div className="p-4 bg-white border-b border-gray-300">
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedConversation.name}
              </h2>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-center text-gray-500">
                [Backend: Mensajes de la conversación]
              </div>

              {/* Mensajes de ejemplo */}
              <div className="space-y-3 mt-4">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className={`flex ${idx % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs rounded p-3 ${
                      idx % 2 === 0
                        ? 'bg-gray-800 text-white'
                        : 'bg-white border border-gray-300 text-gray-800'
                    }`}>
                      <div className="text-sm">Mensaje de ejemplo {idx}</div>
                      <div className="text-xs mt-1 opacity-70">[Timestamp]</div>
                    </div>
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecciona una conversación
          </div>
        )}
      </div>
    </div>
  );
}