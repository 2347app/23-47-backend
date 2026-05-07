import { Server } from "socket.io";
import { AuthedSocket } from "../io";
import { getOnlineUserIds } from "../../services/presence";

export function registerPresenceHandlers(_io: Server, socket: AuthedSocket): void {
  socket.on("presence:list", async (_payload, ack?: (res: any) => void) => {
    const online = await getOnlineUserIds();
    ack?.({ online });
  });

  socket.on("presence:ping", async () => {
    socket.emit("presence:pong", { at: Date.now() });
  });
}
