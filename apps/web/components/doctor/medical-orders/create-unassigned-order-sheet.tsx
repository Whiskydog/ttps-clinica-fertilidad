"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateMedicalOrderSchema, Study } from "@repo/contracts";
import { getStudyLists, StudyLists } from "@/app/actions/doctor/external/get-study-lists";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@repo/ui/sheet";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@repo/ui/form";
import { X, Plus, Loader2 } from "lucide-react";
import { toast } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { createMedicalOrder } from "@/app/actions/doctor/medical-orders/create-medical-order";

interface CreateUnassignedOrderSheetProps {
    patientId: number;
}

// Omit doctorId from the form schema as it's handled by the backend
const SheetSchema = CreateMedicalOrderSchema.omit({ doctorId: true });
type FormValues = z.infer<typeof SheetSchema>;

export function CreateUnassignedOrderSheet({
    patientId,
}: CreateUnassignedOrderSheetProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const [studies, setStudies] = useState<Study[]>([]);
    const [studyLists, setStudyLists] = useState<StudyLists>({
        semen: [],
        hormonales: [],
        ginecologicos: [],
        prequirurgicos: [],
    });

    // Fetch study lists from external module
    useEffect(() => {
        const fetchStudyLists = async () => {
            try {
                const { data } = await getStudyLists();
                setStudyLists(data);
            } catch (error) {
                console.error("Error fetching study lists:", error);
            }
        };
        fetchStudyLists();
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(SheetSchema),
        defaultValues: {
            patientId,
            treatmentId: null,
            category: "",
            description: null,
            diagnosis: null,
            justification: null,
            studies: null,
        },
    });

    // Watch category to filter available studies
    const selectedCategory = useWatch({
        control: form.control,
        name: "category",
    });

    // Get available studies based on selected category
    const getAvailableStudies = (): string[] => {
        const categoryToStudies: Record<string, string[]> = {
            'Estudios Hormonales': studyLists.hormonales,
            'Estudios Ginecológicos': studyLists.ginecologicos,
            'Estudios de Semen': studyLists.semen,
            'Estudios Prequirúrgicos': studyLists.prequirurgicos,
        };

        const availableStudies = categoryToStudies[selectedCategory] || [];
        const selectedStudyNames = studies.map(s => s.name);

        // Filter out already selected studies
        return availableStudies.filter(study => !selectedStudyNames.includes(study));
    };

    const handleAddStudy = (studyName: string) => {
        if (studyName) {
            setStudies([...studies, { name: studyName, checked: false }]);
        }
    };

    const handleRemoveStudy = (index: number) => {
        setStudies(studies.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: FormValues) => {
        try {
            const dataWithStudies = {
                ...data,
                studies: studies.length > 0 ? studies : null,
            };

            const result = await createMedicalOrder({
                ...dataWithStudies,
                patientId,
                // doctorId is handled by backend from session
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            queryClient.invalidateQueries({
                queryKey: ["unassignedMedicalOrders", patientId],
            });
            toast.success("Orden médica creada correctamente");

            // Reset form and studies
            form.reset({
                patientId,
                treatmentId: null,
                category: "",
                description: null,
                diagnosis: null,
                justification: null,
                studies: null,
            });
            setStudies([]);
            setOpen(false);

        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Error al crear la orden médica"
            );
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Orden
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Nueva Orden Médica (Sin Tratamiento)</SheetTitle>
                    <SheetDescription>
                        Crea una nueva orden médica vinculada al paciente
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Form Errors:", errors))}
                        className="space-y-6 mt-6"
                    >
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Estudio 🞲</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione tipo de estudio" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Estudios Hormonales">Estudios Hormonales</SelectItem>
                                            <SelectItem value="Estudios Ginecológicos">Estudios Ginecológicos</SelectItem>
                                            <SelectItem value="Estudios de Semen">Estudios de Semen</SelectItem>
                                            <SelectItem value="Estudios Prequirúrgicos">Estudios Prequirúrgicos</SelectItem>
                                            {/* Add generic categories if needed, but keeping consistent with other sheet for now */}
                                            <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                                            <SelectItem value="Ecografía">Ecografía</SelectItem>
                                            <SelectItem value="Imágenes">Imágenes</SelectItem>
                                            <SelectItem value="Procedimiento">Procedimiento</SelectItem>
                                            <SelectItem value="Farmacia">Farmacia</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value || ""}
                                            placeholder="Descripción de la orden..."
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="diagnosis"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Diagnóstico</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value || ""}
                                            placeholder="Diagnóstico relacionado"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="justification"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Justificación</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value || ""}
                                            placeholder="Justificación de la orden..."
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <Label>Estudios Solicitados</Label>
                            {!selectedCategory ? (
                                <p className="text-sm text-muted-foreground">
                                    Seleccione primero un tipo de estudio
                                </p>
                            ) : getAvailableStudies().length === 0 && studies.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No hay estudios predefinidos disponibles para esta categoría. Puede ingresarlos en la descripción.
                                </p>
                            ) : (
                                <>
                                    {getAvailableStudies().length > 0 && (
                                        <Select onValueChange={handleAddStudy}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Agregar estudio..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getAvailableStudies().map((study, index) => (
                                                    <SelectItem key={`${study}-${index}`} value={study}>
                                                        {study}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </>
                            )}
                            {studies.length > 0 && (
                                <div className="space-y-2 mt-2 border rounded-lg p-3">
                                    {studies.map((study, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between gap-2"
                                        >
                                            <span>{study.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStudy(idx)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="flex-1"
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    "Crear Orden"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={form.formState.isSubmitting}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
