import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDTO {
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	public content: string;

	@IsString()
	@IsOptional()
	public replyTo?: string;
}
