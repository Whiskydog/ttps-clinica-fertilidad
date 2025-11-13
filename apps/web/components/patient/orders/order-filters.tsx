'use client';

import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { useState } from 'react';

interface OrderFiltersProps {
  onFilterChange: (filter: string) => void;
  onSearchChange: (search: string) => void;
}

export function OrderFilters({ onFilterChange, onSearchChange }: OrderFiltersProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex gap-2">
        <span className="font-semibold">Filtrar por:</span>
        <Button
          size="sm"
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          onClick={() => handleFilterClick('all')}
        >
          Todas
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'pending' ? 'default' : 'outline'}
          onClick={() => handleFilterClick('pending')}
        >
          Pendientes
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'completed' ? 'default' : 'outline'}
          onClick={() => handleFilterClick('completed')}
        >
          Completadas
        </Button>
      </div>

      <div className="w-full sm:w-64">
        <Input
          placeholder="Buscar..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-white"
        />
      </div>
    </div>
  );
}
