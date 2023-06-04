import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// DTOS
import { ChatDTO } from '@/modules/chat/dtos/chat.dto';

// SCHEMAS
import { BaseSchema } from './base.schema';
import { Message } from './message.schema';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Chat extends BaseSchema implements ChatDTO {
	@Prop({ type: String, trim: true, nullable: true })
	public chatName: string;

	@Prop({ type: Boolean, default: false })
	public isGroupChat: boolean;

	@Prop({ ref: User.name, type: Types.ObjectId })
	public users: User[];

	@Prop({ ref: Message.name, type: Types.ObjectId, nullable: true })
	public latestMessage: Message;
}

export type ChatDocument = Chat & Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);
