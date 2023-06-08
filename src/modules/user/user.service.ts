import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';

// ENUMS
import { DatabaseProviderEnum } from '@/modules/database/enums/database-provider.enum';

// INTERFACES
import { UserRepositoryInterface } from '@/modules/database/interfaces/user-repository.interface';
import { UserServiceInterface } from './interfaces/user-service.interface';

// DTOS
import { UserDTO } from './dtos/user.dto';

@Injectable()
export class UserService implements UserServiceInterface {
	private readonly logger: Logger = new Logger(UserService.name);

	constructor(
		@Inject(DatabaseProviderEnum.USER_REPOSITORY)
		private readonly userRepository: UserRepositoryInterface,
	) {}

	public async listUsers(query): Promise<UserDTO[]> {
		this.logger.log(`List Users - query: ${JSON.stringify(query)}`);

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
