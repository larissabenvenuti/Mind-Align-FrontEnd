import { forwardRef, LabelHTMLAttributes } from "react";
import styles from "./label.module.scss";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`${styles.label} ${className || ""}`.trim()}
        {...props}
      />
    );
  },
);

Label.displayName = "Label";
export { Label };
