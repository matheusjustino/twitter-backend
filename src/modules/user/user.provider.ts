import { Provider } from '@nestjs/common';

// ENUMS
import { UserProviderEnum } from './enums/user-provider.enum';

// SERVICES
import { UserService } from './user.service';

export const UserProvider: Provider[] = [
	{
		provide: UserProviderEnum.USER_SERVICE,
		useClass: UserService,
	},
];
