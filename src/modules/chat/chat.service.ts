import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import { Types } from 'mongoose';

// ENUMS
import { DatabaseProviderEnum } from '../database/enums/database-provider.enum';

// INTERFACES
import { ChatRepositoryInterface } from '../database/interfaces/chat-repository.interface';
import { MessageRepositoryInterface } from '../database/interfaces/message-repository.interface';
import { ChatServiceInterface } from './interfaces/chat-service.interface';

// DTOS
import { ChatDTO } from './dtos/chat.dto';
import { CreateChatDTO } from './dtos/create-chat.dto';
import { MessageDTO } from '../message/dtos/message.dto';

@Injectable()
export class ChatService implements ChatServiceInterface {
	private readonly logger: Logger = new Logger(ChatService.name);

	constructor(
		@Inject(DatabaseProviderEnum.CHAT_REPOSITORY)
		private readonly chatRepository: ChatRepositoryInterface,
		@Inject(DatabaseProviderEnum.MESSAGE_REPOSITORY)
		private readonly messageRepository: MessageRepositoryInterface,
	) {}

	public async createChat(
		userId: string,
		data: CreateChatDTO,
	): Promise<ChatDTO> {
		this.logger.log(`Create Chat - data: ${JSON.stringify(data)}`);

		const { isGroupChat, users } = data;

		const newChat = new this.chatRepository.model({
			users: [...users, userId].map((id) => new Types.ObjectId(id)),
			isGroupChat,
		});
		await newChat.save();
		await newChat.populate({ path: 'users', justOne: false });
		return newChat;
	}

	public async getChats(userId: string): Promise<ChatDTO[]> {
		this.logger.log(`Get Chats - userId: ${userId}`);

		return this.chatRepository.model
			.find({
				users: {
					$elemMatch: {
						$eq: new Types.ObjectId(userId),
					},
				},
			})
			.populate({
				path: 'users',
				justOne: false,
			})
			.populate({
				path: 'latestMessage',
				populate: {
					path: 'sender',
				},
			})
			.sort({ updatedAt: -1 });
	}

	public async getChatMessages(
		userId: string,
		chatId: string,
	): Promise<MessageDTO[]> {
		this.logger.log(
			`Get Chat Messages - userId: ${userId} - chatId: ${chatId}`,
		);

		const chatExists = await this.chatRepository.model.findById(chatId);
		if (!chatExists) {
			throw new BadRequestException('Chat not found');
		}

		const userCanAccessChat = chatExists.users.filter(
			(u) => (u as unknown as Types.ObjectId).toString() === userId,
		)[0];

		if (!userCanAccessChat) {
			throw new UnauthorizedException('User not allowed to access chat');
		}

		return this.messageRepository.model
			.find({
				chat: new Types.ObjectId(chatId),
			})
			.populate('sender')
			.exec();
	}
}
