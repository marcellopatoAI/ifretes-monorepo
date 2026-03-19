import { Controller, Get } from '@nestjs/common';
import { type Envelope } from '@ifretes/contracts';

@Controller('health')
export class HealthController {
  @Get()
  check(): Envelope {
    return {
      ok: true,
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
