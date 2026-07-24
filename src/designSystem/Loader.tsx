/** @format */

import { cn } from "@/utilities/index";

interface LoaderProps {
   label?: string;
   className?: string;
   size?: "sm" | "md" | "lg";
}

export default function Loader({ label, className, size = "md" }: LoaderProps) {
   const sizeClasses = {
      sm: "w-4 h-4 border-2",
      md: "w-8 h-8 border-2",
      lg: "w-12 h-12 border-4",
   };

   return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
         <div
            className={cn(
               "animate-spin rounded-full border-primary border-t-transparent",
               sizeClasses[size]
            )}
         />
         {label && (
            <span className="text-sm text-text-sub">{label}</span>
         )}
      </div>
   );
}
