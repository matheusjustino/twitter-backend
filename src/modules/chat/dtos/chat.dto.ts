// DTOS
import { MessageDTO } from '@/modules/message/dtos/message.dto';
import { UserDTO } from '@/modules/user/dtos/user.dto';

export class ChatDTO {
	public id: string;
	public _id?: string;
	chatName: string | null;
	isGroupChat: boolean;
	users: UserDTO[];
	latestMessage: MessageDTO | null;
	public createdAt?: Date;
	public updatedAt?: Date;
}
