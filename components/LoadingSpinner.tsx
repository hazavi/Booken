"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  text,
  fullPage = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  };

  const Spinner = (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loading-overlay">{Spinner}</div>;
  }

  return Spinner;
}
