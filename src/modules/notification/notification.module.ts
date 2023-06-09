import { Global, Module } from '@nestjs/common';

import { NotificationProvider } from './notification.provider';
import { NotificationController } from './notification.controller';

@Global()
@Module({
	providers: NotificationProvider,
	exports: NotificationProvider,
	controllers: [NotificationController],
})
export class NotificationModule {}
