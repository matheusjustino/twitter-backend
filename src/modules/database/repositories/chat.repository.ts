import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// INTERFACES
import { ChatRepositoryInterface } from '../interfaces/chat-repository.interface';

// SCHEMAS
import { Chat, ChatDocument } from '../schemas/chat.schema';

@Injectable()
export class ChatRepository implements ChatRepositoryInterface {
	constructor(
		@InjectModel(Chat.name)
		private readonly ChatModel: Model<ChatDocument>,
	) {}

	public get model(): Model<ChatDocument> {
		return this.ChatModel;
	}
}
