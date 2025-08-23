import { useState, useEffect, useCallback } from 'react';
import { type Command } from '../types/command';

export const useCommands = (commands: Command[]) => {
  const [executingCommand, setExecutingCommand] = useState<string | null>(null);

  const executeCommand = useCallback(async (commandId: string, ...args: any[]) => {
    const command = commands.find(c => c.id === commandId);
    if (command && (command.canExecute ? command.canExecute() : true)) {
      setExecutingCommand(command.id);
      try {
        await command.execute(...args);
      } finally {
        setExecutingCommand(null);
      }
    }
  }, [commands]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = event.key.toUpperCase();
      
      for (const command of commands) {
        if (command.shortcut) {
          const shortcutKey = command.shortcut[0];
          if (shortcutKey.toUpperCase() === key) {
            event.preventDefault();
            executeCommand(command.id);
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [commands, executeCommand]);

  return { executeCommand, executingCommand };
};
