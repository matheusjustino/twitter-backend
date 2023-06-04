// DTOS
import { ChatDTO } from '../dtos/chat.dto';
import { CreateChatDTO } from '../dtos/create-chat.dto';
import { MessageDTO } from '@/modules/message/dtos/message.dto';

export interface ChatServiceInterface {
	createChat(userId: string, data: CreateChatDTO): Promise<ChatDTO>;
	getChats(userId: string): Promise<ChatDTO[]>;
	getChatMessages(userId: string, chatId: string): Promise<MessageDTO[]>;
}
