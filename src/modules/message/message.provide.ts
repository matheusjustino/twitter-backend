import { Provider } from '@nestjs/common';

// ENUMS
import { MessageProviderEnum } from './enums/message-provider.enum';

// SERVICES
import { MessageService } from './message.service';

export const MessageProvider: Provider[] = [
	{
		provide: MessageProviderEnum.MESSAGE_SERVICE,
		useClass: MessageService,
	},
];
