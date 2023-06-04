// DTOS
import { ChatDTO } from '@/modules/chat/dtos/chat.dto';
import { UserDTO } from '@/modules/user/dtos/user.dto';

export class MessageDTO {
	public id: string;
	public _id?: string;
	public sender: UserDTO;
	public content: string;
	public chat: ChatDTO;
	public readBy: UserDTO[];
	public createdAt?: Date;
	public updatedAt?: Date;
}
