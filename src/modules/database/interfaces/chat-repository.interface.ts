import { Model } from 'mongoose';

// SCHEMAS
import { ChatDocument } from '../schemas/chat.schema';

export interface ChatRepositoryInterface {
	model: Model<ChatDocument>;
}
