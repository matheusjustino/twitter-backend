import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';

// ENUMS
import { DatabaseProviderEnum } from '../database/enums/database-provider.enum';
import { NotificationTypeEnum } from '@/common/enums/notification.enum';

// INTERFACES
import { NotificationServiceInterface } from './interfaces/notification-service.interface';
import { NotificationRepositoryInterface } from '../database/interfaces/notification-repository.interface';

// DTOS
import { CreateNotificationDTO } from './dtos/create-notification.dto';
import { NotificationDTO } from './dtos/notification.dto';
import { FindNotificationQueryDTO } from './dtos/find-notifications-query.dto';

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

	public async getNotifications(
		userTo: string,
		query: FindNotificationQueryDTO,
	): Promise<NotificationDTO[]> {
		this.logger.log(`Get Notifications - userTo: ${userTo}`);

		const { limit, skip, filters } = query;

		return this.notificationRepository.model
			.find({
				...filters,
				userTo: new Types.ObjectId(userTo),
				notificationType: {
					$ne: NotificationTypeEnum.MESSAGE,
				},
			})
			.limit(limit)
			.skip(skip)
			.populate('userFrom')
			.sort({ createdAt: -1 });
	}

	public async getLatestNotification(
		userId: string,
	): Promise<NotificationDTO> {
		this.logger.log(`Get Latest Notification - userId: ${userId}`);

		const notification = await this.notificationRepository.model
			.findOne({
				userTo: new Types.ObjectId(userId),
				opened: false,
			})
			.populate('userFrom')
			.sort({ createdAt: -1 });

		if (!notification) {
			throw new BadRequestException('Notification not found');
		}

		return notification;
	}

	public async openNotifications(
		userId: string,
		notificationId: string,
	): Promise<NotificationDTO> {
		this.logger.log(
			`Open Notification - userId: ${userId} notificationId: ${notificationId}`,
		);

		const updatedNotification =
			await this.notificationRepository.model.findOneAndUpdate(
				{
					_id: new Types.ObjectId(notificationId),
					userTo: new Types.ObjectId(userId),
				},
				{
					$set: {
						opened: true,
					},
				},
				{
					populate: ['userFrom'],
					new: true,
				},
			);

		if (!updatedNotification) {
			throw new BadRequestException('Notification not found');
		}

		return updatedNotification;
	}

	public async openManyNotifications(userId: string): Promise<void> {
		this.logger.log(`Open Many Notifications - userId: ${userId}`);

		await this.notificationRepository.model.updateMany(
			{
				userTo: new Types.ObjectId(userId),
				opened: false,
			},
			{
				$set: {
					opened: true,
				},
			},
			{
				new: true,
			},
		);
	}
}
