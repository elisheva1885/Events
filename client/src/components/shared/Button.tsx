import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function Button({ className = '', children, ...props }: ButtonProps) {
  return (
    <button 
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all outline-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}