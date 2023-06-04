import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';

// ENUMS
import { DatabaseProviderEnum } from '../database/enums/database-provider.enum';

// INTERFACES
import { PostServiceInterface } from './intefaces/post-service.interface';
import { PostRepositoryInterface } from '../database/interfaces/post-repository.interface';
import { UserRepositoryInterface } from '../database/interfaces/user-repository.interface';

// DTOS
import { PostDTO } from './dtos/post.dto';
import { CreatePostDTO } from './dtos/create-post.dto';
import { ListPostsQueryDTO } from './dtos/list-posts-query.dto';
import { Types } from 'mongoose';

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
			...data,
			postedBy: userId,
		});

		await newPost.save();
		await newPost.populate('postedBy');
		return newPost;
	}

	public async listPosts(query: ListPostsQueryDTO): Promise<PostDTO[]> {
		this.logger.log(`List Posts - query: ${JSON.stringify(query)}`);

		return this.postRepository.model
			.find()
			.populate('postedBy')
			.populate('retweetData')
			.populate({
				path: 'retweetData',
				populate: {
					path: 'postedBy',
				},
			})
			.limit(query.limit)
			.skip(query.skip * query.limit)
			.sort('-createdAt');
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
				postedBy: userId,
				retweetData: postId,
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
}
