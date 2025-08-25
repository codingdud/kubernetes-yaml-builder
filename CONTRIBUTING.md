# Contributing to Kubernetes YAML Builder

We welcome contributions to the Kubernetes YAML Builder! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/your-username/kubernetes-yaml-builder.git
cd kubernetes-yaml-builder
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing code formatting and naming conventions
- Use meaningful variable and function names
- Add comments for complex logic

### Component Guidelines
- Use functional components with hooks
- Keep components small and focused
- Use proper TypeScript interfaces for props
- Follow the existing folder structure

### Styling
- Use Tailwind CSS classes for styling
- Support both light and dark modes
- Ensure responsive design
- Follow existing design patterns

## Making Changes

### Branch Naming
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`

### Commit Messages
Use clear, descriptive commit messages:
```
feat: add new Kubernetes resource type
fix: resolve dark mode styling issue
docs: update installation instructions
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test your changes thoroughly
4. Update documentation if needed
5. Submit a pull request with:
   - Clear description of changes
   - Screenshots for UI changes
   - Test instructions

## Adding New Features

### Adding New Kubernetes Resources

We welcome contributions for new Kubernetes resources. To add support for a resource like a `PersistentVolumeClaim` or `NetworkPolicy`, follow these steps. This guide will use a `PersistentVolumeClaim` (PVC) as an example.

#### 1. Create the JSON Schema

First, you need a JSON Schema that defines the structure and properties of the Kubernetes resource. The best source for this is the official Kubernetes documentation.

- **Action**: Create a new JSON file in `src/schemas/kubernetes/`.
- **Example**: Create `src/schemas/kubernetes/persistentvolumeclaim.json`.

This schema should define all the properties, types, and default values for the resource. You can often find stripped-down or community-generated schemas online to use as a starting point.

**Example `persistentvolumeclaim.json`:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["apiVersion", "kind", "metadata", "spec"],
  "properties": {
    "apiVersion": {
      "type": "string",
      "enum": ["v1"],
      "default": "v1"
    },
    "kind": {
      "type": "string",
      "enum": ["PersistentVolumeClaim"],
      "default": "PersistentVolumeClaim"
    },
    "metadata": {
      "type": "object",
      "required": ["name"],
      "properties": {
        "name": { "type": "string" },
        "namespace": { "type": "string" }
      }
    },
    "spec": {
      "type": "object",
      "required": ["accessModes", "resources"],
      "properties": {
        "accessModes": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["ReadWriteOnce", "ReadOnlyMany", "ReadWriteMany"]
          }
        },
        "resources": {
          "type": "object",
          "required": ["requests"],
          "properties": {
            "requests": {
              "type": "object",
              "required": ["storage"],
              "properties": {
                "storage": { "type": "string", "default": "1Gi" }
              }
            }
          }
        },
        "storageClassName": {
          "type": "string"
        }
      }
    }
  }
}
```

#### 2. Define the UI Schema

The UI Schema controls how the form for the new resource is rendered. It allows you to specify widgets, placeholders, and the order of fields.

- **Action**: Add a new exported `UiSchema` object in `src/schemas/uiSchema.ts`.
- **Example**: Add `export const persistentvolumeclaimUiSchema: UiSchema = { ... };`

This object mirrors the structure of your JSON schema but provides UI-specific directives.

**Example for PVC in `uiSchema.ts`:**
```typescript
export const persistentvolumeclaimUiSchema: UiSchema = {
  'metadata': {
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'pvc-name'
    },
    'namespace': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'default'
    }
  },
  'spec': {
    'accessModes': {
      'ui:widget': 'MultiSelectWidget' // Use a custom multi-select widget
    },
    'resources': {
      'requests': {
        'storage': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'e.g., 10Gi or 500Mi'
        }
      }
    },
    'storageClassName': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'e.g., standard'
    }
  }
};
```

#### 3. Register the Resource

The resource registry is the central hub that connects the schema, UI schema, default values, and the visual node component.

- **Action**: Add a new entry to the `resourceRegistry` object in `src/config/resourceRegistry.ts`.

**Example for PVC in `resourceRegistry.ts`:**
```typescript
// 1. Import the schema and UI schema
import persistentvolumeclaimSchema from '../schemas/kubernetes/persistentvolumeclaim.json';
import { persistentvolumeclaimUiSchema } from '../schemas/uiSchema';

// 2. Add the entry to the registry
const resourceRegistry = {
  // ... other resources
  PersistentVolumeClaim: {
    schema: persistentvolumeclaimSchema,
    uiSchema: persistentvolumeclaimUiSchema,
    NodeComponent: ResourceNode, // Use the generic component for now
    defaultResource: { 
      apiVersion: 'v1', 
      kind: 'PersistentVolumeClaim', 
      metadata: { name: 'new-pvc' },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '1Gi' } }
      }
    }
  },
  // ... other resources
};
```

#### 4. Create the Node Component (Optional)

For most resources, the generic `ResourceNode` component located at `src/components/flow/nodes/ResourceNode.tsx` is sufficient. It displays the resource `kind` and `name`.

If your new resource requires a unique visualization on the canvas (e.g., a different icon, color, or layout), you can create a custom React component for it.

- **Action**: Create a new component file (e.g., `PvcNode.tsx`) and reference it in the `NodeComponent` property in the `resourceRegistry` instead of `ResourceNode`.
- **Best Practice**: For consistency, it's best to use the `ResourceNode` unless there is a strong reason for a custom design.

After completing these steps, add the new resource to one of the groups in `Toolbar.tsx` to make it accessible from the "Add Resource" menu, and test it thoroughly.

### New UI Components
- Place reusable components in `src/components/ui/`
- Follow existing component patterns
- Include proper TypeScript interfaces
- Support dark mode styling

### New Tools
To add developer tools:
1. Add the tool to `src/components/ui/ToolsModal.tsx`
2. Follow existing tool patterns
3. Include proper error handling
4. Add user-friendly interfaces

## Testing

### Manual Testing
- Test all new features in both light and dark modes
- Verify responsive design on different screen sizes
- Test keyboard navigation and accessibility
- Ensure YAML generation works correctly

### Browser Support
Test in modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Documentation

### Code Documentation
- Add JSDoc comments for complex functions
- Document component props with TypeScript interfaces
- Include usage examples for new components

### User Documentation
- Update README.md for new features
- Add screenshots for UI changes
- Update usage instructions

## Issue Reporting

### Bug Reports
Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS information
- Screenshots if applicable

### Feature Requests
Include:
- Clear description of the feature
- Use case and benefits
- Proposed implementation approach

## Code Review Process

### For Contributors
- Respond to review feedback promptly
- Make requested changes in separate commits
- Keep discussions focused and constructive

### For Reviewers
- Review code for functionality, style, and performance
- Test changes locally when possible
- Provide constructive feedback
- Approve when ready for merge

## Release Process

1. Version bumping follows semantic versioning
2. Update CHANGELOG.md with new features and fixes
3. Create release notes highlighting major changes
4. Tag releases appropriately

## Community Guidelines

### Be Respectful
- Use inclusive language
- Be patient with new contributors
- Provide helpful feedback
- Respect different perspectives

### Communication
- Use GitHub issues for bug reports and feature requests
- Use pull request comments for code-specific discussions
- Be clear and concise in communications

## Getting Help

- Check existing issues and documentation first
- Create a new issue with detailed information
- Join community discussions
- Ask questions in pull request comments

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to Kubernetes YAML Builder!