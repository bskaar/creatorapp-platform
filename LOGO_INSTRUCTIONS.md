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

## Current Branding

### Name
**CreatorApp**

### URL
**www.CreatorApp.us**

### Colors
- Primary Purple: `#6C5CE7`
- Accent Pink: `#FF6B9D`
- Dark Text: `#1A1A2E`

### Typography
- Font: DM Sans (already integrated)
- Headings: Bold (700)
- Body: Regular (400) and Medium (500)

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
