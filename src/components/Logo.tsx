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
          src="/ChatGPT_Image_Dec_8,_2025,_06_43_29_PM.png"
          alt="CreatorAppU Icon"
          className="h-8 w-auto"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/ChatGPT_Image_Dec_8,_2025,_06_43_29_PM.png"
        alt="CreatorAppU Logo"
        className="h-10 w-auto"
      />
      <span className="text-2xl font-bold text-slate-800">CreatorAppU</span>
    </div>
  );
}
