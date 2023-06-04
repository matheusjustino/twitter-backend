// DTOS
import { PostDTO } from '@/modules/post/dtos/post.dto';

export class UserDTO {
	public id: string;
	public _id?: string;
	public username: string;
	public email: string;
	public password: string;
	public retweets: PostDTO[];
	public createdAt?: Date;
	public updatedAt?: Date;
}
