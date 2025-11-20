"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { Calendar, FileText, Snowflake, ClipboardList, Home } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: "calendar" | "medical-history" | "cryopreserved" | "orders" | "home";
  title: string;
  description: string;
  showAppointmentButton?: boolean;
  showHomeButton?: boolean;
  customAction?: {
    label: string;
    href: string;
  };
}

const iconMap = {
  calendar: Calendar,
  "medical-history": FileText,
  cryopreserved: Snowflake,
  orders: ClipboardList,
  home: Home,
};

export function EmptyState({
  icon = "home",
  title,
  description,
  showAppointmentButton = true,
  showHomeButton = false,
  customAction,
}: EmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="rounded-full bg-gray-200 p-4 mb-4">
          <IconComponent className="h-8 w-8 text-gray-500" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        <p className="text-gray-600 mb-6 max-w-md">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {showAppointmentButton && (
            <Button asChild>
              <Link href="/patient/calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Sacar un turno
              </Link>
            </Button>
          )}

          {showHomeButton && (
            <Button variant="outline" asChild>
              <Link href="/patient">
                <Home className="h-4 w-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>
          )}

          {customAction && (
            <Button variant="outline" asChild>
              <Link href={customAction.href}>
                {customAction.label}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
