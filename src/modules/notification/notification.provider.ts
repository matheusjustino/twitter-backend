import { Provider } from '@nestjs/common';

// ENUMS
import { NotificationProviderEnum } from './enums/notification-provider.enum';

// SERVICES
import { NotificationService } from './notification.service';

export const NotificationProvider: Provider[] = [
	{
		provide: NotificationProviderEnum.NOTIFICATION_SERVICE,
		useClass: NotificationService,
	},
];
