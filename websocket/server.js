const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let orderId = 1000;

function generateOrderUpdate() {
    orderId += 1;
    return {
        AppOrderID: orderId,
        price: Math.floor(Math.random() * 100),
        triggerPrice: Math.floor(Math.random() * 100),
        priceType: "MKT",
        productType: "I",
        status: "complete",
        exchange: "NSE",
        symbol: "SYMBOL_" + orderId
    };
}

function sendUpdates(ws) {
    let updateBatches = [
        { count: 10, delay: 1000 },
        { count: 20, delay: 3000 },
        { count: 40, delay: 6000 },
        { count: 30, delay: 11000 }
    ];

    let totalUpdates = 0;
    for (let batch of updateBatches) {
        setTimeout(() => {
            for (let i = 0; i < batch.count; i++) {
                const orderUpdate = generateOrderUpdate();
                ws.send(JSON.stringify(orderUpdate));
                console.log(`Sent order update: ${JSON.stringify(orderUpdate)}`);
                totalUpdates += 1;
            }
            if (totalUpdates >= 100) {
                ws.close();
                console.log('All updates sent, closing connection');
            }
        }, batch.delay);
    }
}

server.on('connection', (ws) => {
    console.log('Client connected');
    sendUpdates(ws);

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
