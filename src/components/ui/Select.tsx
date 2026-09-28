import React, { useState, useRef, useEffect, useMemo } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const CustomSelect: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
  searchable = true,
  searchPlaceholder = "Buscar opción...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Cierra el menú desplegable cuando se hace clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autofoco al abrir el buscador
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Filtrado de opciones en memoria según el término ingresado
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return options;
    const normalize = (text: string) =>
      text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase();
    const normalizedSearch = normalize(searchTerm.trim());
    return options.filter((opt) =>
      normalize(opt.label).includes(normalizedSearch),
    );
  }, [options, searchable, searchTerm]);

  return (
    <div className="custom-select-container" ref={containerRef}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
          if (isOpen) setSearchTerm("");
        }}
        disabled={disabled}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`custom-select-arrow ${isOpen ? "expanded" : ""}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="custom-select-menu animated-dropdown">
          {searchable && (
            <div className="custom-select-search-wrap">
              <input
                ref={searchInputRef}
                type="text"
                className="custom-select-search-input"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <ul className="custom-select-list">
            {filteredOptions.length === 0 ? (
              <li className="custom-select-empty">Sin coincidencias</li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className={`custom-select-item ${
                    option.value === value ? "selected" : ""
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
