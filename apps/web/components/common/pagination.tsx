"use client";

import { Button } from "@repo/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </Button>

      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </Button>
    </div>
  );
}
