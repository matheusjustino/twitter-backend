import { Provider } from '@nestjs/common';

// ENUMS
import { PostProviderEnum } from './enums/post-provider.enum';

// SERVICES
import { PostService } from './post.service';

export const PostProvider: Provider[] = [
	{
		provide: PostProviderEnum.POST_SERVICE,
		useClass: PostService,
	},
];
