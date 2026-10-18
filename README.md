# OpenSitemap 🗺️📐

> A completely open-source, local-first alternative to Relume's AI Sitemap Builder. Plan website architectures, visually structure pages and sections, synchronize global headers and footers, and generate tactile low-fidelity wireframes in seconds.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)

---

## 🌟 Why OpenSitemap?

Proprietary visual sitemap tools often lock your information architecture behind subscriptions, paid AI credits, and account walls. **OpenSitemap** provides an open-source, local-first web application designed for UX strategists, product designers, agencies, and developers.

- **100% Free & Open Source**: No accounts, paid API keys, or subscriptions required.
- **Offline-First & Private**: Works completely offline with IndexedDB local persistence and an intelligent rule-based semantic generation engine.
- **Optional Local AI**: Seamlessly connect to your self-hosted [Ollama](https://ollama.ai) instance (`llama3`, `mistral`, `gemma2`, `qwen2.5`) for local AI-assisted sitemap planning.
- **Bi-directional Global Sections**: Reusable navigation bars, footers, and announcement bars stay synchronized across all linked pages with instant one-click detaching.
- **Tactile Wireframe Studio**: Convert abstract sitemaps into low-fidelity desktop, tablet, and mobile wireframes with directly editable copy.
- **Universal Exports**: Vector SVG (for Figma/Miro), clean Markdown specifications (for GitHub/Notion), complete JSON backups, and print-ready executive views.

---

## 🚀 Features Overview

### 1. Project Dashboard & Starter Templates
- Create, rename, duplicate, and delete sitemap projects.
- Start from scratch or launch battle-tested templates:
  - **SaaS Platform & App**: Marketing, pricing, auth flow, and application dashboard.
  - **E-Commerce Storefront**: Product catalog, category faceted search, PDP buy-box, cart, and checkout.
  - **Design Agency & Studio**: Case studies, capabilities, team manifesto, and client inquiry questionnaire.
  - **Blank Canvas**: Minimal baseline with global header and footer.
- Real-time autosave to browser **IndexedDB** with recovery on page reload.

### 2. Intelligent Sitemap Generator
- **Offline Rule-Based Generator**: Generates logical page hierarchies, URLs, section blueprints, and wireframe blocks without any network access.
- **Local Ollama AI Integration**: Connect to `http://localhost:11434` to run local models with zero data leakage.
- **Overwrite Protection**: Safely prompt to "Replace" or "Append / Merge" into existing canvas sitemaps without accidental data loss.

### 3. Visual Interactive Sitemap Canvas
- Built with **React Flow** (`@xyflow/react`).
- Draggable custom page cards with type badges, section previews, and color tags.
- Parent-child tree connecting edges with arrowheads.
- **Dagre Automated Layout**: One-click top-to-bottom (`TB`) or left-to-right (`LR`) hierarchical tree layout.
- Zoom, Pan, Fit-to-screen controls, and interactive Mini-map.
- Fast page search with real-time canvas highlighting.
- Full **Undo / Redo** history (`Cmd+Z`, `Cmd+Shift+Z`).

### 4. Page & Section Editors
- Edit page name, URL route slug, page type, parent page, visibility status, internal team notes, and color labels.
- Reusable Section Library containing presets:
  - `Navbar`, `Hero`, `Features`, `Statistics`, `Content / Bento`, `Testimonials`, `FAQ Accordion`, `Pricing`, `Contact Form`, `Footer`, `Dashboard Cards`, `Data Table`, `Forms`, `Charts`, and `Custom Components`.
- Reorder sections via drag handles or up/down arrows.

### 5. Synchronized Global Sections
- Share global navigation bars and footers across multiple pages.
- Edits made to a global section immediately reflect on all connected pages.
- **Detach Instance** button converts any shared section into an independent local copy.

### 6. Wireframe Studio
- Dedicated low-fidelity wireframing workspace derived directly from sitemap sections.
- **Device Viewport Switcher**: Desktop (1100px), Tablet (768px), and Mobile (375px).
- **Inline Text Editing**: Click any headline, subtext, or button label directly in the wireframe preview to customize placeholder copy.
- Spacing controls (`compact`, `comfortable`, `spacious`) and toggleable wireframe component labels.

### 7. Export & Sharing
- **Vector SVG**: High-resolution vector diagrams for Figma, Adobe Illustrator, or Miro.
- **Markdown Architecture Spec**: Structured specification document detailing every page, slug, and section hierarchy.
- **Project JSON**: Complete portable backup and restore with strict Zod validation.
- **Print / PDF Sheet**: Formatted view styled for printing and executive reviews.

### 8. Modern Visual Aesthetics & Accessibility
- Curated dark and light themes (respects system preferences with local storage persistence).
- Accessible keyboard shortcuts:
  - `Cmd / Ctrl + Z`: Undo
  - `Cmd / Ctrl + Shift + Z` or `Cmd / Ctrl + Y`: Redo
  - `Cmd / Ctrl + S`: Save Project
  - `Cmd / Ctrl + G`: Open AI Generator
  - `Escape`: Clear selection

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Visual Canvas** | React Flow (`@xyflow/react`) |
| **Auto-Layout** | Dagre (`dagre`) |
| **State Management** | Zustand 5 |
| **Schema Validation** | Zod 4 |
| **Persistence** | IndexedDB (`idb`) |
| **Local AI** | Ollama Client (`fetch` API) |
| **Icons** | Lucide React |
| **Testing** | Vitest |

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or newer recommended, tested on v24)
- npm or pnpm

### Installation

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/opensitemap.git
   cd opensitemap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. Run unit and integration tests:
   ```bash
   npm run test
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 🦙 Optional: Using Local AI with Ollama

OpenSitemap works 100% offline using its built-in rule-based generation engine. If you wish to use local LLMs:

1. Install Ollama from [ollama.ai](https://ollama.ai).
2. Pull your preferred model (e.g. `llama3` or `mistral`):
   ```bash
   ollama run llama3
   ```
3. In OpenSitemap, click the **CPU / AI Settings** icon in the top toolbar to confirm your endpoint (`http://localhost:11434`) and test your connection.

If Ollama is stopped or unavailable, OpenSitemap will automatically and safely fall back to the rule-based generator with zero disruption.

---

## 🧪 Testing Coverage

The codebase includes an automated Vitest test suite covering:
- Page creation, editing, deletion, and cascading subpage removals.
- Section creation, reordering, and global section real-time synchronization.
- Detaching global sections into independent instances.
- Undo and Redo state history transitions.
- Rule-based offline sitemap generation for multiple website archetypes.
- Zod schema validation and rejection of malformed imported files.
- Vector SVG and Markdown specification generation.

---

## 📄 License & Attribution

This project is licensed under the permissive [MIT License](./LICENSE).

OpenSitemap is an independent open-source project and is not affiliated with or endorsed by Relume Technologies. All dependencies used are free and open-source.
