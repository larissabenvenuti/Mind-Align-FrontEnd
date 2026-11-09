import { forwardRef, InputHTMLAttributes } from "react";
import styles from "./input.module.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={`${styles.input} ${className || ""}`.trim()}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
export { Input };
