import { Provider } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// ENUMS
import { AuthProviderEnum } from './enums/auth-provider.enum';

// SERVICES
import { AuthService } from './auth.service';

// STRATEGIES
import { JwtStrategy } from './jwt.strategy';

// GUARDS
import { JwtGuard } from './guards/jwt.guard';

export const AuthProvider: Provider[] = [
	{
		provide: AuthProviderEnum.AUTH_SERVICE,
		useClass: AuthService,
	},
	{
		provide: AuthProviderEnum.JWT_STRATEGY,
		useClass: JwtStrategy,
	},
	{
		provide: AuthProviderEnum.JWT_GUARD,
		useClass: JwtGuard,
	},
	{
		provide: AuthProviderEnum.JWT_SERVICE,
		useClass: JwtService,
	},
];
