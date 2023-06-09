import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// INTERFACES
import { NotificationRepositoryInterface } from '../interfaces/Notification-repository.interface';

// SCHEMAS
import {
	Notification,
	NotificationDocument,
} from '../schemas/notification.schema';

@Injectable()
export class NotificationRepository implements NotificationRepositoryInterface {
	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<NotificationDocument>,
	) {}

	public get model(): Model<NotificationDocument> {
		return this.notificationModel;
	}
}
