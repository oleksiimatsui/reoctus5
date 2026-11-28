import { Room, Client, CloseCode } from "colyseus";
import { MyRoomState, Player } from "../../../shared/schema/MyRoomState.js";

export class MyRoom extends Room<{ state: MyRoomState }> {
  maxClients = 4;
  state = new MyRoomState();

  messages = {
    move: (client: Client, message: { x: number; y: number; z: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) {
        console.error("Player not found", client.sessionId);
        return;
      }
      player.x = message.x;
      player.y = message.y;
      player.z = message.z;
    },
  };

  onJoin(client: Client, options: any) {
    this.state.players.set(client.sessionId, new Player());
    this.broadcast("chat", `${client.sessionId} joined.`);
  }

  onLeave(client: Client, code: CloseCode) {
    this.state.players.delete(client.sessionId);
    this.broadcast("chat", `${client.sessionId} left.`);
  }
}
