import { useState, useEffect, useRef, useCallback } from "react";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({
  value: externalValue,
  onChange,
  onSearch,
  placeholder = "Tìm theo: Mã HS, Họ tên...",
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState(externalValue ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = externalValue !== undefined;
  const displayValue = isControlled ? externalValue : internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!isControlled) setInternalValue(val);
      onChange?.(val);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch?.(val);
      }, 300);
    },
    [isControlled, onChange, onSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        onSearch?.(displayValue);
      }
    },
    [displayValue, onSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div
      className="flex items-center h-[44px] w-full min-w-[240px] bg-surface-container-lowest border border-hairline rounded-lg overflow-hidden transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-soft"
      role="search"
    >
      <label htmlFor="search-bar-input" className="sr-only">
        {placeholder}
      </label>
      <input
        ref={inputRef}
        id="search-bar-input"
        type="search"
        className="flex-1 h-full min-w-0 border-none outline-none bg-transparent px-4 text-sm text-on-surface placeholder:text-outline font-sans"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="none"
      />
      <div className="flex-shrink-0 w-[48px] h-full flex items-center justify-center border-l border-hairline bg-surface-container-low rounded-r-lg">
        <span className="material-symbols-outlined text-outline text-[20px] select-none">
          search
        </span>
      </div>
    </div>
  );
};

export default SearchBar;
