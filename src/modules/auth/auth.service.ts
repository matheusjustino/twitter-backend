import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { compareSync } from 'bcrypt';

// ENUMS
import { AuthProviderEnum } from './enums/auth-provider.enum';
import { DatabaseProviderEnum } from '@/modules/database/enums/database-provider.enum';

// INTERFACES
import { RegisterInterface } from './interfaces/register.interface';
import { DoLoginInterface } from './interfaces/do-login.interface';
import { AuthServiceInterface } from './interfaces/auth-service.interface';
import { JwtServiceInterface } from './interfaces/jwt-service.interface';
import { UserRepositoryInterface } from '@/modules/database/interfaces/user-repository.interface';
import { TokenLoginDataInterface } from '@/common/interfaces/token-login-data.interface';

@Injectable()
export class AuthService implements AuthServiceInterface {
	private readonly logger: Logger = new Logger(AuthService.name);

	constructor(
		@Inject(DatabaseProviderEnum.USER_REPOSITORY)
		private readonly userRepository: UserRepositoryInterface,
		@Inject(AuthProviderEnum.JWT_SERVICE)
		private readonly jwtService: JwtServiceInterface,
	) {}

	public async register(data: RegisterInterface): Promise<void> {
		this.logger.log(`Create User - data: ${JSON.stringify(data)}`);

		const alreadyExists = await this.userRepository.model.findOne({
			$or: [
				{
					username: data.username,
				},
				{
					email: data.email,
				},
			],
		});
		if (alreadyExists) {
			throw new BadRequestException('Username or email already exists');
		}

		const newUser = new this.userRepository.model(data);
		await newUser.save();
	}

	public async doLogin(data: DoLoginInterface): Promise<{ token: string }> {
		this.logger.log(`Do Login - data: ${JSON.stringify(data)}`);

		const user = await this.userRepository.model
			.findOne({
				email: data.email,
			})
			.select(['id', 'email', 'password', 'username', 'profilePic']);

		if (!user) {
			this.logger.error('user not found');
			throw new BadRequestException('Invalid credentials');
		}

		if (!compareSync(data.password, user.password)) {
			throw new BadRequestException('Invalid credentials');
		}

		return {
			token: this.jwtService.sign(
				{
					id: user.id,
					email: user.email,
					username: user.username,
				} as TokenLoginDataInterface,
				{
					secret: process.env.SECRET,
					expiresIn: '12h',
				},
			),
		};
	}
}
