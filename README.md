# Kubernetes YAML Builder

A visual, interactive tool for building Kubernetes YAML configurations using a drag-and-drop flow interface.

## Features

### 🎨 Visual Flow Editor
- **Drag & Drop Interface**: Create Kubernetes resources using an intuitive visual flow
- **Node-based Design**: Each Kubernetes resource is represented as a configurable node
- **Real-time Connections**: Connect resources to visualize dependencies
- **Collapsible Forms**: Minimize node forms to save space while maintaining overview

### 🛠️ Resource Management
- **Multiple Resource Types**: Support for Deployments, Services, ConfigMaps, Secrets, StatefulSets, DaemonSets, Jobs, CronJobs, and Ingress
- **Dynamic Forms**: Auto-generated forms based on Kubernetes resource schemas
- **Live YAML Generation**: Real-time YAML output as you build your configuration
- **Download Support**: Export your complete YAML configuration

### 🎯 Developer Tools
- **Base64 Encoder/Decoder**: Built-in tool for encoding secrets and configuration data
- **Documentation Panel**: Quick access to YAML examples for all supported resources
- **Copy to Clipboard**: Easy copying of generated configurations

### 🌙 Modern UI/UX
- **Dark/Light Mode**: Full theme support with system preference detection
- **Responsive Design**: Works on desktop and tablet devices
- **Collapsible Sidebar**: Maximize workspace when needed
- **Sticky Header**: Always accessible navigation and tools

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kubernetes-yaml-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating Resources
1. **Add Nodes**: Click the resource buttons in the sidebar to add Kubernetes resources
2. **Configure**: Fill out the auto-generated forms for each resource
3. **Connect**: Draw connections between related resources
4. **Preview**: View the generated YAML in real-time
5. **Download**: Export your complete configuration

### Using Tools
- **Tools Panel**: Click the wrench icon to access developer utilities
- **Documentation**: Click the book icon to view YAML examples
- **Theme Toggle**: Click the theme icon to switch between light/dark modes

### Node Management
- **Collapse Forms**: Use the chevron button to minimize node forms
- **Delete Nodes**: Use the X button to remove unwanted resources
- **Move Nodes**: Drag nodes around the canvas to organize your flow

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Flow Editor**: React Flow
- **Forms**: React JSON Schema Form
- **Icons**: Lucide React
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/
│   ├── flow/           # Flow editor and nodes
│   ├── forms/          # Dynamic form components
│   └── ui/             # Reusable UI components
├── config/             # Resource registry and schemas
├── data/               # Static data (YAML examples)
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Additional Kubernetes resources (PVCs, NetworkPolicies, etc.)
- [ ] YAML validation and linting
- [ ] Template system for common configurations
- [ ] Export to different formats (Helm charts, Kustomize)
- [ ] Collaboration features
- [ ] Integration with Kubernetes clusters

## Support

If you encounter any issues or have questions, please open an issue on GitHub
