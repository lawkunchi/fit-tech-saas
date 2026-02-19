import Fastify from 'fastify';
import cors from '@fastify/cors';
import awsLambdaFastify from 'aws-lambda-fastify';
import { GymRepository } from './repository/gym.repository.js';
import addFormats from 'ajv-formats';

const fastify = Fastify({
  logger: true,
  ajv: {
    plugins: [
      (ajv: any) => addFormats(ajv)
    ]
  }
});

const repo = new GymRepository();

const setupServer = async () => {
  await fastify.register(cors, {
    origin: '*', // For development, allow all origins
  });
};

fastify.get<{ Params: { id: string } }>('/gyms/:id/capacity', async (request, reply) => {
  const { id } = request.params;
  const gym = await repo.getGymById(id);

  if (!gym) return reply.status(404).send({ error: 'Gym not found' });

  const percentage = (gym.currentOccupancy / gym.maxCapacity) * 100;
  return { id, capacityPercentage: Math.round(Math.min(percentage, 100) * 100) / 100 };
});

fastify.post<{ Params: { id: string }; Body: { userId: string; slotTime: string } }>(
  '/gyms/:id/book',
  {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          userId: { type: 'string', minLength: 1 },
          slotTime: { 
            type: 'string', 
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(Z|[+-]\\d{2}:\\d{2})$' 
          }
        },
        required: ['userId', 'slotTime']
      }
    }
  },
  async (request, reply) => {
    const { id } = request.params;
    const { userId, slotTime } = request.body;

    const bookingDate = new Date(slotTime);
    if (isNaN(bookingDate.getTime()) || bookingDate < new Date()) {
      return reply.status(400).send({ error: 'Invalid or past slot time' });
    }

    const gym = await repo.getGymById(id);
    if (!gym) return reply.status(404).send({ error: 'Gym not found' });

    const success = await repo.createBooking({ userId, gymId: id, slotTime }, gym.maxCapacity);

    if (!success) {
      return reply.status(409).send({ error: 'Slot fully booked or already reserved by you' });
    }

    return reply.status(201).send({ message: 'Booking confirmed', slotTime });
  }
);

const start = async () => {
  try {
    await setupServer();
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Export handler for AWS Lambda
export const handler = async (event: any, context: any) => {
  await setupServer();
  const proxy = awsLambdaFastify(fastify);
  return proxy(event, context);
};

// Only listen on port if not running in Lambda
if (process.env.NODE_ENV !== 'production' && !process.env.LAMBDA_TASK_ROOT) {
  start();
}