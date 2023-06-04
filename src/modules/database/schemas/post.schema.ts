import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// DTOS
import { PostDTO } from '@/modules/post/dtos/post.dto';

// SCHEMAS
import { BaseSchema } from './base.schema';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Post extends BaseSchema implements PostDTO {
	@Prop({ type: String, trim: true })
	public content: string;

	@Prop({ ref: User?.name ?? 'User', type: Types.ObjectId })
	public postedBy: User;

	@Prop({ ref: User?.name ?? 'User', type: Types.ObjectId, default: [] })
	public likes: User[];

	@Prop({ ref: User?.name ?? 'User', type: Types.ObjectId, default: [] })
	public retweetUsers: User[];

	@Prop({ ref: Post.name, type: Types.ObjectId, nullable: true })
	public retweetData: Post;

	@Prop({ type: Boolean, default: false })
	public pinned: boolean;
}

export type PostDocument = Post & Document;
export const PostSchema = SchemaFactory.createForClass(Post);
