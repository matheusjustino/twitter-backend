import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

// SCHEMAS
import { BaseSchema } from './base.schema';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Notification extends BaseSchema {
	@Prop({ ref: User?.name ?? 'User', type: Types.ObjectId })
	public userTo: User;

	@Prop({ ref: User?.name ?? 'User', type: Types.ObjectId })
	public userFrom: User;

	@Prop({ type: String, trim: true })
	public notificationType: string;

	@Prop({ type: Boolean, default: false })
	public opened: boolean;

	@Prop({ type: Types.ObjectId })
	public entityId: Types.ObjectId;
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
