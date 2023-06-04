import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class LikePostDTO {
	@IsNotEmpty()
	@IsBoolean()
	@Transform(({ value }) =>
		['true', 'false'].includes(`${value}`.toLowerCase()),
	)
	public isLiked = false;
}
