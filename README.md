# Kubernetes YAML Builder

Visual drag-and-drop tool for building Kubernetes YAML configurations.

## Core Features

- **Visual Flow Editor**: Drag-and-drop interface with node-based resource design
- **Live YAML Generation**: Real-time YAML output as you build configurations
- **Multiple Resources**: Deployments, Services, ConfigMaps, Secrets, StatefulSets, DaemonSets, Jobs, CronJobs, Ingress
- **Developer Tools**: Base64 encoder/decoder, documentation panel, copy to clipboard
- **Modern UI**: Dark/light mode, responsive design, collapsible interface

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

**Requirements**: Node.js 18+

## Usage

1. Add Kubernetes resources from sidebar
2. Configure resources using auto-generated forms
3. Connect related resources visually
4. View real-time YAML output
5. Download complete configuration

## Tech Stack

React 18 + TypeScript, Tailwind CSS, React Flow, Vite

## License

MIT License