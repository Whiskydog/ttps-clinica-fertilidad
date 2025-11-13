import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent } from '@repo/ui/card';
import { AlertTriangle } from 'lucide-react';
import { ProductsSummary } from '@/components/patient/cryopreserved/products-summary';
import { OvulesList } from '@/components/patient/cryopreserved/ovules-list';
import { EmbryosList } from '@/components/patient/cryopreserved/embryos-list';
import { mockCryopreservedProducts } from '../lib/mock-data';

export default function CryopreservedPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patient">
          <Button variant="outline">← Volver al Dashboard</Button>
        </Link>
      </div>

      <ProductsSummary summary={mockCryopreservedProducts.summary} />

      <OvulesList ovules={mockCryopreservedProducts.ovules} />

      <EmbryosList embryos={mockCryopreservedProducts.embryos} />

      <Card className="bg-amber-100 border-amber-300">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Nota:</span> Cualquier acción sobre productos
              criopreservados requiere autorización médica
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
