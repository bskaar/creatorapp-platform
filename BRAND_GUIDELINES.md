# Logo Integration Instructions

## Adding Your CreatorApp Logo

Your platform is ready to display your custom logo. Follow these steps to integrate it:

### 1. Prepare Your Logo File

- **File Name**: `logo-transparent.png` (or `.svg` for best quality)
- **Format**: PNG with transparent background (or SVG)
- **Recommended Size**: At least 200px width for high-resolution displays
- **Background**: Transparent
- **Color**: Should work on both light and dark backgrounds

### 2. Add Logo to Project

Place your logo file in the `public` folder:

```
/project/
  /public/
    logo-transparent.png  <-- Place your logo here
```

### 3. Update Logo Component

Edit the file: `src/components/Logo.tsx`

**Uncomment and update these lines:**

```tsx
{/* Logo image will be added here when provided */}
<img
  src="/logo-transparent.png"
  alt="CreatorApp Logo"
  className="h-8 w-auto"
/>
```

**Remove or comment out the temporary text logo:**

```tsx
{/* Temporary gradient text logo until image is provided */}
{showText && (
  <span className="...">
    CreatorApp
  </span>
)}
```

### 4. Final Logo Component

After integration, your Logo component should look like:

```tsx
interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showText?: boolean;
}

export default function Logo({ className = '', variant = 'light', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo-transparent.png"
        alt="CreatorApp Logo"
        className="h-8 w-auto"
      />

      {/* Optional: Add text next to logo */}
      {showText && (
        <span className="text-2xl font-bold text-gray-900">
          CreatorApp
        </span>
      )}
    </div>
  );
}
```

### 5. Logo Usage Throughout Platform

The Logo component is already integrated in:

- ✅ Landing page header (navigation)
- ✅ Landing page footer
- ✅ Dashboard sidebar
- ✅ Mobile menu
- ✅ All authenticated pages

### 6. Variant Support

The Logo component supports two variants:

- **`light` (default)**: For use on light backgrounds
- **`dark`**: For use on dark backgrounds (like the footer)

If your logo needs different versions for light/dark modes:

```tsx
<img
  src={variant === 'light' ? '/logo-light.png' : '/logo-dark.png'}
  alt="CreatorApp Logo"
  className="h-8 w-auto"
/>
```

### 7. Favicon

Don't forget to update the favicon in `index.html`:

```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

Place your favicon in the `public` folder as `favicon.png` (16x16 or 32x32 pixels).

---

## Brand Guidelines

### Brand Name
**CreatorApp** (styled as one word, capital C and A)

### URL
**www.CreatorApp.us**

### Color Palette

#### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Dark Blue (Background) | `#0F172A` | Landing page background, dashboard sidebar |
| Slate 900 | `#1E293B` | Navigation bars, dark sections |

#### Accent Colors - Button Gradients
| Gradient | From | To | Usage |
|----------|------|-----|-------|
| Primary CTA | `#6C5CE7` (Purple) | `#FF6B9D` (Pink) | Main action buttons, hero CTAs |
| Secondary CTA | `#3B82F6` (Blue) | `#06B6D4` (Cyan) | Navigation buttons, secondary actions |

#### Supporting Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Cyan Accent | `#06B6D4` | Hover states, links, highlights |
| White | `#FFFFFF` | Text on dark backgrounds |
| Gray 300 | `#D1D5DB` | Secondary text on dark backgrounds |

#### UI Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Dark Text | `#1A1A2E` | Headings on light backgrounds |
| Body Text | `#2D3748` | Paragraph text |
| Secondary Text | `#5A5A6E` | Muted/helper text |
| Light Background | `#FAFAFC` | Page backgrounds |
| Border | `#F0F0F5` | Dividers, card borders |

### Button Styles

#### Primary Button (Purple to Pink Gradient)
```css
background: linear-gradient(to right, #6C5CE7, #FF6B9D);
color: white;
border-radius: 12px;
padding: 12px 28px;
font-weight: 600;
```

#### Secondary Button (Blue to Cyan Gradient)
```css
background: linear-gradient(to right, #3B82F6, #06B6D4);
color: white;
border-radius: 12px;
padding: 12px 28px;
font-weight: 600;
```

### Typography
| Element | Font | Weight | Size |
|---------|------|--------|------|
| Display Headings | DM Sans | 700 (Bold) | 48-72px |
| Section Headings | DM Sans | 700 (Bold) | 32-40px |
| Subheadings | DM Sans | 600 (Semibold) | 20-24px |
| Body Text | DM Sans | 400 (Regular) | 16-18px |
| Button Text | DM Sans | 600 (Semibold) | 14-16px |
| Small/Caption | DM Sans | 500 (Medium) | 12-14px |

### Shadows
| Type | CSS | Usage |
|------|-----|-------|
| Light | `0 4px 15px rgba(59, 130, 246, 0.15)` | Cards, subtle elevation |
| Medium | `0 10px 30px rgba(59, 130, 246, 0.25)` | Modals, dropdowns |
| Button Hover | `0 15px 40px rgba(108, 92, 231, 0.4)` | Button hover states |

### Border Radius
| Element | Radius |
|---------|--------|
| Buttons | 12px (rounded-xl) |
| Cards | 16-24px |
| Inputs | 8px |
| Pill Buttons | 50px (full)

---

## Need Help?

If you need to adjust:
- Logo size: Change `h-8` to `h-6`, `h-10`, etc. in the Logo component
- Logo spacing: Adjust the `gap-3` in the component
- Show/hide text: Use the `showText` prop

Example:
```tsx
<Logo variant="light" showText={false} className="h-10" />
```
