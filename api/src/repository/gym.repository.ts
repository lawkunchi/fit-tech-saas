import { Mutex } from "async-mutex";
import type { Gym } from "../types/gym.js";
import type { Booking } from "../types/booking.js";

export class GymRepository {
  private gyms: Map<string, Gym> = new Map([
    ['gym_1', { id: 'gym_1', name: 'Downtown Iron', maxCapacity: 50, currentOccupancy: 12 }]
  ]);
  private bookings: Booking[] = [];
  private mutex = new Mutex();

  async getGymById(id: string): Promise<Gym | undefined> {
    const gym = this.gyms.get(id);
    if (!gym) return undefined;

    const totalBookings = this.bookings.length;
    console.log(`[Repository] GetGymById: id=${id}, baseOccupancy=${gym.currentOccupancy}, totalBookings=${totalBookings}`);
    
    return {
      ...gym,
      currentOccupancy: gym.currentOccupancy + totalBookings
    };
  }

  async createBooking(booking: Booking, maxCapacity: number): Promise<boolean> {
    return await this.mutex.runExclusive(async () => {
      const existingBookings = this.bookings.filter(
        b => b.gymId === booking.gymId && b.slotTime === booking.slotTime
      ).length;

      const userExistingBooking = this.bookings.find(
        b => b.gymId === booking.gymId && b.slotTime === booking.slotTime && b.userId === booking.userId
      );

      if (userExistingBooking) {
        return false; 
      }

      const gym = this.gyms.get(booking.gymId);
      if (!gym) return false;

      if (gym.currentOccupancy + this.bookings.length >= maxCapacity) {
        return false; 
      }

      if (existingBookings >= maxCapacity) {
        return false; 
      }

      console.log(`[Repository] Creating booking for user=${booking.userId}, slot=${booking.slotTime}`);
      this.bookings.push(booking);
      return true;
    });
  }
}