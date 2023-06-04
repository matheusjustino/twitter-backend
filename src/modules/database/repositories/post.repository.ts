import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// INTERFACES
import { PostRepositoryInterface } from '../interfaces/post-repository.interface';

// SCHEMAS
import { Post, PostDocument } from '../schemas/post.schema';

@Injectable()
export class PostRepository implements PostRepositoryInterface {
	constructor(
		@InjectModel(Post.name)
		private readonly PostModel: Model<PostDocument>,
	) {}

	public get model(): Model<PostDocument> {
		return this.PostModel;
	}
}
