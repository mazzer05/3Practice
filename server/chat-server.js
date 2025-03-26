const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({
    server,
    verifyClient: (info, callback) => {
      callback(true); // Разрешаем все соединения
    }
  });
const port = 4000;

// Хранение подключенных клиентов
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Новое подключение к чату');

    // Обработка сообщений от клиента
    ws.on('message', (message) => {
        console.log('Получено сообщение:', message.toString());
        
        // Рассылка сообщения всем подключенным клиентам
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    // Обработка закрытия соединения
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Подключение закрыто');
    });
});

server.listen(port, () => {
    console.log(`WebSocket сервер чата запущен на ws://localhost:${port}`);
});

