import { Module } from '@nestjs/common';

import { PostController } from './post.controller';
import { PostProvider } from './post.provider';

@Module({
	controllers: [PostController],
	providers: PostProvider,
	exports: PostProvider,
})
export class PostModule {}
