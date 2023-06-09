import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListPostsQueryDTO {
	public filters? = {} as any;

	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => Number(value ?? 10))
	public limit? = 10;

	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => Number(value ?? 0))
	public skip? = 0;
}
