interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showText?: boolean;
  iconOnly?: boolean;
}

export default function Logo({ className = '', iconOnly = false }: LogoProps) {
  if (iconOnly) {
    return (
      <div className={`flex items-center ${className}`}>
        <img
          src="/creatorapp-c1-icon-gradient (2).svg"
          alt="CreatorApp Icon"
          className="h-8 w-auto"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/creatorapp-c1-logo-gradient.svg"
        alt="CreatorApp Logo"
        className="h-10 w-auto"
      />
    </div>
  );
}
