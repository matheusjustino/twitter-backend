// DTOS
import { UserDTO } from '@/modules/user/dtos/user.dto';

export class PostDTO {
	public _id?: string;
	public id: string;
	public content: string;
	public postedBy: UserDTO;
	public likes: UserDTO[];
	public retweetUsers: UserDTO[];
	public retweetData?: PostDTO;
	public replyTo?: PostDTO;
	public pinned: boolean;
	public createdAt: Date;
	public updatedAt: Date;
}
