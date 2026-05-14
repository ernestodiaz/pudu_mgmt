import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ChecklistItem } from './entities/checklist-item.entity';
import { ChecklistInstance } from './entities/checklist-instance.entity';
import { ChecklistResponse } from './entities/checklist-response.entity';
import { ChecklistsService } from './checklists.service';
import { ChecklistsController } from './checklists.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChecklistTemplate, ChecklistItem, ChecklistInstance, ChecklistResponse]),
    forwardRef(() => NotificationsModule),
  ],
  providers: [ChecklistsService],
  controllers: [ChecklistsController],
  exports: [ChecklistsService],
})
export class ChecklistsModule {}
