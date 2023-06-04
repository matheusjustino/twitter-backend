import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';

@Global()
@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: process.env.SECRET,
			signOptions: {
				expiresIn: '12h',
			},
		}),
	],
	controllers: [AuthController],
	providers: AuthProvider,
	exports: AuthProvider,
})
export class AuthModule {}
