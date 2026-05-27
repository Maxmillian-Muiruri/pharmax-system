import * as React from "react"
import { cn } from "./utils"

interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
}

interface SheetContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextType>({ open: false, setOpen: () => {} });

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, defaultOpen = false, children, ...props }, ref) => {
    const [open, setOpen] = React.useState(defaultOpen);
    
    return (
      <SheetContext.Provider value={{ open, setOpen }}>
        <div ref={ref} className={cn("relative", className)} {...props}>
          {open && (
            <div 
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setOpen(false)}
            />
          )}
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                open
              });
            }
            return child;
          })}
        </div>
      </SheetContext.Provider>
    )
  }
)
Sheet.displayName = "Sheet"

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right";
  open?: boolean;
}

const SheetContent = React.forwardRef<
  HTMLDivElement,
  SheetContentProps
>(({ className, children, side = "left", open, ...props }, ref) => {
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "fixed top-0 bottom-0 w-80 bg-white shadow-lg p-6 overflow-y-auto z-50",
        side === "left" ? "left-0" : "right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2", className)}
    {...props}
  />
))
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  SheetTriggerProps
>(({ className, asChild = false, children, onClick, ...props }, ref) => {
  const { setOpen } = React.useContext(SheetContext);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(true);
    onClick?.(e);
  };

  if (asChild) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      ref,
      ...props
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn("", className)}
      onClick={handleClick}
      {...props}
    />
  )
})
SheetTrigger.displayName = "SheetTrigger"

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger }