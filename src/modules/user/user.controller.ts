import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';

// DECORATORS
import { CurrentUser } from '@/modules/auth/decorators/user.decorator';

// GUARDS
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';

// ENUMS
import { UserProviderEnum } from './enums/user-provider.enum';

// INTERFACES
import { UserServiceInterface } from './interfaces/user-service.interface';
import { TokenLoginDataInterface } from '@/common/interfaces/token-login-data.interface';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
	constructor(
		@Inject(UserProviderEnum.USER_SERVICE)
		private readonly userService: UserServiceInterface,
	) {}

	@Get('me')
	public async me(@CurrentUser() user: TokenLoginDataInterface) {
		return this.userService.getById(user.id);
	}
	@Get(':id')
	public async getUserById(@Param('id') id: string) {
		return this.userService.getById(id);
	}

	@Get('/username/:username')
	public async getUserByUsername(
		@CurrentUser() user: TokenLoginDataInterface,
		@Param('username') username: string,
	) {
		return this.userService.getByUsername(user.id, username);
	}
}
