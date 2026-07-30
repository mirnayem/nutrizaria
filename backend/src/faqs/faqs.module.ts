import { Module } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { FaqsController, AdminFaqsController } from './faqs.controller';

@Module({ controllers: [FaqsController, AdminFaqsController], providers: [FaqsService], exports: [FaqsService] })
export class FaqsModule {}
