import { Card } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <Skeleton className="h-8 w-64" />
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        <div className="p-6 space-y-4">
          {/* Header de tabla */}
          <div className="flex gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Filas */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
          ))}
        </div>

        {/* Paginación */}
        <div className="border-t p-4 flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-64" />
        </div>
      </Card>
    </div>
  );
}
