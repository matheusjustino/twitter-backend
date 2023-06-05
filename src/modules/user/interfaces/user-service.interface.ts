// DTOS
import { UserDTO } from '../dtos/user.dto';

export interface UserServiceInterface {
	listUsers(query): Promise<UserDTO[]>;
	getById(userId: string): Promise<UserDTO>;
	getByUsername(username: string): Promise<UserDTO>;
	followUser(userId: string, userToFollowId: string): Promise<UserDTO>;
}
