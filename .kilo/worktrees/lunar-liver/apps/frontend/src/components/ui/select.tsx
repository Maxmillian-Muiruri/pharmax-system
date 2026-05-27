import * as React from "react"

import { cn } from "./utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, onValueChange, onChange, ...props }, ref) => {
    return (
      <select
        className={cn(
          "inline-flex items-center justify-between whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
          className
        )}
        ref={ref}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        {...props}
      />
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
  HTMLSelectElement,
  SelectProps
>(({ className, children, ...props }, ref) => (
  <Select ref={ref} className={className} {...props}>
    {children}
  </Select>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ children }: { children?: React.ReactNode }) => {
  return <span>{children}</span>;
};
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white rounded-md shadow-lg border border-slate-200 mt-1",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, value, ...props }, ref) => (
  <option
    ref={ref}
    className={cn(
      "px-3 py-2 cursor-pointer hover:bg-slate-100",
      className
    )}
    value={value}
    {...props}
  >
    {children}
  </option>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }