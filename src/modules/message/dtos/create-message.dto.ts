import { IsOptional, IsString } from 'class-validator';

export class CreateMessageDTO {
	@IsString()
	@IsOptional()
	public senderId?: string;

	@IsString()
	public content: string;

	@IsString()
	public chatId: string;
}
