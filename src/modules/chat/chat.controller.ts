import {
	Body,
	Controller,
	Get,
	Inject,
	Param,
	Post,
	UseGuards,
} from '@nestjs/common';

// GUARDS
import { JwtGuard } from '../auth/guards/jwt.guard';

// DECORATORS
import { CurrentUser } from '../auth/decorators/user.decorator';

// ENUMS
import { ChatProviderEnum } from './enums/chat-provider.enum';

// INTERFACES
import { ChatServiceInterface } from './interfaces/chat-service.interface';
import { TokenLoginDataInterface } from '@/common/interfaces/token-login-data.interface';

// DTOS
import { CreateChatDTO } from './dtos/create-chat.dto';

@UseGuards(JwtGuard)
@Controller('chats')
export class ChatController {
	constructor(
		@Inject(ChatProviderEnum.CHAT_SERVICE)
		private readonly chatService: ChatServiceInterface,
	) {}

	@Post()
	public async createChat(
		@CurrentUser() user: TokenLoginDataInterface,
		@Body() body: CreateChatDTO,
	) {
		return this.chatService.createChat(user.id, body);
	}

	@Get(':id/messages')
	public async getChatMessages(
		@CurrentUser() user: TokenLoginDataInterface,
		@Param('id') chatId: string,
	) {
		return this.chatService.getChatMessages(user.id, chatId);
	}

	@Get()
	public async getChats(@CurrentUser() user: TokenLoginDataInterface) {
		return this.chatService.getChats(user.id);
	}
}
