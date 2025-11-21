"use server";

export interface MedicalInsurance {
  id: number;
  name: string;
}

export async function getMedicalInsurances(): Promise<MedicalInsurance[]> {
  try {
    const url = `${process.env.BACKEND_URL}/medical-insurances`;
    console.log('[getMedicalInsurances] Fetching from:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log('[getMedicalInsurances] Response status:', response.status);

    if (!response.ok) {
      console.error('[getMedicalInsurances] Response not ok:', response.status);
      return [];
    }

    const payload = await response.json();
    console.log('[getMedicalInsurances] Payload:', JSON.stringify(payload));

    // The backend wraps the response in { statusCode, message, data }
    if (payload.data) {
      return payload.data as MedicalInsurance[];
    }

    // If it returns the array directly
    if (Array.isArray(payload)) {
      return payload as MedicalInsurance[];
    }

    return [];
  } catch (error) {
    console.error('[getMedicalInsurances] Error:', error);
    return [];
  }
}
