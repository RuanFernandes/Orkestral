# Orkestral

**Visual orchestration for Docker Compose**

Orkestral is a production-quality web application that allows developers to design container architectures using a visual canvas and export production-ready `docker-compose.yml` files.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Chakra UI](https://img.shields.io/badge/Chakra_UI-2.8-teal)

---

## Features

### Core Functionality

- **Visual Canvas**: Drag-and-drop interface powered by React Flow for designing container architectures
- **Service Nodes**: Each node represents a Docker Compose service with full configuration support
- **Dependency Management**: Visually connect services to define `depends_on` relationships
- **Real-time YAML Generation**: Automatically generate valid `docker-compose.yml` as you design
- **YAML Viewer**: Monaco Editor integration with syntax highlighting and copy/download functionality
- **Service Templates**: Quick-start templates for common services (Node.js, PostgreSQL, Redis, MongoDB, MySQL, Nginx)
- **Import/Export**: Import existing `docker-compose.yml` files or export your designs

### Service Configuration

Each service supports comprehensive Docker Compose options:

- Container name and image
- Port mappings
- Volume mounts
- Environment variables
- Network configuration
- Restart policies
- Custom commands
- Service dependencies

---

## Tech Stack

| Technology        | Purpose                         |
| ----------------- | ------------------------------- |
| **Next.js 16**    | React framework with App Router |
| **TypeScript**    | Type-safe development           |
| **Chakra UI**     | Component library for UI        |
| **Zustand**       | Lightweight state management    |
| **React Flow**    | Node-based visual editor        |
| **Monaco Editor** | Code editor for YAML viewing    |
| **js-yaml**       | YAML parsing and generation     |
| **Lucide React**  | Icon library                    |

---

## Project Structure

```
orkestral/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Main application page
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── Canvas.tsx          # React Flow canvas
│   │   ├── ServiceNode.tsx     # Service node component
│   │   ├── ServiceEditor.tsx   # Service configuration drawer
│   │   ├── YamlViewer.tsx      # Monaco editor for YAML
│   │   ├── Header.tsx          # Top navigation bar
│   │   ├── TemplateModal.tsx   # Service template selector
│   │   └── Providers.tsx       # Chakra UI provider
│   │
│   ├── store/                  # State management
│   │   └── composeStore.ts     # Zustand store
│   │
│   ├── lib/                    # Utilities
│   │   ├── composeGenerator.ts # YAML generation logic
│   │   └── templates.ts        # Service templates
│   │
│   └── types/                  # TypeScript definitions
│       └── compose.ts          # Type definitions
│
├── public/                     # Static assets
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── next.config.ts             # Next.js configuration
```

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. **Clone or navigate to the project directory:**

```bash
cd orkestral
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
```

4. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## Usage Guide

### Adding Services

1. Click the **"Add Service"** button in the header
2. Select a template (Node.js, PostgreSQL, Redis, etc.)
3. The service will appear as a node on the canvas

### Configuring Services

1. Click the **Edit icon** (pencil) on any service node
2. Configure in the side drawer:
   - General settings (name, image, container name)
   - Ports (e.g., `3000:3000`)
   - Volumes (e.g., `./data:/app/data`)
   - Environment variables (key-value pairs)
   - Networks
   - Advanced options (restart policy, custom commands)
3. Click **Save Changes**

### Creating Dependencies

1. Drag from the **bottom handle** of one service node
2. Connect to the **top handle** of another service
3. This creates a `depends_on` relationship

### Exporting YAML

1. The YAML panel on the right shows real-time generated `docker-compose.yml`
2. Click the **Copy icon** to copy to clipboard
3. Click the **Download icon** to download the file

### Importing Existing Files

1. Click the **Upload icon** in the YAML viewer
2. Select a `docker-compose.yml` file
3. Services will be imported to the canvas

---

## Architecture

### State Management

Orkestral uses Zustand for centralized state management:

```typescript
interface ComposeStore {
  services: ComposeService[]; // All services
  selectedServiceId: string | null; // Currently editing
  yamlPanelOpen: boolean; // Panel visibility

  // Actions
  addService: (service) => void;
  updateService: (id, updates) => void;
  deleteService: (id) => void;
  // ... more actions
}
```

### Component Hierarchy

```
App (page.tsx)
├── Header
│   └── TemplateModal
├── Canvas (React Flow Provider)
│   └── ServiceNode (multiple)
├── YamlViewer (Monaco Editor)
└── ServiceEditor (Drawer)
```

### Data Flow

1. User interacts with Canvas or ServiceEditor
2. Actions are dispatched to Zustand store
3. Store updates services array
4. Components re-render automatically
5. YAML generator creates docker-compose.yml
6. YamlViewer displays the result

---

## Design Philosophy

### Developer-Focused UX

- Clean, minimalistic interface inspired by Vercel, Linear, and Raycast
- No emojis—icons from Lucide React
- Flat design with subtle borders
- Dark theme optimized for extended use

### Color Palette

```
Background:  #0f172a
Canvas:      #111827
Panels:      #1f2937
Borders:     #2d3748
Accent:      #3b82f6 (blue.400)
Text:        #f3f4f6 (gray.100)
Secondary:   #9ca3af (gray.400)
```

---

## Code Quality

### TypeScript Strict Mode

All code is written in TypeScript with strict type checking enabled.

### Component Structure

- Modular, reusable components
- Clear separation of concerns
- Comprehensive type definitions
- Documented functions and interfaces

### Best Practices

- React hooks for state and effects
- Memoization for performance optimization
- Proper error handling
- Accessibility considerations (ARIA labels)

---

## Future Enhancements

Potential features for future versions:

- [ ] YAML validation with error highlighting
- [ ] Export/import project as JSON
- [ ] Share projects via URL
- [ ] Service icons for visual distinction
- [ ] Keyboard shortcuts for common actions
- [ ] Multi-select and bulk operations
- [ ] Undo/redo functionality
- [ ] Connection labels for custom relationships
- [ ] Docker Compose v3 advanced features (configs, secrets, deploy)

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

---

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

## Support

For issues or questions:

- Create an issue in the repository
- Check existing documentation
- Review the code comments for implementation details

---

## Acknowledgments

Built with:

- [Next.js](https://nextjs.org/)
- [React Flow](https://reactflow.dev/)
- [Chakra UI](https://chakra-ui.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

**Orkestral** - Making Docker Compose visual and intuitive.
