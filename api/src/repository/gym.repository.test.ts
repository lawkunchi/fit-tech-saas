import { describe, it, expect, beforeEach } from 'vitest';
import { GymRepository } from './gym.repository.js';
import type { Booking } from '../types/booking.js';

describe('GymRepository', () => {
  let repo: GymRepository;

  beforeEach(() => {
    repo = new GymRepository();
  });

  it('should allow booking when capacity is available', async () => {
    const booking: Booking = {
      userId: 'user_1',
      gymId: 'gym_1',
      slotTime: '2026-02-19T18:00:00Z'
    };
    const success = await repo.createBooking(booking, 50);
    expect(success).toBe(true);
  });

  it('should prevent booking when capacity is exceeded', async () => {
    const maxCapacity = 2;
    const booking1: Booking = { userId: 'u1', gymId: 'gym_1', slotTime: '18:00' };
    const booking2: Booking = { userId: 'u2', gymId: 'gym_1', slotTime: '18:00' };
    const booking3: Booking = { userId: 'u3', gymId: 'gym_1', slotTime: '18:00' };

    await repo.createBooking(booking1, maxCapacity);
    await repo.createBooking(booking2, maxCapacity);
    const success = await repo.createBooking(booking3, maxCapacity);

    expect(success).toBe(false);
  });

  it('should handle concurrent booking requests without overbooking', async () => {
    const maxCapacity = 5;
    const bookings: Booking[] = Array.from({ length: 10 }, (_, i) => ({
      userId: `user_${i}`,
      gymId: 'gym_1',
      slotTime: '18:00'
    }));

    // Perform bookings concurrently
    const results = await Promise.all(
      bookings.map(b => repo.createBooking(b, maxCapacity))
    );

    const successfulBookings = results.filter(Boolean).length;
    expect(successfulBookings).toBe(maxCapacity);
  });
});
