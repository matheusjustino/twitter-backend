import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// INTERFACES
import { MessageRepositoryInterface } from '../interfaces/message-repository.interface';

// SCHEMAS
import { Message, MessageDocument } from '../schemas/message.schema';

@Injectable()
export class MessageRepository implements MessageRepositoryInterface {
	constructor(
		@InjectModel(Message.name)
		private readonly MessageModel: Model<MessageDocument>,
	) {}

	public get model(): Model<MessageDocument> {
		return this.MessageModel;
	}
}
