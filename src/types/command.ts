import React from 'react';

export interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  execute: (...args: any[]) => Promise<void> | void;
  shortcut?: string[];
  canExecute?: () => boolean;
}
