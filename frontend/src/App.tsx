import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-12 border-4 border-blue-500">
          <h1 className="text-6xl font-black text-purple-800 mb-8 text-center">
            🎯 TAILWIND テスト
          </h1>
          <p className="text-xl text-green-700 mb-8 text-center font-bold">
            このテキストが緑色で大きく表示され、背景が赤色なら Tailwind CSS が動作しています！
          </p>
          <div className="space-y-6">
            <button className="w-full bg-yellow-400 hover:bg-yellow-600 text-black font-bold py-6 px-8 rounded-xl text-2xl transition-all duration-300 transform hover:scale-105">
              🟡 黄色いボタン（ホバーで濃い黄色）
            </button>
            <button className="w-full bg-pink-500 hover:bg-pink-700 text-white font-bold py-6 px-8 rounded-xl text-2xl transition-all duration-300 transform hover:scale-105">
              🌸 ピンクのボタン（ホバーで濃いピンク）
            </button>
          </div>
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-xl">
            <p className="text-xl font-bold text-center">
              ✅ グラデーション背景が表示されていれば成功！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
