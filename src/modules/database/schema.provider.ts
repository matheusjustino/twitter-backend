import { AsyncModelFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

// SCHEMAS
import { User, UserSchema, UserDocument } from './schemas/user.schema';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { Post, PostSchema } from './schemas/post.schema';
import {
	Notification,
	NotificationSchema,
} from './schemas/notification.schema';

export const SchemaProvider: AsyncModelFactory[] = [
	{
		name: User.name,
		collection: 'users',
		useFactory: () => {
			const schema = UserSchema;
			schema.pre<UserDocument>('save', async function (next) {
				if (!this.isModified('password')) next();

				const salt = await bcrypt.genSalt(12);
				const hash = await bcrypt.hash(this.password, salt);
				this.password = hash;
				next();
			});

			return schema;
		},
	},
	{
		name: Chat?.name ?? 'Chat',
		collection: 'chats',
		useFactory: () => ChatSchema,
	},
	{
		name: Message.name,
		collection: 'messages',
		useFactory: () => MessageSchema,
	},
	{
		name: Post.name,
		collection: 'posts',
		useFactory: () => PostSchema,
	},
	{
		name: Notification.name,
		collection: 'notifications',
		useFactory: () => NotificationSchema,
	},
];
