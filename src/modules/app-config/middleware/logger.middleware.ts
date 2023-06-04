import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	private readonly logger: Logger = new Logger(LoggerMiddleware.name);

	public use(req: Request, res: Response, next: NextFunction) {
		const { ip, method, originalUrl } = req;
		this.logger.log(`METHOD: ${method} - IP: ${ip} - URL: ${originalUrl}`);
		next();
	}
}
