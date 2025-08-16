import React, { useState, useEffect } from 'react';
import FlowEditor from './components/flow/FlowEditor';
import './index.css';

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="App">
      <header className="bg-blue-600 dark:bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Kubernetes YAML Builder</h1>
          <p className="text-blue-100 dark:text-gray-300">Visual editor for Kubernetes resources</p>
        </div>
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg bg-blue-500 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </header>
      <FlowEditor />
    </div>
  );
}

export default App;