import { Inject, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';

// ENUMS
import { DatabaseProviderEnum } from '../database/enums/database-provider.enum';
import { NotificationTypeEnum } from '@/common/enums/notification.enum';

// INTERFACES
import { NotificationServiceInterface } from './interfaces/notification-service.interface';
import { NotificationRepositoryInterface } from '../database/interfaces/Notification-repository.interface';

// DTOS
import { CreateNotificationDTO } from './dtos/create-notification.dto';
import { NotificationDTO } from './dtos/notification.dto';

@Injectable()
export class NotificationService implements NotificationServiceInterface {
	private readonly logger: Logger = new Logger(NotificationService.name);

	constructor(
		@Inject(DatabaseProviderEnum.NOTIFICATION_REPOSITORY)
		private readonly notificationRepository: NotificationRepositoryInterface,
	) {}

	public async createNotification(
		data: CreateNotificationDTO,
	): Promise<void> {
		this.logger.log(`Create Notification - data: ${JSON.stringify(data)}`);

		await this.notificationRepository.model.deleteOne(data);
		const notification = new this.notificationRepository.model(data);
		await notification.save();
	}

	public async getNotifications(userTo: string): Promise<NotificationDTO[]> {
		return this.notificationRepository.model
			.find({
				userTo: new Types.ObjectId(userTo),
				notificationType: {
					$ne: NotificationTypeEnum.MESSAGE,
				},
			})
			.populate('userFrom')
			.populate('entityId')
			.sort({ createdAt: -1 });
	}
}
