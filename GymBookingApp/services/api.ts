import { BookingResponse } from "@/types/booking";
import { GymCapacity } from "@/types/gym";

const API_URL = process.env.EXPO_PUBLIC_API_URL; 


export const gymService = {
  async getCapacity(gymId: string): Promise<GymCapacity> {
    console.log('url', `${API_URL}/gyms/${gymId}/capacity`);
    const response = await fetch(`${API_URL}/gyms/${gymId}/capacity`);
    console.log('response', response);
    if (!response.ok) {
      throw new Error('Failed to fetch capacity');
    }
    return response.json();
  },

  async bookSlot(gymId: string, userId: string, slotTime: string): Promise<BookingResponse> {
    const response = await fetch(`${API_URL}/gyms/${gymId}/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, slotTime }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Booking failed');
    }
    return data;
  },
};
