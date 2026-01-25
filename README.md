# PathWise - Learning Management System

A modern LMS web application built with Next.js, TypeScript, and Tailwind CSS.

## 🎨 Design Theme

- **Primary Color**: Rich Blue (#2563EB - Blue-600)
- **Background**: White and various shades of white/gray
- **Text & Icons**: Black (#000000) and dark gray
- **Accents**: Blue for buttons, links, and interactive elements

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Runtime**: Node.js
- **Database**: PostgreSQL (to be integrated)

## 📁 Project Structure

```
pathwise/
├── app/                          # Next.js App Router
│   ├── login/                    # Login page
│   │   └── page.tsx
│   ├── signup/                   # Signup page
│   │   └── page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles with custom theme
├── components/
│   ├── auth/                     # Authentication components
│   │   └── AuthForm.tsx          # Reusable auth form (login/signup)
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx            # Navigation bar
│   │   └── Footer.tsx            # Footer
│   ├── sections/                 # Page sections
│   │   ├── Hero.tsx              # Hero section
│   │   ├── FeaturedCourses.tsx   # Course cards
│   │   └── Features.tsx          # Features section
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib/
│   └── utils.ts                  # Utility functions
└── public/                       # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📄 Pages

### Current Pages

1. **Home Page** (`/`)
   - Hero section with CTA buttons
   - Featured courses grid
   - Key features showcase
   - Stats section
   - Full navigation and footer

2. **Login Page** (`/login`)
   - Email/password login form
   - Social login options (Google, GitHub)
   - "Remember me" checkbox
   - Forgot password link
   - Link to signup page

3. **Sign Up Page** (`/signup`)
   - Registration form with name, email, and password
   - Password confirmation
   - Social signup options
   - Link to login page

### Navigation

- All pages have proper routing setup
- Navigation between pages works via Next.js Link components
- No functionality is connected yet (frontend only)

## 🎯 Features Implemented

- ✅ Modern, responsive design
- ✅ Blue and white theme with black text
- ✅ Mobile-friendly navigation
- ✅ Course cards with hover effects
- ✅ Authentication UI (login/signup)
- ✅ Social login buttons (UI only)
- ✅ Component-based architecture
- ✅ TypeScript for type safety
- ✅ Reusable components

## 🔜 Next Steps

- Add more pages (courses, dashboard, profile, etc.)
- Implement authentication logic
- Connect to PostgreSQL database
- Add AI features
- Create course detail pages
- Implement search functionality
- Add user dashboard

## 🎨 Component Naming Convention

- **Layout Components**: `Navbar.tsx`, `Footer.tsx`
- **Section Components**: `Hero.tsx`, `FeaturedCourses.tsx`, `Features.tsx`
- **Auth Components**: `AuthForm.tsx`
- **UI Components**: lowercase with hyphens (shadcn convention)

## 📦 Installed Dependencies

- next
- react
- react-dom
- typescript
- tailwindcss
- @radix-ui/* (via shadcn/ui)
- class-variance-authority
- clsx
- tailwind-merge

## 🌐 Development Server

The app runs on `http://localhost:3000` by default.

---

Built with ❤️ using Next.js and shadcn/ui
