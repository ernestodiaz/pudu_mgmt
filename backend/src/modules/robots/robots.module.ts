import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Robot } from './entities/robot.entity';
import { RobotsService } from './robots.service';
import { RobotsController } from './robots.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Robot])],
  providers: [RobotsService],
  controllers: [RobotsController],
  exports: [RobotsService],
})
export class RobotsModule {}
