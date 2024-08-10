const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

let lastOrder = {};

ws.on('message', (data) => {
    const orderUpdate = JSON.parse(data);

    if (
        lastOrder.AppOrderID === orderUpdate.AppOrderID &&
        lastOrder.price === orderUpdate.price &&
        lastOrder.triggerPrice === orderUpdate.triggerPrice &&
        lastOrder.priceType === orderUpdate.priceType &&
        lastOrder.productType === orderUpdate.productType &&
        lastOrder.status === orderUpdate.status &&
        lastOrder.exchange === orderUpdate.exchange &&
        lastOrder.symbol === orderUpdate.symbol
    ) {
        console.log('Duplicate or redundant update filtered out');
    } else {
        lastOrder = orderUpdate;
        determineAction(orderUpdate);
    }
});

function determineAction(order) {
    let action = '';

    if (order.priceType === "MKT" && order.status === "complete" && !orderExists(order)) {
        action = 'placeOrder';
    } else if (order.priceType === "LMT" && order.status === "open" && !orderExists(order)) {
        action = 'placeOrder';
    } else if ((order.priceType === "SL-LMT" || order.priceType === "SL-MKT") && order.status === "pending" && !orderExists(order)) {
        action = 'placeOrder';
    } else if (order.priceType === "MKT" && order.status === "complete" && orderExists(order)) {
        action = 'modifyOrder';
    } else if (order.priceType === "LMT" && order.status === "open" && orderExists(order)) {
        action = 'modifyOrder';
    } else if ((order.priceType === "SL-LMT" || order.priceType === "SL-MKT") && order.status === "pending" && orderExists(order)) {
        action = 'modifyOrder';
    } else if (["LMT", "SL-LMT", "SL-MKT"].includes(order.priceType) && order.status === "cancelled") {
        action = 'cancelOrder';
    }

    if (action) {
        console.log(`Action taken: ${action} for order ${order.AppOrderID}`);
    }
}

function orderExists(order) {
    // Placeholder logic for checking if the order exists in the system
    return false;
}

ws.on('open', () => {
    console.log('Connected to WebSocket server');
});

ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
});
