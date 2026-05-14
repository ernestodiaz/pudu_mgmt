import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MaintenanceService } from './maintenance.service';

@Processor('maintenance')
export class MaintenanceProcessor {
  private readonly logger = new Logger(MaintenanceProcessor.name);

  constructor(private maintenanceService: MaintenanceService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleDailyCheck() {
    this.logger.log('Running daily maintenance check...');
    try {
      await this.maintenanceService.runDailyCheck();
      this.logger.log('Daily maintenance check complete');
    } catch (err) {
      this.logger.error('Daily maintenance check failed:', err);
    }
  }
}
