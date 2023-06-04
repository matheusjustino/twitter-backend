// DTOS
import { PostDTO } from '../dtos/post.dto';
import { CreatePostDTO } from '../dtos/create-post.dto';
import { ListPostsQueryDTO } from '../dtos/list-posts-query.dto';

export interface PostServiceInterface {
	createPost(userId: string, data: CreatePostDTO): Promise<PostDTO>;
	listPosts(query: ListPostsQueryDTO): Promise<PostDTO[]>;
	likeDislikePost(
		userId: string,
		postId: string,
		isLiked: boolean,
	): Promise<PostDTO>;
	retweetPost(userId: string, postId: string): Promise<PostDTO>;
}
