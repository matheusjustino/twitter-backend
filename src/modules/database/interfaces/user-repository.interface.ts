import { Model } from 'mongoose';

// SCHEMAS
import { UserDocument } from '../schemas/user.schema';

export interface UserRepositoryInterface {
	model: Model<UserDocument>;
}
