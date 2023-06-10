import { IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindChatsQueryDTO {
	@IsNotEmpty()
	@IsNumber()
	@Transform(({ value }) => Number(value ?? 10))
	public limit = 10;

	@IsNotEmpty()
	@IsNumber()
	@Transform(({ value }) => Number(value ?? 0))
	public skip = 0;

	public filters = {};
}
