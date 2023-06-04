import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// SCHEMAS
import { BaseSchema } from './base.schema';
import { Chat } from './chat.schema';
import { User } from './user.schema';

// DTOS
import { MessageDTO } from '@/modules/message/dtos/message.dto';

@Schema({ timestamps: true })
export class Message extends BaseSchema implements MessageDTO {
	@Prop({ ref: User.name, type: Types.ObjectId })
	public sender: User;

	@Prop({ type: String, trim: true })
	public content: string;

	@Prop({ ref: Chat?.name ?? 'Chat', type: Types.ObjectId })
	public chat: Chat;

	@Prop({ ref: User.name, type: Types.ObjectId })
	public readBy: User[];
}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);
