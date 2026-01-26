import * as React from "react"
import { cn } from "@/lib/utils"

const TooltipProvider = ({ children }) => <>{children}</>

const Tooltip = ({ children }) => <div className="relative group">{children}</div>

const TooltipTrigger = ({ asChild, children }) => {
    // If asChild is true, we just render the child. 
    // In a real implementation we'd merge refs/props.
    // For this simple version, we assume the child is a button/interactive element.
    return <>{children}</>
}

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "absolute hidden group-hover:block whitespace-nowrap bg-black text-white", // Basic CSS hover
            className
        )}
        style={{
            // A very rough positioning hack for the sidebar use case (usually side="right")
            left: "100%",
            top: "50%",
            transform: "translateY(-50%)",
            marginLeft: "0.5rem"
        }}
        {...props}
    >
        {children}
    </div>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
