import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients: Set<string> = new Set();

  handleConnection(client: Socket, ...args: any[]) {
    const clientId = client.id;
    this.connectedClients.add(clientId);
    console.log(`Client connected: ${clientId}, ${args}`);
  }

  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.connectedClients.delete(clientId);
    console.log(`Client disconnected: ${clientId}`);
  }
  sendEventToClients(event: string, data: any): void {
    this.server.emit(event, data);
  }

  // sendQuizCreatedEvent(quizData: any) {
  //   this.server.emit('quizCreated', quizData);
  // }

  // sendLiveParticipationEvent(participationData: any) {
  //   this.server.emit('liveParticipation', participationData);
  // }

  // sendScoreUpdateEvent(scoreData: any) {
  //   this.server.emit('scoreUpdate', scoreData);
  // }
}
