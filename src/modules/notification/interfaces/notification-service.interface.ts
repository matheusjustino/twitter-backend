// DTOS
import { CreateNotificationDTO } from '../dtos/create-notification.dto';
import { NotificationDTO } from '../dtos/notification.dto';

export interface NotificationServiceInterface {
	createNotification(data: CreateNotificationDTO): Promise<void>;
	getNotifications(userTo: string): Promise<NotificationDTO[]>;
}
