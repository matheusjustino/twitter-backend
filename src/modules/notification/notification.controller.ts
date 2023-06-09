import {
	Controller,
	Get,
	Inject,
	Param,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';

// DECORATORS
import { CurrentUser } from '../auth/decorators/user.decorator';

// GUARDS
import { JwtGuard } from '../auth/guards/jwt.guard';

// ENUMS
import { NotificationProviderEnum } from './enums/notification-provider.enum';

// INTERFACES
import { NotificationServiceInterface } from './interfaces/notification-service.interface';
import { TokenLoginDataInterface } from '@/common/interfaces/token-login-data.interface';

// DTOS
import { FindNotificationQueryDTO } from './dtos/find-notifications-query.dto';

@UseGuards(JwtGuard)
@Controller('notifications')
export class NotificationController {
	constructor(
		@Inject(NotificationProviderEnum.NOTIFICATION_SERVICE)
		private readonly notificationService: NotificationServiceInterface,
	) {}

	@Get()
	public async getNotifications(
		@CurrentUser() user: TokenLoginDataInterface,
		@Query() query: FindNotificationQueryDTO,
	) {
		return this.notificationService.getNotifications(user.id, {
			...new FindNotificationQueryDTO(),
			...query,
		});
	}

	@Put(':id/open')
	public async openNotification(
		@CurrentUser() user: TokenLoginDataInterface,
		@Param('id') notificationId: string,
	) {
		return this.notificationService.openNotifications(
			user.id,
			notificationId,
		);
	}

	@Put('open/all')
	public async openManyNotifications(
		@CurrentUser() user: TokenLoginDataInterface,
	) {
		return this.notificationService.openManyNotifications(user.id);
	}
}
