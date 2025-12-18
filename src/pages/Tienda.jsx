import React, { useState } from 'react';

export default function Tienda() {
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Placeholders para datos de backend
  const items = []; // Backend
  const categories = ['Todos', 'Ropa', 'Armas', 'Mapas', 'Consumibles']; // Backend

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tienda</h1>

      {/* Selector de categorías */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Categorías</h2>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category.toLowerCase())}
              className={`px-4 py-2 rounded border ${
                selectedCategory === category.toLowerCase()
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de objetos */}
      <div className="bg-white border border-gray-300 rounded p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Objetos</h2>
        
        {items.length === 0 ? (
          <div className="text-sm text-gray-500 mb-4">
            [Backend: Lista de objetos disponibles]
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="border border-gray-300 rounded p-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-700">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-gray-800">{item.price} doblones</div>
                  <button className="mt-1 px-3 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-700">
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Objetos de ejemplo */}
        <div className="space-y-2 mt-4">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="border border-gray-300 rounded p-3 flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-700">Objeto ejemplo {idx}</div>
                <div className="text-sm text-gray-600">Descripción del objeto</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-gray-800">[Precio]</div>
                <button className="mt-1 px-3 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-700">
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}