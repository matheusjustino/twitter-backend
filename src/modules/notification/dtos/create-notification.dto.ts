import { Types } from 'mongoose';

// ENUMS
import { NotificationTypeEnum } from '@/common/enums/notification.enum';

export class CreateNotificationDTO {
	userTo: Types.ObjectId;
	userFrom: Types.ObjectId;
	notificationType: NotificationTypeEnum;
	entityId: Types.ObjectId;
}
