interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showText?: boolean;
}

export default function Logo({ className = '', variant = 'light', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo image will be added here when provided */}
      {/* <img
        src="/logo-transparent.png"
        alt="CreatorApp Logo"
        className="h-8 w-auto"
      /> */}

      {/* Temporary gradient text logo until image is provided */}
      {showText && (
        <span
          className={`text-3xl font-bold ${
            variant === 'light'
              ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'
              : 'text-white'
          }`}
        >
          CreatorApp
        </span>
      )}
    </div>
  );
}
