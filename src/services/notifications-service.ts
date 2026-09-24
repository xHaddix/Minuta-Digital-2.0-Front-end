import { io, type Socket } from "socket.io-client";
import { APP_CONFIG } from "../config/app";

export const connectNotifications = (accessToken: string): Socket =>
  io(`${APP_CONFIG.SOCKET_BASE_URL}/notifications`, {
    auth: { token: accessToken },
    transports: ["websocket"],
  });
