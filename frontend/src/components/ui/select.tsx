import * as React from "react"
import { cn } from "../../lib/utils"

export const Select = ({ children, value, onValueChange, className }: any) => {
  const onChange = (e: any) => onValueChange(e.target.value);
  return (
    <select 
      value={value} 
      onChange={onChange} 
      className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
    >
      {children}
    </select>
  )
}

export const SelectTrigger = ({ children, className }: any) => <>{children}</>
export const SelectValue = ({ placeholder }: any) => <option value="" disabled>{placeholder}</option>
export const SelectContent = ({ children }: any) => <>{children}</>
export const SelectItem = ({ children, value }: any) => <option value={value}>{children}</option>
