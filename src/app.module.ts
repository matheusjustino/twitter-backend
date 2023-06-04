import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

// MODULES
import { AppConfigModule } from './modules/app-config/app-config.module';
import { DatabaseModule } from './modules/database/database.module';
import { SocketIoModule } from './modules/socket-io/socket-io.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';

@Module({
	imports: [
		AppConfigModule,
		DatabaseModule,
		SocketIoModule,
		AuthModule,
		UserModule,
		PostModule,
	],
	controllers: [AppController],
})
export class AppModule {}
