import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// INTERFACES
import { TokenLoginDataInterface } from '@/common/interfaces/token-login-data.interface';

// DTOS
import { MessageDTO } from '../message/dtos/message.dto';
import { ChatDTO } from '../chat/dtos/chat.dto';

@WebSocketGateway()
export class SocketGateway {
	private readonly logger: Logger = new Logger(SocketGateway.name);

	@WebSocketServer()
	public server: Server;

	public handleConnection(client: Socket): void {
		this.logger.log(`Client connected: ${client.id}`);

		client.on('setup', async (userData: TokenLoginDataInterface) => {
			await client.join(userData.id);
			client.emit('connected');
		});

		client.on(
			'join room',
			async ({ room, userId }: { room: string; userId: string }) => {
				this.logger.log(
					`User (${userId}) from client (${client.id}) joined the room ${room}`,
				);
				return await client.join(room);
			},
		);

		client.on(
			'leave room',
			async ({ room, userId }: { room: string; userId: string }) => {
				await client.leave(room);
				// await client.leave(userId);
				this.logger.log(
					`User (${userId}) from client (${client.id}) left the room ${room}`,
				);
			},
		);

		client.on(
			'typing',
			async ({ room, userId }: { room: string; userId: string }) => {
				client.in(room).emit('typing');
			},
		);

		client.on(
			'stop typing',
			async ({ room, userId }: { room: string; userId: string }) => {
				client.in(room).emit('stop typing');
			},
		);

		client.on('new message', async (newMessage: MessageDTO) => {
			const chat = newMessage.chat;

			if (!chat?.users?.length) {
				this.logger.warn('Chat.users not defined');
				return;
			}

			chat.users.forEach(async (user) => {
				client
					.to(user._id ?? user.id)
					.emit('update last message chat', newMessage);

				if (user._id === newMessage.sender._id) {
					return;
				}

				client
					.in(user._id ?? user.id)
					.emit('message received', newMessage);
			});
			return;
		});

		client.on(
			'new chat',
			async ({
				newChat,
				participants,
			}: {
				newChat: ChatDTO;
				participants: string[];
			}) => {
				client.to(participants).emit('new chat received', newChat);
			},
		);
	}

	public handleDisconnect(client: Socket): void {
		this.logger.log(`Cliente desconectado: ${client.id}`);
	}
}
