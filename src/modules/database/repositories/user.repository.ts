import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// INTERFACES
import { UserRepositoryInterface } from '../interfaces/user-repository.interface';

// SCHEMAS
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
	constructor(
		@InjectModel(User.name)
		private readonly UserModel: Model<UserDocument>,
	) {}

	public get model(): Model<UserDocument> {
		return this.UserModel;
	}
}
