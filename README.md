# Leak Detection System

A modern, full-stack web application built with Next.js 14, TypeScript, and Tailwind CSS. This project demonstrates clean architecture, modern development practices, and a professional development environment setup.

## 🚀 Features

- **Next.js 14** with App Router for optimal performance and developer experience
- **TypeScript** for type safety and better development experience
- **Tailwind CSS** for rapid and consistent styling
- **ESLint + Prettier** for code quality and formatting
- **Clean Architecture** with organized folder structure
- **API Routes** with proper error handling and response formatting
- **Responsive Design** with modern UI components
- **Development Tools** configured for optimal workflow

## 📁 Project Structure

```
leak_detection/
├── app/                    # Next.js App Router directory
│   ├── dashboard/          # Dashboard pages
│   │   └── page.tsx
│   ├── api/                # API routes
│   │   └── health/
│   │       └── route.ts
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable UI components
│   ├── Button.tsx
│   └── index.ts
├── lib/                    # Utility libraries
│   └── index.ts
├── utils/                  # Helper functions
│   └── index.ts
├── public/                 # Static assets
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Formatting**: Prettier
- **Package Manager**: npm

## 📦 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd leak_detection
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Available Scripts

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check if code is formatted
npm run type-check   # Run TypeScript type checking
```

## 🏗️ Development Workflow

### 1. Code Formatting

This project uses Prettier for consistent code formatting. Configuration is in `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 2. Linting

ESLint is configured with Next.js recommended rules. Run linting with:

```bash
npm run lint
```

### 3. Type Checking

TypeScript is configured for strict type checking. Check types with:

```bash
npm run type-check
```

## 🎨 Styling Guidelines

### Tailwind CSS

- Use Tailwind utility classes for styling
- Leverage the `cn()` utility function for conditional classes
- Follow responsive design principles with Tailwind breakpoints

### Component Structure

```tsx
import { cn } from '@/utils';

interface ComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function Component({ className, children }: ComponentProps) {
  return <div className={cn('base-styles', className)}>{children}</div>;
}
```

## 🔗 API Routes

### Health Check

```
GET /api/health
```

Returns system health status and basic information.

Example response:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "uptime": 123.456
  },
  "message": "API is healthy"
}
```

## 📚 Key Dependencies

### Production

- `next` - React framework
- `react` & `react-dom` - React library
- `clsx` - Utility for constructing className strings
- `tailwind-merge` - Merge Tailwind CSS classes

### Development

- `typescript` - Type checking
- `eslint` - Code linting
- `prettier` - Code formatting
- `@types/*` - Type definitions

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Import your project on [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build

### Manual Deployment

```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests and linting: `npm run lint && npm run type-check`
5. Format code: `npm run format`
6. Commit your changes: `git commit -m 'Add new feature'`
7. Push to the branch: `git push origin feature/new-feature`
8. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Next.js Documentation](https://nextjs.org/docs)
2. Review the [TypeScript Handbook](https://www.typescriptlang.org/docs/)
3. Browse [Tailwind CSS Documentation](https://tailwindcss.com/docs)
4. Create an issue in this repository

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.
# SmartPipeX
