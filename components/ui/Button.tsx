import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "gold" | "outline" | "white";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-colors";

const variants: Record<Variant, string> = {
  primary: "bg-royal-800 text-linen-50 hover:bg-royal-900 shadow-sm",
  gold: "bg-gold-500 text-royal-900 hover:bg-gold-600 shadow-sm",
  outline: "border border-royal-300 text-royal-800 hover:border-gold-500 hover:text-gold-700",
  white: "bg-white text-royal-800 hover:bg-linen-100 shadow-sm",
};

type LinkButtonProps = { variant?: Variant } & ComponentProps<typeof Link>;

export function LinkButton({ variant = "primary", className = "", ...props }: LinkButtonProps) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

type ButtonProps = { variant?: Variant } & ComponentProps<"button">;

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
