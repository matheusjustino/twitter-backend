import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';

// ENUMS
import { DatabaseProviderEnum } from '../database/enums/database-provider.enum';

// INTERFACES
import { MessageServiceInterface } from './interfaces/message-service.interface';
import { MessageRepositoryInterface } from '../database/interfaces/message-repository.interface';
import { ChatRepositoryInterface } from '../database/interfaces/chat-repository.interface';

// DTOS
import { CreateMessageDTO } from './dtos/create-message.dto';
import { MessageDTO } from './dtos/message.dto';

@Injectable()
export class MessageService implements MessageServiceInterface {
	private readonly logger: Logger = new Logger(MessageService.name);

	constructor(
		@Inject(DatabaseProviderEnum.MESSAGE_REPOSITORY)
		private readonly messageRepository: MessageRepositoryInterface,
		@Inject(DatabaseProviderEnum.CHAT_REPOSITORY)
		private readonly chatRepository: ChatRepositoryInterface,
	) {}

	public async createMessage(data: CreateMessageDTO): Promise<MessageDTO> {
		this.logger.log(`Create Message - data: ${JSON.stringify(data)}`);

		const chat = await this.chatRepository.model.findById(data.chatId);

		if (!chat) {
			throw new BadRequestException('Chat not found');
		}

		const newMessage = new this.messageRepository.model({
			sender: new Types.ObjectId(data.senderId),
			chat: new Types.ObjectId(data.chatId),
			content: data.content,
		});
		await newMessage.save();

		const message = await newMessage.populate('sender');
		await message.populate({
			path: 'chat',
			populate: {
				path: 'users',
				justOne: false,
			},
		});
		await chat
			.updateOne({
				$set: {
					latestMessage: message,
				},
			})
			.exec();

		return message;
	}
}
