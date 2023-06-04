import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import {
	ExpressAdapter,
	NestExpressApplication,
} from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import { json } from 'express';

import { AppModule } from './app.module';
import { AllExceptionFilter } from './modules/app-config/filters/all-exception.filter';
import { SocketAdapter } from './modules/socket-io/socket-adapter';

async function bootstrap() {
	const PORT = process.env.PORT || 8080;
	const app = await NestFactory.create<NestExpressApplication>(
		AppModule,
		new ExpressAdapter(),
	);

	app.enableCors({
		origin: '*',
	});
	app.use(helmet());
	app.use(compression());
	app.use(json({ limit: '50mb' }));
	app.setGlobalPrefix('api');
	app.useGlobalFilters(new AllExceptionFilter());
	app.useWebSocketAdapter(new SocketAdapter(app));

	await app.listen(PORT, () =>
		Logger.log(`APP is running on port: ${PORT}`, 'BOOTSTRAP'),
	);

	app.enableShutdownHooks();
}
bootstrap();
