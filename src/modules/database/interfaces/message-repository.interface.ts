import { Model } from 'mongoose';

// SCHEMAS
import { MessageDocument } from '../schemas/message.schema';

export interface MessageRepositoryInterface {
	model: Model<MessageDocument>;
}
