# 🏆 LeetCode Judgment

A modern, high-performance LeetCode problem-solving and management platform built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**. Featuring a stunning UI with advanced animations, full internationalization, and a seamless developer experience.

## ✨ Key Features

- **🚀 Next.js 16 & React 19** - Utilizing the latest features like Server Components, Streaming, and the React Compiler.
- **🎨 Stunning Visuals**
  - **ElectricBorder**: Dynamic, animated borders that react to user interaction.
  - **ASCIIText**: Unique retro-style animated text for headers.
  - **Glassmorphism**: High-quality `GlassSurface` components with SVG filters.
  - **Eye-Comfort Dark Mode**: Custom-tuned `#292b2d` dark gray theme designed for long coding sessions.
- **🔍 Advanced Problem Filtering** - Blazing fast search and multi-dimensional filtering by **Difficulty** and **Tags**.
- **📝 Problem Creation System** - Full-featured interface to contribute problems, including Markdown descriptions, dynamic test cases, and reference solutions.
- **🌐 Full Internationalization (i18n)** - Seamless switching between **English** and **Chinese** using `next-intl`.
- **⚡ Optimized UX**
  - **Precision Skeletons**: Pre-render skeletons that perfectly match the final layout to eliminate layout shift.
  - **NextTopLoader**: Smooth navigation progress indicators.
  - **Sonner**: Beautiful, stackable toast notifications.
- **🛠️ Robust Tooling**
  - **Biome**: Ultra-fast linting and formatting.
  - **Vitest**: Modern unit testing suite.
  - **Supabase**: Integrated database client.
  - **Sentry**: Comprehensive monitoring and error tracking.

## ScreenShot
![img.png](./img.png)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- pnpm (recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Super1Windcloud/leetcode-judgment.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables (copy `.env.example` to `.env.local`).

4. Run the development server:
```bash
pnpm dev
```
Access the app at `http://localhost:33333`.

## 📦 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Build and start production server
- `pnpm type-check` - Run TypeScript compilation checks
- `pnpm lint` - Lint code with Biome
- `pnpm fix` - Auto-fix formatting/lint issues
- `pnpm test` - Run unit tests with Vitest

## 🏗️ Project Structure

```
├── app/[locale]/               # Localized pages (en, zh)
│   ├── about/                  # Project & Author info
│   ├── create/                 # Problem contribution system
│   ├── problems/               # Problem listing & detail pages
│   └── layout.tsx              # Dynamic layout shell
├── components/                 
│   ├── ui/                     # shadcn/ui primitives
│   ├── ElectricBorder.tsx      # Hover animation component
│   ├── GlassSurface.tsx        # SVG-filtered glass component
│   └── NavbarActions.tsx       # Reusable user/theme/lang actions
├── i18n/                       # i18n routing & request config
├── messages/                   # Translation JSON files
├── lib/                        # Problem fetching & Supabase logic
└── assets/                     # Markdown-based problem database
```

## 🐳 Docker

Build the optimized production image:
```bash
docker build -t leetcode-judgment .
```

## 🤝 Contributing

This project enforces **Conventional Commits**.
- `feat: ...` for new features
- `fix: ...` for bug fixes
- `chore: ...` for maintenance

## 📄 License

Apache-2.0 License - see [LICENSE](LICENSE) for details.