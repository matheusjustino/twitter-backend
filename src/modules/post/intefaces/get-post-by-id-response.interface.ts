// DTOS
import { PostDTO } from '../dtos/post.dto';

export interface GetPostByIdResponse {
	post: PostDTO;
	replyTo?: PostDTO;
	replies?: PostDTO[];
}
