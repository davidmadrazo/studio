"use server";

import { z } from "zod";

const formSchema = z.object({
  businessType: z.string().min(1, "Business type is required."),
  location: z.string().min(1, "Location is required."),
  numResults: z.coerce
    .number({ invalid_type_error: "Number of results must be a number." })
    .int("Number of results must be an integer.")
    .min(1, "Number of results must be at least 1."),
});

export type FormState = {
  message: string;
  errors?: {
    businessType?: string[];
    location?: string[];
    numResults?: string[];
    _form?: string[];
  };
  success: boolean;
};

export async function submitBizFindForm(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const rawFormData = {
    businessType: formData.get("businessType"),
    location: formData.get("location"),
    numResults: formData.get("numResults"),
  };

  const validatedFields = formSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

  const payload = {
    "Tipo o nombre de negocio": data.businessType,
    "localizacion": data.location,
    "Numero de resultados": data.numResults,
  };

  try {
    const response = await fetch("https://webhookn8n.profimaxia.com/webhook/ae226503-4cbf-418e-98fd-d864e2ee388c", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorBody = "Unknown error from API.";
      try {
        errorBody = await response.text();
      } catch (e) {
        // ignore if can't parse body
      }
      console.error("API Error:", response.status, errorBody);
      return { 
        success: false, 
        message: `Submission failed: ${response.statusText || 'Error from server'}. ${errorBody ? `Details: ${errorBody.substring(0,100)}` : ''}`,
        errors: { _form: [`API request failed with status ${response.status}`]}
      };
    }
    
    // Assuming successful submission doesn't return a JSON body that needs parsing.
    // If it does, you might want to: const responseData = await response.json();
    
    return { success: true, message: "Request submitted successfully!" };

  } catch (error) {
    console.error("Submission error:", error);
    let errorMessage = "An unknown error occurred during submission.";
    if (error instanceof Error) {
        errorMessage = `An error occurred: ${error.message}`;
    }
    return { 
      success: false, 
      message: errorMessage,
      errors: { _form: [errorMessage] }
    };
  }
}
