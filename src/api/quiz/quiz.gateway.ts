import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // You can add more event handlers here to handle various WebSocket events

  sendQuizCreatedEvent(quizData: any) {
    this.server.emit('quizCreated', quizData);
  }

  sendLiveParticipationEvent(participationData: any) {
    this.server.emit('liveParticipation', participationData);
  }

  sendScoreUpdateEvent(scoreData: any) {
    this.server.emit('scoreUpdate', scoreData);
  }
}
