// DTOS
import { ChatDTO } from '../dtos/chat.dto';
import { CreateChatDTO } from '../dtos/create-chat.dto';
import { MessageDTO } from '@/modules/message/dtos/message.dto';
import { FindChatsQueryDTO } from '../dtos/find-chats-query.dto';

export interface ChatServiceInterface {
	createChat(userId: string, data: CreateChatDTO): Promise<ChatDTO>;
	getChats(userId: string, query: FindChatsQueryDTO): Promise<ChatDTO[]>;
	getChatMessages(userId: string, chatId: string): Promise<MessageDTO[]>;
	updateChatName(
		chatId: string,
		userId: string,
		chatName: string,
	): Promise<ChatDTO>;
	addUsersToChat(
		userId: string,
		chatId: string,
		userIds: string[],
	): Promise<ChatDTO>;
}
