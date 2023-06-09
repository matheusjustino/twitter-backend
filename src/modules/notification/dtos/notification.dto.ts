import { Types } from 'mongoose';

// ENUMS
import { NotificationTypeEnum } from '@/common/enums/notification.enum';

// DTOS
import { UserDTO } from '@/modules/user/dtos/user.dto';

export class NotificationDTO {
	userTo: UserDTO;
	userFrom: UserDTO;
	notificationType: NotificationTypeEnum;
	opened: boolean;
	entityId: Types.ObjectId;
}
