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
import { FindChatsQueryDTO } from './dtos/find-chats-query.dto';

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

	public async getChats(
		userId: string,
		query: FindChatsQueryDTO,
	): Promise<ChatDTO[]> {
		this.logger.log(
			`Get Chats - userId: ${userId} - query: ${JSON.stringify(query)}`,
		);

		const { limit, skip, filters } = query;

		return this.chatRepository.model
			.find({
				...filters,
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
			.limit(limit)
			.skip(skip)
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

	public async updateChatName(
		userId: string,
		chatId: string,
		chatName: string,
	): Promise<ChatDTO> {
		this.logger.log(
			`Update Chat Name - chatId: ${chatId} - userId: ${userId} - chatName: ${chatName}`,
		);

		const updatedChat = await this.chatRepository.model.findOneAndUpdate(
			{
				_id: new Types.ObjectId(chatId),
				users: {
					$elemMatch: {
						$eq: new Types.ObjectId(userId),
					},
				},
			},
			{
				chatName,
			},
			{
				new: true,
			},
		);

		if (!updatedChat) {
			throw new BadRequestException('Chat not found');
		}

		return updatedChat;
	}

	public async addUsersToChat(
		userId: string,
		chatId: string,
		userIds: string[],
	): Promise<ChatDTO> {
		this.logger.log(
			`Add Users To CHat - userId: ${userId} - chatId: ${chatId} - usersId: ${userIds}}`,
		);

		const updatedChat = await this.chatRepository.model
			.findOneAndUpdate(
				{
					_id: new Types.ObjectId(chatId),
					users: {
						$elemMatch: {
							$eq: new Types.ObjectId(userId),
						},
					},
				},
				{
					isGroupChat: true,
					$addToSet: {
						users: {
							$each: userIds.map((id) => new Types.ObjectId(id)),
						},
					},
				},
				{
					new: true,
				},
			)
			.populate({
				path: 'users',
				justOne: false,
			})
			.populate({
				path: 'latestMessage',
				populate: {
					path: 'sender',
				},
			});

		if (!updatedChat) {
			throw new BadRequestException('Chat not found');
		}

		return updatedChat;
	}
}
