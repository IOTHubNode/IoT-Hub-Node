import type { Server as HttpServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import type { AuthService } from '../services/auth.service.js';
import type { HubEventBus } from '../services/event-bus.js';

export function attachWebSocketHub(options: {
  server: HttpServer;
  eventBus: HubEventBus;
  authService: AuthService;
}): { close: () => void } {
  const { server, eventBus, authService } = options;
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.pathname !== '/ws') {
      socket.destroy();
      return;
    }

    const token = url.searchParams.get('token') ?? '';
    const user = token.startsWith('ih_')
      ? authService.verifyApiKey(token)
      : authService.verifySessionToken(token);

    if (!user) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  const unsubscribe = eventBus.onMessage((message) => {
    const serialized = JSON.stringify(message);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serialized);
      }
    }
  });

  return {
    close: () => {
      unsubscribe();
      wss.close();
    },
  };
}
