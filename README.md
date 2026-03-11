# Orkestral

**Visual orchestration for Docker Compose**

Orkestral is a production-quality web application that allows developers to design container architectures using a visual canvas and export production-ready `docker-compose.yml` files.

![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Chakra UI](https://img.shields.io/badge/Chakra_UI-2.10-teal)
![React Flow](https://img.shields.io/badge/React_Flow-11.11-purple)
![Test Coverage](https://img.shields.io/badge/coverage-check_reports-green)

---

## ✨ Features

### Core Functionality

- **Visual Canvas**: Drag-and-drop interface powered by React Flow for designing container architectures
- **Service Nodes**: Each node represents a Docker Compose service with full configuration support
- **Dependency Management**: Visually connect services to define `depends_on` relationships
- **Real-time YAML Generation**: Automatically generate valid `docker-compose.yml` as you design
- **YAML Viewer**: Monaco Editor integration with syntax highlighting and copy/download functionality
- **Service Templates**: Quick-start templates for common services (Node.js, PostgreSQL, Redis, MongoDB, MySQL, Nginx)
- **Import/Export**: Import existing `docker-compose.yml` files or export your designs
- **Internationalization**: Built-in support for English and Portuguese (pt-BR)
- **Auto-save**: Automatically saves your work to local storage
- **Network Management**: Create and manage custom Docker networks with visual connections
- **Docker Hub Integration**: Search and autocomplete Docker images directly from Docker Hub

### Service Configuration

Each service supports comprehensive Docker Compose options:

- Container name and image selection
- Port mappings (host:container)
- Volume mounts (bind mounts and named volumes)
- Environment variables (key-value pairs)
- Network configuration (multiple networks per service)
- Restart policies (always, on-failure, unless-stopped)
- Custom commands and entrypoints
- Service dependencies (depends_on)

---

## 📚 Tech Stack

| Technology        | Purpose                                      |
| ----------------- | -------------------------------------------- |
| **Next.js 16**    | React framework with App Router              |
| **TypeScript**    | Type-safe development                        |
| **Chakra UI**     | Component library for UI                     |
| **Zustand**       | Lightweight state management                 |
| **React Flow**    | Node-based visual editor                     |
| **Monaco Editor** | Code editor for YAML viewing                 |
| **js-yaml**       | YAML parsing and generation                  |
| **Lucide React**  | Icon library                                 |
| **next-intl**     | Internationalization (i18n)                  |
| **Jest**          | Testing framework with React Testing Library |

---

## 📂 Project Structure

```
orkestral/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout with i18n providers
│   │   ├── page.tsx                   # Main application page
│   │   ├── globals.css                # Global styles
│   │   └── api/                       # API routes
│   │       └── docker/                # Docker Hub integration
│   │           ├── search/            # Search Docker images
│   │           └── tags/              # Fetch image tags
│   │
│   ├── components/                    # React components
│   │   ├── Canvas.tsx                 # React Flow canvas
│   │   ├── ServiceNode.tsx            # Service node component
│   │   ├── NetworkNode.tsx            # Network node component
│   │   ├── CommentNode.tsx            # Comment/annotation node
│   │   ├── ServiceEditor.tsx          # Service configuration drawer
│   │   ├── YamlViewer.tsx             # Monaco editor for YAML
│   │   ├── Header.tsx                 # Top navigation bar
│   │   ├── TemplateModal.tsx          # Service template selector
│   │   ├── NetworkModal.tsx           # Network management modal
│   │   ├── LanguageSwitcher.tsx       # Language toggle (en/pt-BR)
│   │   ├── DockerImageAutocomplete.tsx # Docker Hub autocomplete
│   │   ├── DependencyEdge.tsx         # Custom edge for dependencies
│   │   ├── NetworkEdge.tsx            # Custom edge for networks
│   │   ├── Providers.tsx              # App providers (Chakra, i18n)
│   │   ├── OrkestralWatermark.tsx     # Branding watermark
│   │   └── __tests__/                 # Component tests
│   │
│   ├── store/                         # State management
│   │   ├── composeStore.ts            # Zustand store
│   │   └── __tests__/                 # Store tests
│   │
│   ├── lib/                           # Utilities
│   │   ├── composeGenerator.ts        # YAML generation logic
│   │   ├── templates.ts               # Service templates
│   │   ├── workflowUtils.ts           # Save/load/export utilities
│   │   └── __tests__/                 # Utility tests
│   │
│   ├── i18n/                          # Internationalization
│   │   ├── request.ts                 # i18n request handler
│   │   └── routing.ts                 # Locale routing config
│   │
│   └── types/                         # TypeScript definitions
│       └── compose.ts                 # Type definitions
│
├── messages/                          # Translation files
│   ├── en-us.json                     # English translations
│   └── pt-br.json                     # Portuguese translations
│
├── public/                            # Static assets
├── coverage/                          # Test coverage reports
├── jest.config.mjs                    # Jest configuration
├── jest.setup.ts                      # Jest setup file
├── eslint.config.mjs                  # ESLint configuration
├── tsconfig.json                      # TypeScript configuration
├── next.config.ts                     # Next.js configuration
├── middleware.ts                      # Next.js middleware (i18n)
├── package.json                       # Dependencies
├── LICENSE                            # CC BY-NC 4.0 License
└── README.md                          # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/orkestral.git
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

### Run Tests

```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

---

## 📖 Usage Guide

### Adding Services

1. Click the **"Add Service"** button in the header
2. Select a template (Node.js, PostgreSQL, Redis, MongoDB, MySQL, Nginx, etc.)
3. The service will appear as a node on the canvas

### Configuring Services

1. Click the **Edit icon** (pencil) on any service node
2. Configure in the side drawer:
   - **General settings**: name, image, container name
   - **Ports**: e.g., `3000:3000`, `8080:80`
   - **Volumes**: e.g., `./data:/app/data`, `db_data:/var/lib/postgresql/data`
   - **Environment variables**: key-value pairs (e.g., `NODE_ENV=production`)
   - **Networks**: select or create custom networks
   - **Advanced options**: restart policy, custom commands, healthchecks
3. Click **Save Changes**

### Creating Dependencies

1. Drag from the **bottom handle** of one service node
2. Connect to the **top handle** of another service
3. This creates a `depends_on` relationship in the YAML

### Managing Networks

1. Click the **Network icon** in the header to open the Network Modal
2. Create custom networks with specific configurations
3. Connect services by dragging from the **circle handle** on the side of nodes
4. Network connections are visualized as dashed lines

### Exporting YAML

1. The YAML panel on the right shows real-time generated `docker-compose.yml`
2. Click the **Copy icon** to copy to clipboard
3. Click the **Download icon** to save as a file

### Importing Existing Files

1. Click the **Upload icon** in the YAML viewer
2. Select an existing `docker-compose.yml` file
3. Services and networks will be imported to the canvas automatically

---

## 🏗️ Architecture

### State Management

Orkestral uses **Zustand** for centralized state management with a clean, intuitive API:

```typescript
interface ComposeStore {
  services: ComposeService[]; // All Docker services
  networks: Network[]; // Custom networks
  selectedServiceId: string | null; // Currently editing
  yamlPanelOpen: boolean; // YAML panel visibility
  autoSaveEnabled: boolean; // Auto-save toggle

  // Actions
  addService: (service: ComposeService) => void;
  updateService: (id: string, updates: Partial<ComposeService>) => void;
  deleteService: (id: string) => void;
  addNetwork: (network: Network) => void;
  loadWorkflow: (workflow: SavedWorkflow) => void;
  // ... more actions
}
```

### Component Hierarchy

```
App (page.tsx)
├── Header
│   ├── TemplateModal
│   ├── NetworkModal
│   └── LanguageSwitcher
├── Canvas (React Flow Provider)
│   ├── ServiceNode (multiple)
│   ├── NetworkNode (multiple)
│   ├── CommentNode (multiple)
│   ├── DependencyEdge
│   └── NetworkEdge
├── YamlViewer (Monaco Editor)
└── ServiceEditor (Drawer)
```

### Data Flow

1. **User Interaction**: User interacts with Canvas, ServiceEditor, or other components
2. **Action Dispatch**: Actions are dispatched to Zustand store
3. **State Update**: Store updates services/networks array immutably
4. **Component Re-render**: React components re-render automatically
5. **YAML Generation**: Compose generator creates `docker-compose.yml` from state
6. **Display**: YamlViewer displays the generated result
7. **Auto-save**: Changes are persisted to localStorage (if enabled)

---

## 🎨 Design Philosophy

### Developer-Focused UX

- **Clean, minimalistic interface** inspired by Vercel, Linear, and Raycast
- **Professional iconography** from Lucide React
- **Flat design** with subtle borders and depth
- **Dark theme** optimized for extended coding sessions
- **Intuitive controls** with keyboard shortcuts and contextual actions

### Color Palette

```css
Background:  #0f172a  /* slate-900 */
Canvas:      #111827  /* gray-900 */
Panels:      #1f2937  /* gray-800 */
Borders:     #2d3748  /* gray-700 */
Accent:      #3b82f6  /* blue-400 */
Text:        #f3f4f6  /* gray-100 */
Secondary:   #9ca3af  /* gray-400 */
Success:     #10b981  /* green-500 */
Warning:     #f59e0b  /* amber-500 */
Error:       #ef4444  /* red-500 */
```

---

## ✅ Code Quality

### TypeScript Strict Mode

All code is written in TypeScript with **strict type checking** enabled for maximum type safety.

### Component Structure

- ✅ Modular, reusable components
- ✅ Clear separation of concerns
- ✅ Comprehensive type definitions in `src/types/`
- ✅ Documented functions and interfaces
- ✅ Custom hooks for shared logic

### Testing

- **Unit tests** with Jest and React Testing Library
- **Component tests** for UI interactions
- **Store tests** for state management logic
- **Utility tests** for business logic

Run tests:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

### Best Practices

- ✅ React hooks for state and effects
- ✅ Memoization for performance optimization (`useMemo`, `useCallback`)
- ✅ Proper error handling and fallbacks
- ✅ Accessibility considerations (ARIA labels, keyboard navigation)
- ✅ Responsive design for various screen sizes

---

## 🔮 Future Enhancements

Potential features for future versions:

- [ ] Real-time collaboration with WebSockets
- [ ] YAML validation with error highlighting and suggestions
- [ ] Export/import projects as JSON
- [ ] Share projects via URL (with compression)
- [ ] Service health monitoring integration
- [ ] Kubernetes manifest generation
- [ ] Docker Compose profiles support
- [ ] Multi-select and bulk operations
- [ ] Undo/redo functionality (Ctrl+Z / Ctrl+Y)
- [ ] Connection labels for custom relationships
- [ ] Docker Compose v3 advanced features (configs, secrets, deploy specs)
- [ ] Template marketplace for community-contributed templates
- [ ] AI-powered architecture suggestions

---

## 📄 License & Usage

This project is free to use, modify, and contribute to **for non-commercial purposes only**.  
Commercial use requires explicit permission from the author.

Forks, contributions, and redistribution are welcome.

Copyright (c) 2026 Ruan Fernandes Guimarães. See [LICENSE](./LICENSE) for full details.

![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

All contributions must comply with the non-commercial license.

### Contribution Guidelines

- Follow the existing code style and patterns
- Write tests for new features
- Update documentation as needed
- Keep commits focused and descriptive
- Be respectful and constructive in discussions

---

## 🐛 Support

For issues, bugs, or questions:

- 🐞 **Bug reports**: [Create an issue](https://github.com/yourusername/orkestral/issues)
- 💬 **Questions**: Check existing documentation and issues first
- 📖 **Documentation**: Review code comments for implementation details

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [React Flow](https://reactflow.dev/) - Powerful node-based UI library
- [Chakra UI](https://chakra-ui.com/) - Simple, modular component library
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The editor that powers VS Code
- [Zustand](https://zustand-demo.pmnd.rs/) - Bear necessities for state management
- [next-intl](https://next-intl-docs.vercel.app/) - Internationalization for Next.js

---

<div align="center">

**Orkestral** - Making Docker Compose visual and intuitive.

Made with ❤️ by [Ruan Fernandes Guimarães](https://github.com/yourusername)

</div>
