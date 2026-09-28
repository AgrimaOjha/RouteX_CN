const express = require('express');

const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
    res.set('X-Backend', 'A');
    res.set('Cache-Control', 'max-age=60');

    res.json({
        backend: 'A',
        status: 'ok',
        message: 'RouteX Backend A is running'
    });
});

app.get('/api/status', (req, res) => {
    res.set('X-Backend', 'A');
    res.set('Cache-Control', 'max-age=60');

    res.json({
        backend: 'A',
        status: 'ok'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`RouteX Backend A running on port ${PORT}`);
});
