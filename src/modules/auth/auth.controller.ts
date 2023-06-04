import { Body, Controller, Inject, Post } from '@nestjs/common';

// ENUMS
import { AuthProviderEnum } from './enums/auth-provider.enum';

// INTERFACES
import { AuthServiceInterface } from './interfaces/auth-service.interface';
import { RegisterInterface } from './interfaces/register.interface';
import { DoLoginInterface } from './interfaces/do-login.interface';

@Controller('auth')
export class AuthController {
	constructor(
		@Inject(AuthProviderEnum.AUTH_SERVICE)
		private readonly authService: AuthServiceInterface,
	) {}

	@Post('register')
	public async register(@Body() body: RegisterInterface) {
		return this.authService.register(body);
	}

	@Post('login')
	public async doLogin(@Body() body: DoLoginInterface) {
		return this.authService.doLogin(body);
	}
}
