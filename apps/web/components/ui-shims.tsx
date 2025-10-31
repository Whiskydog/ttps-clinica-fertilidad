import React from "react";

// Simple Field wrappers
export function Field({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function FieldGroup({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function FieldLabel({ children, ...props }: any) {
  return (
    <label {...props} className={props.className}>
      {children}
    </label>
  );
}

export function FieldError({ errors }: { errors?: any[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <div className="text-sm text-red-600">
      {errors.map((e: any, i: number) => (
        <div key={i}>{e?.message ?? String(e)}</div>
      ))}
    </div>
  );
}

// Simple Input that forwards props
export const Input = React.forwardRef<HTMLInputElement, any>(
  function Input(props, ref) {
    return <input ref={ref} {...props} />;
  }
);

// Simple Button
export function Button({ children, asChild, ...props }: any) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  return <button {...props}>{children}</button>;
}

// Simple Select components: a tiny controlled select UI
const SelectContext = React.createContext<any>(null);

export function Select({ value, onValueChange, children }: any) {
  const [open, setOpen] = React.useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className }: any) {
  const ctx = React.useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={className}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: any) {
  const ctx = React.useContext(SelectContext);
  const val = ctx?.value;
  return <span>{val ?? placeholder}</span>;
}

export function SelectContent({ children }: any) {
  const ctx = React.useContext(SelectContext);
  if (!ctx.open) return null;
  return (
    <div className="absolute z-50 mt-1 bg-white border rounded shadow-lg">
      {children}
    </div>
  );
}

export function SelectItem({ value, children }: any) {
  const ctx = React.useContext(SelectContext);
  return (
    <div
      role="option"
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
    >
      {children}
    </div>
  );
}
