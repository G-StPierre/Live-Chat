import WebSocket from 'ws';
import http, { IncomingMessage } from 'http';
import url from 'url';
import jwt from 'jsonwebtoken';
import 'dotenv/config'


let secret = process.env.SECRET;

// Create a mock HTTP server
const httpServer = http.createServer();
const port = 8080;
httpServer.listen(port);

const wss = new WebSocket.Server({ noServer: true });

httpServer.on('upgrade', (request: IncomingMessage, socket, head) => {
  const pathname = url.parse(request.url!).pathname;
  if (pathname === '/') {

    // Simulate successful connection
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    
    // Simulate failed connection
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  }
});

// Mock token verification function
const verifyToken = (token: string, callback: (err: Error | null, decoded?: any) => void) => {
  if (token === 'valid_token') {
    const decoded = jwt.decode(token);
    callback(null, decoded);
  } else {
    callback(new Error('Invalid token'));
  }
};

// Mock WebSocket message handling
wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  let wsUsername = '';

  const token = url.parse(req.url!, true).pathname?.split('/')[1];
  verifyToken(token!, (err, decoded) => {
    if (err) {
      ws.close();
    } else {
      console.log(decoded);
      wsUsername = decoded!;
      console.log(wsUsername);
    }
  });

  ws.on('message', (msg: WebSocket.Data) => {
    if (wsUsername !== '') {
      // Mock broadcast logic
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`${wsUsername}: ${msg}`);
        }
      });
    }
  });
});

// Mock test for WebSocket functionality
describe('WebSocket server', () => {
  let wsClient: WebSocket;

  beforeAll((done) => {
    // Create a WebSocket client
    const wsUrl = `ws://localhost:${port}`;
    wsClient = new WebSocket(wsUrl);
    wsClient.on('open', () => {
      done();
    });
  });

  afterAll(() => {
    // Close the WebSocket client connection
    if (wsClient.readyState === WebSocket.OPEN) {
      wsClient.close();
    }
  });

  test('should handle connection', (done) => {
    wsClient.on('message', (message) => {
      expect(message).toBe('TestUser: Hello');
      done();
    });

    // Send a message from the WebSocket client
    wsClient.send('Hello');
  });
});
