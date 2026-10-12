import React from 'react';
import { cn } from '@/lib/utils';

export interface LoaderProps {
    className?: string;
    size?: number | string;
    /** Read out to screen readers */
    label?: string;
}

// Process inks in the order a press lays them down
const INKS = ["#00AEEF", "#EC008C", "#FFDE00", "#1B2433"];

/**
 * A small press: four ink squares print one after another while a sheet runs underneath.
 * Animations live in globals.css (ink-press) and stop for people who ask for reduced motion.
 */
const Loader: React.FC<LoaderProps> = ({ className, size = 60, label = "Loading" }) => {
    return (
        <div
            role="status"
            aria-live="polite"
            className={cn("flex flex-col items-center gap-2", className)}
            style={{ width: size }}
        >
            <div className="grid w-full grid-cols-2 gap-1.5" style={{ height: size }}>
                {INKS.map((color, i) => (
                    <span
                        key={color}
                        className="ink-press-cell rounded-[3px]"
                        style={{ backgroundColor: color, animationDelay: `${i * 0.18}s` }}
                    />
                ))}
            </div>
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#223F7A]/10" aria-hidden>
                <span className="ink-press-sheet absolute inset-y-0 left-0 w-1/2 rounded-full bg-[#223F7A]/60" />
            </div>
            <span className="sr-only">{label}</span>
        </div>
    );
};

export default Loader;

export const FullPageLoader: React.FC = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
        <Loader size={64} />
    </div>
);
