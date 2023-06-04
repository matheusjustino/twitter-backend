import { Provider } from '@nestjs/common';

// ENUMS
import { DatabaseProviderEnum } from './enums/database-provider.enum';

// REPOSITORIES
import { UserRepository } from './repositories/user.repository';
import { ChatRepository } from './repositories/chat.repository';
import { MessageRepository } from './repositories/message.repository';
import { PostRepository } from './repositories/post.repository';

export const DatabaseProvider: Provider[] = [
	{
		provide: DatabaseProviderEnum.USER_REPOSITORY,
		useClass: UserRepository,
	},
	{
		provide: DatabaseProviderEnum.CHAT_REPOSITORY,
		useClass: ChatRepository,
	},
	{
		provide: DatabaseProviderEnum.MESSAGE_REPOSITORY,
		useClass: MessageRepository,
	},
	{
		provide: DatabaseProviderEnum.POST_REPOSITORY,
		useClass: PostRepository,
	},
];
