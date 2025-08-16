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

### New Kubernetes Resources
To add a new Kubernetes resource type:

1. Create the resource schema in `src/config/`
2. Add the resource to `resourceRegistry.ts`
3. Update YAML examples in `src/data/yamlExamples.json`
4. Test the new resource thoroughly

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