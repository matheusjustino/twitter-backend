// DTOS
import { UserDTO } from '../dtos/user.dto';

export interface UserServiceInterface {
	getById(userId: string): Promise<UserDTO>;
	getByUsername(userId: string, username: string): Promise<UserDTO[]>;
}
