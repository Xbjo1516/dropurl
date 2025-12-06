"use client";

type Props = {
  label?: string;
  disabled?: boolean;
  size?: "xs" | "sm" | "md";
  variant?: "primary" | "ghost";
  onClick?: () => void;
};

export default function ExportButton({
  label = "Export",
  disabled = false,
  size = "sm",
  variant = "primary",
  onClick,
}: Props) {
  const sizeClass = size === "xs" ? "btn-xs" : size === "sm" ? "btn-sm" : "btn-md";
  const variantClass = variant === "ghost" ? "btn-ghost" : "btn-primary";

  return (
    <button
      type="button"
      className={`btn ${variantClass} ${sizeClass}`}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      title={disabled ? "No items selected" : label}
    >
      {label}
    </button>
  );
}
