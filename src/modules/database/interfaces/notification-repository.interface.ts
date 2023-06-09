import { Model } from 'mongoose';

// SCHEMAS
import { NotificationDocument } from '../schemas/notification.schema';

export interface NotificationRepositoryInterface {
	model: Model<NotificationDocument>;
}
