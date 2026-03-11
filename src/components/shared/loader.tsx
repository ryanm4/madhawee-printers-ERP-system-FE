import React from 'react';
import { cn } from '@/lib/utils';

export interface LoaderProps {
    className?: string;
    size?: number | string;
}

const Loader: React.FC<LoaderProps> = ({ className, size = 60 }) => {
    return (
        <div
            className={cn("grid grid-cols-3 gap-1", className)}
            style={{ width: size, height: size }}
        >
            {[...Array(6)].map((_, i) => (
                <span
                    key={i}
                    className="w-full h-full bg-primary animate-blink"
                    style={{ animationDelay: `${i === 0 ? 0 : i * 100 + 100}ms` }}
                />
            ))}
        </div>
    );
};

export default Loader;

export const PageLoader: React.FC = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm min-h-[200px]">
        <Loader size={70} />
    </div>
);

export const FullPageLoader: React.FC = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
        <Loader size={80} />
    </div>
);
