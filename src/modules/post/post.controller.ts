import {
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	Param,
	Post,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';

// ENUMS
import { PostProviderEnum } from './enums/post-provider.enum';

// GUARDS
import { JwtGuard } from '../auth/guards/jwt.guard';

// DECORATORS
import { CurrentUser } from '../auth/decorators/user.decorator';

// INTERFACES
import { TokenLoginDataInterface } from '@/common/interfaces/token-login-data.interface';
import { PostServiceInterface } from './intefaces/post-service.interface';

// DTOS
import { CreatePostDTO } from './dtos/create-post.dto';
import { ListPostsQueryDTO } from './dtos/list-posts-query.dto';
import { LikePostDTO } from './dtos/like-post.dto';

@Controller('posts')
export class PostController {
	constructor(
		@Inject(PostProviderEnum.POST_SERVICE)
		private readonly postService: PostServiceInterface,
	) {}

	@UseGuards(JwtGuard)
	@Post()
	public async createPost(
		@CurrentUser() user: TokenLoginDataInterface,
		@Body() body: CreatePostDTO,
	) {
		return this.postService.createPost(user.id, body);
	}

	@Get(':id')
	public async getPostById(@Param('id') postId: string) {
		return this.postService.getPostById(postId);
	}

	@Get()
	public async listPosts(@Query() query: ListPostsQueryDTO) {
		return this.postService.listPosts({
			...new ListPostsQueryDTO(),
			...query,
		});
	}

	@UseGuards(JwtGuard)
	@Put(':id/like')
	public async likeDislikePost(
		@CurrentUser() user: TokenLoginDataInterface,
		@Param('id') postId: string,
		@Body() body: LikePostDTO,
	) {
		return this.postService.likeDislikePost(user.id, postId, body.isLiked);
	}

	@UseGuards(JwtGuard)
	@Post(':id/retweet')
	public async retweetPost(
		@CurrentUser() user: TokenLoginDataInterface,
		@Param('id') postId: string,
	) {
		return this.postService.retweetPost(user.id, postId);
	}

	@UseGuards(JwtGuard)
	@Delete(':id')
	public async deletePost(
		@CurrentUser() user: TokenLoginDataInterface,
		@Param('id') postId: string,
	) {
		return this.postService.deletePost(user.id, postId);
	}
}
