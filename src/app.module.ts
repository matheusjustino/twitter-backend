import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AppController } from './app.controller';

// MIDDLEWARE
import { LoggerMiddleware } from './modules/app-config/middleware/logger.middleware';

// MODULES
import { AppConfigModule } from './modules/app-config/app-config.module';
import { DatabaseModule } from './modules/database/database.module';
import { SocketIoModule } from './modules/socket-io/socket-io.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ChatModule } from './modules/chat/chat.module';
import { MessageModule } from './modules/message/message.module';

@Module({
	imports: [
		AppConfigModule,
		DatabaseModule,
		SocketIoModule,
		AuthModule,
		UserModule,
		ChatModule,
		MessageModule,
		PostModule,
		NotificationModule,
	],
	controllers: [AppController],
})
export class AppModule implements NestModule {
	public configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes('*');
	}
}
