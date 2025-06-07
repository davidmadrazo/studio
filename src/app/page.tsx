"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Validación con Zod
const formSchema = z.object({
  businessType: z.string().min(1, "Business type is required."),
  location: z.string().min(1, "Location is required."),
  numResults: z.coerce
    .number({ invalid_type_error: "Must be a number." })
    .int("Must be a whole number.")
    .min(1, "Number of results must be at least 1."),
});

type FormData = z.infer<typeof formSchema>;

export default function EncuentraClientesPage() {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessType: "",
      location: "",
      numResults: 1,
    },
  });

  // 🔁 Enviar datos al Webhook de n8n
  const handleSubmit = async (data: FormData) => {
    const payload = {
      tipo_negocio: data.businessType,
      localizacion: data.location,
      resultados: data.numResults,
    };

    try {
      const res = await fetch("https://webhookn8n.profimaxia.com/webhook/ae226503-4cbf-418e-98fd-d864e2ee388c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error en la solicitud");
      toast({
        title: "✅ Solicitud enviada correctamente",
      });
      form.reset();
    } catch (err) {
      console.error(err);
      toast({
        title: "❌ Error",
        description: "No se pudo enviar la solicitud",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Encuentra tus clientes</CardTitle>
          <CardDescription className="text-center">
            Introduce los datos del negocio que quieres buscar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de negocio</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: pastelería, restaurante..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localización</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Madrid, Valencia..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de resultados</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Buscar"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}

