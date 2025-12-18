import React, { useState } from 'react';

export default function BancoMundial() {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('comprar');

  // Placeholders para datos de backend
  const fixedBuyRate = 100; // 1 USD = 100 doblones (fijo)
  const variableWithdrawRate = 0; // Backend (doblones por 1 USD, variable)
  const inflationRate = 0; // Backend
  const economyStatus = ''; // Backend: 'saludable' | 'estable' | 'apretada'
  const economyHistory = []; // Backend (para gráfico)

  const getEconomyStatusText = () => {
    if (economyStatus === 'saludable') return 'Hoy la economía está: saludable';
    if (economyStatus === 'estable') return 'Hoy la economía está: estable';
    if (economyStatus === 'apretada') return 'Hoy la economía está: apretada';
    return '[Backend: Estado de la economía]';
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Banco Mundial</h1>

      {/* Estado de la economía */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Estado Económico</h2>
        
        <div className="text-center py-3 bg-gray-100 rounded mb-4">
          <p className="text-lg font-semibold text-gray-800">{getEconomyStatusText()}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Inflación actual:</span>
            <span className="font-mono text-gray-800">[Backend: {inflationRate}%]</span>
          </div>
        </div>
      </div>

      {/* Tasas de cambio */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Tasas de Cambio</h2>
        
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="text-sm text-gray-600 mb-1">Tasa de compra (fija):</div>
            <div className="text-xl font-bold text-gray-800">
              1 USD = {fixedBuyRate} doblones
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="text-sm text-gray-600 mb-1">Tasa de retiro (variable):</div>
            <div className="text-xl font-bold text-gray-800">
              [Backend: {variableWithdrawRate} doblones = 1 USD]
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico histórico */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Histórico</h2>
        
        <div className="h-48 border-2 border-dashed border-gray-400 bg-gray-50 flex items-center justify-center">
          <span className="text-gray-500">[Placeholder: Gráfico de economía]</span>
        </div>
      </div>

      {/* Transacciones */}
      <div className="bg-white border border-gray-300 rounded p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Realizar Transacción</h2>
        
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTransactionType('comprar')}
              className={`flex-1 py-2 rounded ${
                transactionType === 'comprar'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              Comprar doblones
            </button>
            <button
              onClick={() => setTransactionType('retirar')}
              className={`flex-1 py-2 rounded ${
                transactionType === 'retirar'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              Retirar USD
            </button>
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">
              {transactionType === 'comprar' ? 'Cantidad en USD' : 'Cantidad en doblones'}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <button className="w-full bg-gray-800 text-white py-3 rounded font-semibold hover:bg-gray-700">
            {transactionType === 'comprar' ? 'Comprar' : 'Retirar'}
          </button>
        </div>
      </div>
    </div>
  );
}