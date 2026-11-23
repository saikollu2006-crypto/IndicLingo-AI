import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2 font-medium',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5 font-semibold',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#956E2F] to-[#B68B4B] hover:brightness-110 text-[#202221] font-bold shadow-[0_0_20px_rgba(182,139,75,0.40)] hover:shadow-[0_0_35px_rgba(182,139,75,0.60)] active:scale-[0.98] transition-all duration-200',
    secondary:
      'bg-white/[0.05] hover:bg-white/[0.09] text-[#F4EFE6] border border-white/[0.12] hover:border-[#B68B4B]/60 backdrop-blur-xl active:scale-[0.98] transition-all duration-200',
    outline:
      'bg-white/[0.02] hover:bg-[#B68B4B]/15 text-[#B68B4B] border border-[#B68B4B]/60 hover:border-[#B68B4B] backdrop-blur-md active:scale-[0.98] transition-all duration-200',
    ghost:
      'bg-transparent hover:bg-white/[0.06] text-[#F4EFE6]/80 hover:text-[#B68B4B] active:scale-[0.98] transition-all duration-200',
    glow:
      'bg-gradient-to-r from-[#956E2F] to-[#B68B4B] hover:brightness-110 text-[#202221] font-bold shadow-[0_0_30px_rgba(182,139,75,0.55)] hover:shadow-[0_0_55px_rgba(244,239,230,0.70)] active:scale-[0.98] transition-all duration-200',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 transition-all duration-200',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
