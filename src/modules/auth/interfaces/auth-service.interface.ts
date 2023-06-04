// INTERFACES
import { DoLoginInterface } from './do-login.interface';
import { RegisterInterface } from './register.interface';

export interface AuthServiceInterface {
	register(data: RegisterInterface): Promise<void>;
	doLogin(data: DoLoginInterface): Promise<{ token: string }>;
}
