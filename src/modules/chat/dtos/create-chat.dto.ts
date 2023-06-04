import { IsArray, ArrayMinSize, IsNotEmpty, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateChatDTO {
	@IsArray()
	@ArrayMinSize(2)
	public users: string[];

	@IsNotEmpty()
	@IsBoolean()
	@Transform(({ value }: { value: string }) =>
		['true', 'false'].includes(value.toLowerCase()),
	)
	public isGroupChat: boolean;
}
