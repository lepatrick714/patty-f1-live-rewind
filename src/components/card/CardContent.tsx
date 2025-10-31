import * as React from "react";
import { twMerge } from "tailwind-merge";

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-content"
            className={twMerge("px-6", className)}
            {...props}
        />
    );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-footer"
            className={twMerge("flex items-center px-6 [.border-t]:pt-6", className)}
            {...props}
        />
    );
}

export { CardContent, CardFooter };