import Header from './components/ui/Header';
import FlowEditor from './components/flow/FlowEditor';
import { DnDProvider } from './components/flow/DnDContext';
import './index.css';

function App() {
  return (
    <DnDProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="sticky top-0 z-50">
          <Header />
        </div>
        <div className="h-[calc(100vh-60px)]">
          <FlowEditor />
        </div>
      </div>
    </DnDProvider>
  );
}

export default App;