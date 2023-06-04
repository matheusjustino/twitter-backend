import { Module } from '@nestjs/common';

import { ChatController } from './chat.controller';
import { ChatProvider } from './chat.provider';

@Module({
	controllers: [ChatController],
	providers: ChatProvider,
	exports: ChatProvider,
})
export class ChatModule {}
