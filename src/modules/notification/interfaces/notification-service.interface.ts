// DTOS
import { CreateNotificationDTO } from '../dtos/create-notification.dto';
import { FindNotificationQueryDTO } from '../dtos/find-notifications-query.dto';
import { NotificationDTO } from '../dtos/notification.dto';

export interface NotificationServiceInterface {
	createNotification(data: CreateNotificationDTO): Promise<void>;
	getNotifications(
		userTo: string,
		query: FindNotificationQueryDTO,
	): Promise<NotificationDTO[]>;
	getLatestNotification(userId: string): Promise<NotificationDTO>;
	openNotifications(
		userId: string,
		notificationId: string,
	): Promise<NotificationDTO>;
	openManyNotifications(userId: string): Promise<void>;
}
