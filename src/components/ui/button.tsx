import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 shadow-sm",
          {
            "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md dark:bg-blue-700 dark:hover:bg-blue-600 focus-visible:ring-blue-500": variant === 'default',
            "bg-red-600 text-white hover:bg-red-700 hover:shadow-md dark:bg-red-700 dark:hover:bg-red-600 focus-visible:ring-red-500": variant === 'destructive',
            "bg-green-600 text-white hover:bg-green-700 hover:shadow-md dark:bg-green-700 dark:hover:bg-green-600 focus-visible:ring-green-500": variant === 'success',
            "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md focus-visible:ring-gray-500": variant === 'outline',
            "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm focus-visible:ring-gray-500": variant === 'secondary',
            "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-md focus-visible:ring-gray-500": variant === 'ghost',
            "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline focus-visible:ring-blue-500 shadow-none": variant === 'link',
          },
          {
            "h-10 px-4 py-2 text-sm": size === 'default',
            "h-8 px-2 py-1 text-xs": size === 'xs',
            "h-9 px-3 py-2 text-sm": size === 'sm',
            "h-12 px-8 py-3 text-base": size === 'lg',
            "h-10 w-10 p-0": size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }