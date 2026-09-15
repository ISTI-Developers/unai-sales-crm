import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";

interface SkeletonLoaderProps {
    isLoading: boolean;
    children: ReactNode;
    className: string;
}

function SkeletonLoader({ isLoading, children, className }: SkeletonLoaderProps) {
    if (isLoading) {
        return <Skeleton className={className} />
    }

    return children;
}

export default SkeletonLoader