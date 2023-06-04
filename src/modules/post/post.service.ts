import { PostDocument } from './../database/schemas/post.schema';
import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';

// ENUMS
import { DatabaseProviderEnum } from '../database/enums/database-provider.enum';

// INTERFACES
import { PostServiceInterface } from './intefaces/post-service.interface';
import { GetPostByIdResponse } from './intefaces/get-post-by-id-response.interface';
import { PostRepositoryInterface } from '../database/interfaces/post-repository.interface';
import { UserRepositoryInterface } from '../database/interfaces/user-repository.interface';

// DTOS
import { PostDTO } from './dtos/post.dto';
import { CreatePostDTO } from './dtos/create-post.dto';
import { ListPostsQueryDTO } from './dtos/list-posts-query.dto';

@Injectable()
export class PostService implements PostServiceInterface {
	private readonly logger: Logger = new Logger(PostService.name);

	constructor(
		@Inject(DatabaseProviderEnum.POST_REPOSITORY)
		private readonly postRepository: PostRepositoryInterface,
		@Inject(DatabaseProviderEnum.USER_REPOSITORY)
		private readonly userRepository: UserRepositoryInterface,
	) {}

	public async createPost(
		userId: string,
		data: CreatePostDTO,
	): Promise<PostDTO> {
		this.logger.log(
			`Create Post - userId: ${userId} - data: ${JSON.stringify(data)}`,
		);

		const newPost = new this.postRepository.model({
			content: data.content,
			...(data.replyTo && {
				replyTo: new Types.ObjectId(data.replyTo),
			}),
			postedBy: new Types.ObjectId(userId),
		});

		await newPost.save();
		await newPost.populate([
			'postedBy',
			{ path: 'replyTo' },
			{
				path: 'replyTo',
				populate: {
					path: 'postedBy',
				},
			},
		]);
		return newPost;
	}

	public async listPosts(query: ListPostsQueryDTO): Promise<PostDTO[]> {
		this.logger.log(`List Posts - query: ${JSON.stringify(query)}`);

		const { filters, limit, skip } = query;

		return await this.postRepository.model
			.find(filters ?? {})
			.populate('postedBy')
			.populate('retweetData')
			.populate({
				path: 'retweetData',
				populate: {
					path: 'postedBy',
				},
			})
			.populate('replyTo')
			.populate({
				path: 'replyTo',
				populate: {
					path: 'postedBy',
				},
			})
			.limit(limit ?? 10)
			.skip(skip ? skip * (limit ?? 10) : 0)
			.sort({ createdAt: -1 });
	}

	public async getPostById(postId: string): Promise<GetPostByIdResponse> {
		this.logger.log(`Get Post By Id - postId: ${postId}`);

		const post = await this.postRepository.model
			.findById(new Types.ObjectId(postId))
			.populate('postedBy')
			.populate('replyTo')
			.populate({
				path: 'replyTo',
				populate: {
					path: 'postedBy',
				},
			})
			.populate('retweetData')
			.populate({
				path: 'retweetData',
				populate: {
					path: 'postedBy',
				},
			});
		if (!post) {
			throw new BadRequestException('Post not found');
		}

		const results: GetPostByIdResponse = {
			post,
		};
		if (post.replyTo) {
			// if is replyTo, try to populate next replyTo if it exists
			results.replyTo = await (post.replyTo as PostDocument).populate([
				'replyTo',
				{
					path: 'replyTo',
					populate: {
						path: 'postedBy',
					},
				},
			]);
		}

		const query: ListPostsQueryDTO = {
			filters: {
				replyTo: new Types.ObjectId(postId),
			},
		};
		results.replies = await this.listPosts(query);

		return results;
	}

	public async likeDislikePost(
		userId: string,
		postId: string,
		isLiked: boolean,
	): Promise<PostDTO> {
		this.logger.log(
			`LikeDislike Post - userId: ${userId} - postId: ${postId} - isLiked: ${isLiked}`,
		);

		const dbAction = isLiked ? '$pull' : '$addToSet';

		// insert user like
		const updatedUser = await this.userRepository.model.findOneAndUpdate(
			{
				_id: new Types.ObjectId(userId),
			},
			{
				[dbAction]: {
					likes: new Types.ObjectId(postId),
				},
			},
			{
				new: true,
			},
		);
		if (!updatedUser) {
			throw new BadRequestException('User not found');
		}

		const updatedPost = await this.postRepository.model.findOneAndUpdate(
			{
				_id: new Types.ObjectId(postId),
			},
			{
				[dbAction]: {
					likes: new Types.ObjectId(userId),
				},
			},
			{
				new: true,
			},
		);
		if (!updatedPost) {
			throw new BadRequestException('Post not found');
		}

		return updatedPost;
	}

	public async retweetPost(userId: string, postId: string): Promise<PostDTO> {
		this.logger.log(`Retweet Post - userId: ${userId} - postId: ${postId}`);

		const deletedPost = await this.postRepository.model.findOneAndDelete({
			postedBy: new Types.ObjectId(userId),
			retweetData: new Types.ObjectId(postId),
		});

		const dbAction = !!deletedPost ? '$pull' : '$addToSet';

		let repost = deletedPost;
		if (!repost) {
			repost = new this.postRepository.model({
				postedBy: new Types.ObjectId(userId),
				retweetData: new Types.ObjectId(postId),
			});
			await repost.save();
		}

		// insert user retweet
		const updatedUser = await this.userRepository.model.findByIdAndUpdate(
			new Types.ObjectId(userId),
			{
				[dbAction]: {
					retweets: new Types.ObjectId(repost._id),
				},
			},
			{
				new: true,
			},
		);
		if (!updatedUser) {
			throw new BadRequestException('User not found');
		}

		// insert post user retweet
		const updatedPost = await this.postRepository.model.findByIdAndUpdate(
			new Types.ObjectId(postId),
			{
				[dbAction]: {
					retweetUsers: new Types.ObjectId(userId),
				},
			},
			{
				new: true,
			},
		);
		if (!updatedPost) {
			throw new BadRequestException('Post not found');
		}

		return updatedPost;
	}

	public async deletePost(userId: string, postId: string): Promise<PostDTO> {
		this.logger.log(`Retweet Post - userId: ${userId} - postId: ${postId}`);

		const deletedPost = await this.postRepository.model.findOneAndDelete({
			_id: new Types.ObjectId(postId),
			postedBy: new Types.ObjectId(userId),
		});

		if (!deletedPost) {
			throw new BadRequestException('Post not found');
		}

		return deletedPost;
	}
}
