"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef } from "react";

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

export default function BizFindPage() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useFormState<FormState | undefined, FormData>(
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
  });

  useEffect(() => {
    if (state?.success === true) {
      toast({
        title: "Success!",
        description: state.message,
      });
      form.reset(); // Reset form fields on success
    } else if (state?.success === false && state.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
       // Set form errors if available from server action
       if (state.errors) {
        if (state.errors.businessType) {
          form.setError("businessType", { type: "server", message: state.errors.businessType.join(', ') });
        }
        if (state.errors.location) {
          form.setError("location", { type: "server", message: state.errors.location.join(', ') });
        }
        if (state.errors.numResults) {
          form.setError("numResults", { type: "server", message: state.errors.numResults.join(', ') });
        }
      }
    }
  }, [state, toast, form]);

  const onSubmit = (data: FormData) => {
    // FormData will be automatically passed to formAction
    // No need to manually construct it here if using useFormState correctly
    // The formAction will receive it.
    // This function might just trigger the form submission via formRef.current.requestSubmit()
    // or simply let the <form action={formAction}> handle it.
    // For react-hook-form integration with useFormState, we typically call formAction with form values.
    // However, since formAction is passed to <form action={formAction}>, RHF's handleSubmit will pass data to its own handler, not directly to formAction.
    // We need to bridge this.
    // The simplest bridge when using `formAction` on `<form>` is to let the native form submission trigger the server action.
    // `handleSubmit` from RHF is for client-side validation before calling a manual submission function.
    // Let's trigger the formAction manually with validated data, or ensure the form element calls it.
    
    // When using <form action={formAction}>, RHF's handleSubmit is not strictly needed to *trigger* the action,
    // but it's good for client-side validation before the action is invoked.
    // The `form.handleSubmit` should wrap a function that then creates FormData and calls the action.
    // Or, as `formAction` is already on the `form` element, this `onSubmit` is okay.
    // RHF `handleSubmit` will perform client-side validation first.
    // If valid, it will call this function. Here, we ensure the formAction is called via the form.
    // The form data is passed via the native form submission mechanism to the server action.
    // No need to call formAction(data) directly.
  };

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
              {state?.errors?._form && (
                <p className="text-sm font-medium text-destructive">{state.errors._form.join(', ')}</p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
