import { PostDocument } from './../database/schemas/post.schema';
import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';

// ENUMS
import { DatabaseProviderEnum } from '@/modules/database/enums/database-provider.enum';
import { NotificationProviderEnum } from '@/modules/notification/enums/notification-provider.enum';

// INTERFACES
import { PostServiceInterface } from './intefaces/post-service.interface';
import { GetPostByIdResponse } from './intefaces/get-post-by-id-response.interface';
import { PostRepositoryInterface } from '@/modules/database/interfaces/post-repository.interface';
import { UserRepositoryInterface } from '@/modules/database/interfaces/user-repository.interface';
import { NotificationServiceInterface } from '@/modules/notification/interfaces/notification-service.interface';

// DTOS
import { PostDTO } from './dtos/post.dto';
import { CreatePostDTO } from './dtos/create-post.dto';
import { ListPostsQueryDTO } from './dtos/list-posts-query.dto';
import { NotificationTypeEnum } from '@/common/enums/notification.enum';

@Injectable()
export class PostService implements PostServiceInterface {
	private readonly logger: Logger = new Logger(PostService.name);

	constructor(
		@Inject(DatabaseProviderEnum.POST_REPOSITORY)
		private readonly postRepository: PostRepositoryInterface,
		@Inject(DatabaseProviderEnum.USER_REPOSITORY)
		private readonly userRepository: UserRepositoryInterface,
		@Inject(NotificationProviderEnum.NOTIFICATION_SERVICE)
		private readonly notificationService: NotificationServiceInterface,
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

		if (data.replyTo) {
			this.notificationService.createNotification({
				userTo: new Types.ObjectId(newPost.postedBy.id),
				userFrom: new Types.ObjectId(userId),
				notificationType: NotificationTypeEnum.REPLY,
				entityId: new Types.ObjectId(newPost.id),
			});
		}

		return newPost;
	}

	public async listPosts(query: ListPostsQueryDTO): Promise<PostDTO[]> {
		this.logger.log(`List Posts - query: ${JSON.stringify(query)}`);

		if (query.filters.userId) {
			return this.listFollowingPosts(query);
		}

		const { filters, limit, skip } = query;
		const pinned = filters.pinned;
		delete filters.pinned;

		if (filters.isReply) {
			const isReply = filters.isReply.toLowerCase() == 'true';
			filters.replyTo = { $exists: isReply };
			delete filters.isReply;
		}
		if (filters.content) {
			filters.content = {
				$regex: '.*' + filters.content + '.*',
			};
		}

		return this.postRepository.model
			.find({
				...filters,
				...(filters.postedBy && {
					postedBy: new Types.ObjectId(filters.postedBy),
				}),
				...(filters.retweetedBy && {
					retweetData: new Types.ObjectId(filters.retweetedBy),
				}),
			})
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
			.limit(Number(limit ?? 10))
			.skip(Number(skip ?? 0))
			.sort({
				...(pinned && { pinned: -1 }),
				createdAt: -1,
			});
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

	public async pinPost(
		userId: string,
		postId: string,
		pinned: boolean,
	): Promise<PostDTO> {
		this.logger.log(
			`Pin Post - userId: ${userId} - postId: ${postId} - pinned: ${pinned}`,
		);

		if (pinned) {
			const alreadyPinned = await this.postRepository.model.findOne({
				postedBy: new Types.ObjectId(userId),
				pinned: true,
			});

			if (alreadyPinned) {
				await this.postRepository.model.updateOne(
					{
						_id: alreadyPinned.id,
					},
					{
						$set: {
							pinned: false,
						},
					},
				);
			}
		}

		const updatedPost = await this.postRepository.model.findOneAndUpdate(
			{
				_id: new Types.ObjectId(postId),
				postedBy: new Types.ObjectId(userId),
			},
			{
				$set: {
					pinned,
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

		const updatedPost = await this.postRepository.model
			.findOneAndUpdate(
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
					populate: ['postedBy', 'replyTo', 'retweetData'],
				},
			)
			.populate({
				path: 'replyTo',
				populate: {
					path: 'postedBy',
				},
			})
			.populate({
				path: 'retweetData',
				populate: {
					path: 'postedBy',
				},
			});
		if (!updatedPost) {
			throw new BadRequestException('Post not found');
		}

		if (!isLiked) {
			this.notificationService.createNotification({
				userTo: new Types.ObjectId(updatedPost.postedBy.id),
				userFrom: new Types.ObjectId(userId),
				notificationType: NotificationTypeEnum.LIKE,
				entityId: new Types.ObjectId(updatedPost.id),
			});
		}

		return updatedPost;
	}

	public async retweetPost(userId: string, postId: string): Promise<PostDTO> {
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
				populate: [
					{
						path: 'postedBy',
						justOne: true,
					},
					{
						path: 'retweetData',
						justOne: true,
					},
				],
				new: true,
			},
		);
		if (!updatedPost) {
			throw new BadRequestException('Post not found');
		}

		if (!deletedPost) {
			this.notificationService.createNotification({
				userTo: new Types.ObjectId(updatedPost.postedBy.id),
				userFrom: new Types.ObjectId(userId),
				notificationType: NotificationTypeEnum.RETWEET,
				entityId: updatedPost.id,
			});
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

	private async listFollowingPosts(
		query: ListPostsQueryDTO,
	): Promise<PostDTO[]> {
		this.logger.log(
			`List Following Posts - query: ${JSON.stringify(query)}`,
		);

		const { filters, limit, skip } = query;
		const pipeline: any = [
			{
				$lookup: {
					from: 'users',
					localField: 'postedBy',
					foreignField: '_id',
					as: 'postedBy',
				},
			},
			{
				$unwind: {
					path: '$postedBy',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'replyTo.postedBy',
					foreignField: '_id',
					as: 'replyTo.postedBy',
				},
			},
			{
				$unwind: {
					path: '$replyTo.postedBy',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$match: {
					'postedBy.followers': {
						$in: [new Types.ObjectId(filters.userId)],
					},
				},
			},
			{
				$lookup: {
					from: 'posts',
					localField: 'retweetData',
					foreignField: '_id',
					as: 'retweetData',
				},
			},
			{
				$unwind: {
					path: '$retweetData',
					includeArrayIndex: 'string',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'retweetData.postedBy',
					foreignField: '_id',
					as: 'retweetData.postedBy',
				},
			},
			{
				$unwind: {
					path: '$retweetData.postedBy',
					includeArrayIndex: 'string',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'posts',
					localField: 'replyTo',
					foreignField: '_id',
					as: 'replyTo',
				},
			},
			{
				$unwind: {
					path: '$replyTo',
					includeArrayIndex: 'string',
					preserveNullAndEmptyArrays: true,
				},
			},
			{ $sort: { createdAt: -1 } },
		];

		if (skip) {
			pipeline.push({ $skip: Number(skip ?? 0) });
		}

		if (limit) {
			pipeline.push({ $limit: Number(limit ?? 10) });
		}

		return this.postRepository.model
			.aggregate<PostDTO>(pipeline.flat())
			.exec();
	}
}
