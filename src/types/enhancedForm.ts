import { type RegistryWidgetsType, type TemplatesType, type RegistryFieldsType } from '@rjsf/utils';
import { type K8sNodeData } from './reactFlow';

// Enhanced form props interface that extends the basic form functionality
export interface EnhancedDynamicK8sFormProps {
  nodeData: K8sNodeData;
  className?: string;
  compact?: boolean;
  theme?: 'default' | 'enhanced';
}

// Theme configuration interface for organizing form customizations
export interface FormTheme {
  templates?: Partial<TemplatesType>;
  widgets?: RegistryWidgetsType;
  fields?: Partial<RegistryFieldsType>;
}

// Enhanced node data interface (optional extension for future use)
export interface EnhancedK8sNodeData extends K8sNodeData {
  formConfig?: {
    compact?: boolean;
    collapsible?: boolean;
    sections?: Array<{
      title: string;
      fields: string[];
      collapsible?: boolean;
    }>;
  };
}

// Type guard for enhanced node data
export function isEnhancedNodeData(data: K8sNodeData): data is EnhancedK8sNodeData {
  return 'formConfig' in data;
}

// Form style configuration interface
export interface FormStyleConfig {
  spacing: {
    field: string;
    section: string;
    inline: string;
  };
  colors: {
    border: string;
    background: string;
    text: string;
    error: string;
    success: string;
  };
  typography: {
    label: string;
    description: string;
    error: string;
  };
}