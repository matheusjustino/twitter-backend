import {
	Injectable,
	UnauthorizedException,
	Logger,
	Inject,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// ENUMS
import { DatabaseProviderEnum } from '@/modules/database/enums/database-provider.enum';

// INTERFACES
import { JwtStrategyInterface } from './interfaces/jwt-strategy.interface';
import { TokenLoginDataInterface } from '@/common/interfaces/token-login-data.interface';
import { UserRepositoryInterface } from '@/modules/database/interfaces/user-repository.interface';

@Injectable()
export class JwtStrategy
	extends PassportStrategy(Strategy, 'jwt')
	implements JwtStrategyInterface
{
	private readonly logger: Logger = new Logger(JwtStrategy.name);

	constructor(
		@Inject(DatabaseProviderEnum.USER_REPOSITORY)
		private readonly userRepository: UserRepositoryInterface,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.SECRET,
		});
	}

	public async validate(
		payload: TokenLoginDataInterface,
	): Promise<TokenLoginDataInterface> {
		try {
			const user = await this.userRepository.model.findById(payload.id);
			if (!user) {
				throw new UnauthorizedException('User not found');
			}

			return payload;
		} catch (error) {
			this.logger.error(error);
			throw new UnauthorizedException('Invalid token');
		}
	}
}
