import * as React from 'react'

import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-lg',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'
