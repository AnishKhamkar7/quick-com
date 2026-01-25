import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export const Loading = ({
  size = "md",
  text,
  fullScreen = false,
  className = "",
}: LoadingProps) => {
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <p
          className={`${textSizeClasses[size]} text-muted-foreground font-medium`}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Inline loading spinner for buttons or small spaces
export const LoadingSpinner = ({
  size = "sm",
}: {
  size?: "sm" | "md" | "lg";
}) => {
  return <Loader2 className={`${sizeClasses[size]} animate-spin`} />;
};

// Loading skeleton for cards and content blocks
export const LoadingSkeleton = ({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded animate-pulse"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
};

export default Loading;
