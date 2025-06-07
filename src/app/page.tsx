"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useEffect, useRef } from "react";

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
import { submitBizFindForm, type FormState } from "./actions";
import { Loader2 } from "lucide-react";

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
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = React.useActionState<FormState | undefined, FormData>(
    // @ts-ignore
    submitBizFindForm,
    undefined
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessType: "",
      location: "",
      numResults: 1,
    },
    // Pass the state to react-hook-form to show errors
    errors: state?.errors ? {
      businessType: state.errors.businessType ? { type: 'server', message: state.errors.businessType.join(', ') } : undefined,
      location: state.errors.location ? { type: 'server', message: state.errors.location.join(', ') } : undefined,
      numResults: state.errors.numResults ? { type: 'server', message: state.errors.numResults.join(', ') } : undefined,
      root: state.errors._form ? { serverError: { type: 'server', message: state.errors._form.join(', ') } } : undefined,
    } : undefined,
  });

  useEffect(() => {
    if (state?.success === true) {
      toast({
        title: "Success!",
        description: state.message,
      });
      form.reset(); // Reset form fields on success
    } else if (state?.success === false && state.message) {
      // Errors are now handled by RHF via the `errors` prop in useForm,
      // but we can still show a generic toast for the _form error if desired or for general failure messages
      if (state.errors?._form) {
         toast({
          variant: "destructive",
          title: "Error",
          description: state.message,
        });
      } else if (!state.errors?.businessType && !state.errors?.location && !state.errors?.numResults) {
        // If there are no specific field errors, show a general error toast
         toast({
          variant: "destructive",
          title: "Error",
          description: state.message,
        });
      }
    }
  }, [state, toast, form]);
  
  // Update RHF errors when server state changes
  useEffect(() => {
    if (state?.errors) {
      if (state.errors.businessType) {
        form.setError("businessType", { type: "server", message: state.errors.businessType.join(', ') });
      }
      if (state.errors.location) {
        form.setError("location", { type: "server", message: state.errors.location.join(', ') });
      }
      if (state.errors.numResults) {
        form.setError("numResults", { type: "server", message: state.errors.numResults.join(', ') });
      }
      if (state.errors._form) {
        form.setError("root.serverError", { type: "server", message: state.errors._form.join(', ') });
      }
    }
  }, [state?.errors, form]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Encuentra tus clientes</CardTitle>
          <CardDescription className="text-center">
            Enter business details to find what you're looking for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              ref={formRef}
              action={formAction}
              onSubmit={form.handleSubmit(() => formRef.current?.requestSubmit())} // client validation then submit
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Restaurant, Cafe, Bookstore" {...field} />
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
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York, London, Tokyo" {...field} />
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
                    <FormLabel>Number of Results</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10" {...field} />
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
                    Submitting...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
              {form.formState.errors.root?.serverError && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.root.serverError.message}</p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
