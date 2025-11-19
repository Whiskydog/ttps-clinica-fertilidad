import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { UserPlus, FileText, Activity, Search } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      label: "NUEVO PACIENTE",
      href: "/doctor/patients/new",
      icon: UserPlus,
      variant: "default" as const,
      className: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "NUEVA ORDEN",
      href: "/doctor/orders/new",
      icon: FileText,
      variant: "default" as const,
      className: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "SEGUIMIENTO",
      href: "/doctor/follow-ups",
      icon: Activity,
      variant: "default" as const,
      className: "bg-orange-600 hover:bg-orange-700",
    },
    {
      label: "BUSCAR PACIENTE",
      href: "/doctor/patients",
      icon: Search,
      variant: "default" as const,
      className: "bg-pink-600 hover:bg-pink-700",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accesos Rápidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Button
                  variant={action.variant}
                  className={`w-full h-auto flex-col gap-2 py-4 ${action.className}`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-semibold">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
