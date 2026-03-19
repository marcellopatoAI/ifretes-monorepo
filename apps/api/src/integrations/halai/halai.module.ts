import { Module } from '@nestjs/common';
import { HalaiService } from './halai.service';

@Module({
  providers: [HalaiService],
  exports: [HalaiService],
})
export class HalaiModule {}
