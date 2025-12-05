"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/popover";
import { useMedicalTermsSearch } from "@/hooks/useMedicalTermsSearch";
import { cn } from "@repo/ui";

interface MedicalTermSelectorProps {
  onSelect: (term: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MedicalTermSelector({
  onSelect,
  placeholder = "Buscar término médico...",
  disabled = false,
}: MedicalTermSelectorProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    results,
    totalCount,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
    reset,
  } = useMedicalTermsSearch({ limit: 10 });

  const handleSelect = (term: string) => {
    onSelect(term);
    reset();
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
    }
  };

  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          disabled={disabled}
          className="w-full justify-start text-muted-foreground font-normal"
        >
          <Search className="mr-2 h-4 w-4" />
          {placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escriba al menos 3 caracteres..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
            />
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-6 text-center text-sm text-destructive">
                {error}
              </div>
            ) : query.length < 3 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Escriba al menos 3 caracteres para buscar
              </div>
            ) : results.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No se encontraron resultados
              </div>
            ) : (
              <div className="p-1">
                {results.map((term, index) => (
                  <button
                    key={`${term}-${index}`}
                    type="button"
                    onClick={() => handleSelect(term)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && results.length > 0 && (
            <div className="flex items-center justify-between border-t px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                Página {page} de {totalPages} ({totalCount} resultados)
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || isLoading}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
