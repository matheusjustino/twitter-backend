// DTOS
import { CreateMessageDTO } from '../dtos/create-message.dto';
import { MessageDTO } from '../dtos/message.dto';

export interface MessageServiceInterface {
	createMessage(data: CreateMessageDTO): Promise<MessageDTO>;
}
