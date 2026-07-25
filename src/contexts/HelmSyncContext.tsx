import { createContext, useContext } from 'react';

export interface HelmSyncContextValue {
  generatedValues: string;
  setNodeAutoSync: (nodeId: string, autoSync: boolean) => void;
}

const defaultValue: HelmSyncContextValue = {
  generatedValues: '',
  setNodeAutoSync: () => {},
};

export const HelmSyncContext = createContext<HelmSyncContextValue>(defaultValue);

export function useHelmSync(): HelmSyncContextValue {
  return useContext(HelmSyncContext);
}
