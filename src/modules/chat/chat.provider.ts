import { Provider } from '@nestjs/common';

// ENUMS
import { ChatProviderEnum } from './enums/chat-provider.enum';

// SERVICES
import { ChatService } from './chat.service';

export const ChatProvider: Provider[] = [
	{
		provide: ChatProviderEnum.CHAT_SERVICE,
		useClass: ChatService,
	},
];
