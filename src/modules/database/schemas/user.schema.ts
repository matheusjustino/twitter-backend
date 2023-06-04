import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// DTOS
import { UserDTO } from '@/modules/user/dtos/user.dto';

// SCHEMAS
import { BaseSchema } from './base.schema';
import { Post } from './post.schema';

@Schema({ timestamps: true })
export class User extends BaseSchema implements UserDTO {
	@Prop({ type: String, unique: true, trim: true })
	public username: string;

	@Prop({ type: String, unique: true, trim: true })
	public email: string;

	@Prop({ type: String, trim: true, select: false })
	public password: string;

	@Prop({ type: String, trim: true, default: '/images/profilePic.png' })
	public profilePic: string;

	@Prop({ ref: Post.name, type: Types.ObjectId, default: [] })
	public likes: Post[];

	@Prop({ ref: Post.name, type: Types.ObjectId, default: [] })
	public retweets: Post[];
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
