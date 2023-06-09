import { Controller, Get, Inject, UseGuards } from '@nestjs/common';

// DECORATORS
import { CurrentUser } from '../auth/decorators/user.decorator';

// GUARDS
import { JwtGuard } from '../auth/guards/jwt.guard';

// ENUMS
import { NotificationProviderEnum } from './enums/notification-provider.enum';

// INTERFACES
import { NotificationServiceInterface } from './interfaces/notification-service.interface';
import { TokenLoginDataInterface } from '@/common/interfaces/token-login-data.interface';

@Controller('notifications')
export class NotificationController {
	constructor(
		@Inject(NotificationProviderEnum.NOTIFICATION_SERVICE)
		private readonly notificationService: NotificationServiceInterface,
	) {}

	@UseGuards(JwtGuard)
	@Get()
	public async getNotifications(
		@CurrentUser() user: TokenLoginDataInterface,
	) {
		return this.notificationService.getNotifications(user.id);
	}
}
