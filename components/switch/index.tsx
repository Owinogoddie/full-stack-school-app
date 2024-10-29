// components/switch/index.tsx
"use client";

import styles from "./switch.module.css";

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = ({
  label,
  checked,
  onChange,
  disabled = false,
}: SwitchProps) => {
  return (
    <label className={styles.switchLabel}>
      <span className={styles.labelText}>{label}</span>
      <div className={styles.switchWrapper}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={styles.switchInput}
        />
        <span className={styles.switchSlider}></span>
      </div>
    </label>
  );
};

export default Switch;
