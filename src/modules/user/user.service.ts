import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';

// ENUMS
import { DatabaseProviderEnum } from '@/modules/database/enums/database-provider.enum';
import { NotificationTypeEnum } from '@/common/enums/notification.enum';
import { NotificationProviderEnum } from '@/modules/notification/enums/notification-provider.enum';

// INTERFACES
import { UserServiceInterface } from './interfaces/user-service.interface';
import { UserRepositoryInterface } from '@/modules/database/interfaces/user-repository.interface';
import { NotificationServiceInterface } from '@/modules/notification/interfaces/notification-service.interface';

// DTOS
import { UserDTO } from './dtos/user.dto';

@Injectable()
export class UserService implements UserServiceInterface {
	private readonly logger: Logger = new Logger(UserService.name);

	constructor(
		@Inject(DatabaseProviderEnum.USER_REPOSITORY)
		private readonly userRepository: UserRepositoryInterface,
		@Inject(NotificationProviderEnum.NOTIFICATION_SERVICE)
		private readonly notificationService: NotificationServiceInterface,
	) {}

	public async listUsers(query): Promise<UserDTO[]> {
		this.logger.log(`List Users - query: ${JSON.stringify(query)}`);

		if (query.userSearching) {
			query['_id'] = {
				$ne: query.userSearching,
			};
			delete query.userSearching;
		}

		query['username'] = {
			$regex: new RegExp('.*' + query.username.toLowerCase() + '.*', 'i'),
		};

		return this.userRepository.model.find(query).populate('retweets');
	}

	public async getById(userId: string): Promise<UserDTO> {
		this.logger.log(`Get By ID - userId: ${userId}`);

		const user = await this.userRepository.model.findById(userId);
		if (!user) {
			throw new BadRequestException('User not found');
		}
		return user;
	}

	public async getByUsername(username: string): Promise<UserDTO> {
		this.logger.log(`Get By Username - username: ${username}`);

		const user = await this.userRepository.model.findOne({
			username,
		});

		if (!user) {
			throw new BadRequestException('User not found');
		}

		return user;
	}

	public async followUser(
		userId: string,
		userToFollowId: string,
	): Promise<UserDTO> {
		this.logger.log(
			`Follow User - userId: ${userId} - userToFollowId: ${userToFollowId}`,
		);

		const user = await this.userRepository.model.findById(userToFollowId);
		if (!user) {
			throw new BadRequestException('User not found');
		}

		const isFollowing = user.followers.filter(
			(u) => (u as unknown as Types.ObjectId).toString() === userId,
		)[0];

		const dbAction = isFollowing ? '$pull' : '$addToSet';

		const [updatedUser, updatedFollowingUser] = await Promise.all([
			this.userRepository.model.findByIdAndUpdate(
				userId,
				{
					[dbAction]: {
						following: new Types.ObjectId(userToFollowId),
					},
				},
				{
					new: true,
				},
			),
			this.userRepository.model.findByIdAndUpdate(
				userToFollowId,
				{
					[dbAction]: {
						followers: new Types.ObjectId(userId),
					},
				},
				{
					new: true,
				},
			),
		]);
		if (!updatedUser || !updatedFollowingUser) {
			throw new BadRequestException(
				'Fail while follow user. User not found',
			);
		}

		if (!isFollowing) {
			this.notificationService.createNotification({
				userTo: new Types.ObjectId(userToFollowId),
				userFrom: new Types.ObjectId(userId),
				notificationType: NotificationTypeEnum.FOLLOW,
				entityId: new Types.ObjectId(userId),
			});
		}

		return updatedUser;
	}

	public async listUserFollowings(username: string): Promise<UserDTO> {
		this.logger.log(`List User Followings - username: ${username}`);

		const user = await this.userRepository.model
			.find({
				username,
			})
			.populate({ path: 'following', justOne: false });

		if (!user?.length) {
			throw new BadRequestException('User not found');
		}

		return user[0];
	}

	public async listUserFollowers(username: string): Promise<UserDTO> {
		this.logger.log(`List User Followings - username: ${username}`);

		const user = await this.userRepository.model
			.find({
				username,
			})
			.populate({ path: 'followers', justOne: false });

		if (!user?.length) {
			throw new BadRequestException('User not found');
		}

		return user[0];
	}

	// public async getByUsername(username: string): Promise<UserDTO[]> {
	// 	this.logger.log(`Get By Username - username: ${username}`);

	// 	const users = await this.userRepository.model.find({
	// 		// _id: {
	// 		// 	$ne: userId,
	// 		// },
	// 		username: { $regex: '.*' + username + '.*' },
	// 	});

	// 	return users;
	// }
}
