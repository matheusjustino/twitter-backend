import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// PROVIDERS
import { SchemaProvider } from './schema.provider';
import { DatabaseProvider } from './database.provider';

@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: () => ({
				uri: process.env.MONGO_DB_URI,
				useNewUrlParser: true,
				useUnifiedTopology: true,
			}),
		}),
		MongooseModule.forFeatureAsync(SchemaProvider),
	],
	providers: DatabaseProvider,
	exports: DatabaseProvider,
})
export class DatabaseModule {}
