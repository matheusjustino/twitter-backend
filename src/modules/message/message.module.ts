import { Module } from '@nestjs/common';

import { MessageController } from './message.controller';
import { MessageProvider } from './message.provide';

@Module({
	controllers: [MessageController],
	providers: MessageProvider,
	exports: MessageProvider,
})
export class MessageModule {}
