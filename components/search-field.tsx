'use client'
interface SearchFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
  }
  
  export default function SearchField({
    value,
    onChange,
    placeholder = 'Search...',
    className = '',
  }: SearchFieldProps) {
    return (
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 ${className}`}
      />
    );
  }
  