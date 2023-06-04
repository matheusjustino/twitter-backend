import { Model } from 'mongoose';

// SCHEMAS
import { PostDocument } from '../schemas/post.schema';

export interface PostRepositoryInterface {
	model: Model<PostDocument>;
}
