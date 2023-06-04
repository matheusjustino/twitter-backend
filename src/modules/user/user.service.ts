import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';

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

	public async getByUsername(username: string): Promise<UserDTO[]> {
		this.logger.log(`Get By Username - username: ${username}`);

		const users = await this.userRepository.model.find({
			// _id: {
			// 	$ne: userId,
			// },
			username: { $regex: '.*' + username + '.*' },
		});

		return users;
	}
}
