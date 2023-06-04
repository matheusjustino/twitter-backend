import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';

// DECORATORS
import { CurrentUser } from '../auth/decorators/user.decorator';

// GUARDS
import { JwtGuard } from '../auth/guards/jwt.guard';

// ENUMS
import { MessageProviderEnum } from './enums/message-provider.enum';

// INTERFACES
import { MessageServiceInterface } from './interfaces/message-service.interface';
import { TokenLoginDataInterface } from '@/common/interfaces/token-login-data.interface';

// DTOS
import { CreateMessageDTO } from './dtos/create-message.dto';

@UseGuards(JwtGuard)
@Controller('messages')
export class MessageController {
	constructor(
		@Inject(MessageProviderEnum.MESSAGE_SERVICE)
		private readonly messageService: MessageServiceInterface,
	) {}

	@Post()
	public async createMessage(
		@CurrentUser() user: TokenLoginDataInterface,
		@Body() body: CreateMessageDTO,
	) {
		return this.messageService.createMessage({
			...body,
			senderId: user.id,
		});
	}
}
