const https = require('https');

const DB_URL = 'smart-waste-management-e1235-default-rtdb.asia-southeast1.firebasedatabase.app';

const simulateIoTData = () => {
    console.log('Starting Firebase IoT simulation...');

    setInterval(() => {
        const fill = Math.floor(Math.random() * 100);
        const distance = (13 - (fill * 13 / 100)).toFixed(2); // inverse of fill
        const temp = (25 + Math.random() * 10).toFixed(1);
        const gas = Math.floor(200 + Math.random() * 400);

        const data = JSON.stringify({
            bin1: {
                location: "Simulation Node 1",
                fill,
                distance: parseFloat(distance),
                temp: parseFloat(temp),
                gas,
                lastUpdated: new Date().toISOString()
            }
        });

        const options = {
            hostname: DB_URL,
            path: '/.json',
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode === 200) {
                console.log(`Firebase Update: Fill ${fill}% | Temp ${temp}°C | Gas ${gas}ppm`);
            } else {
                console.log(`Firebase Error: ${res.statusCode}`);
            }
        });

        req.on('error', (e) => {
            console.error('Firebase Request Error:', e.message);
        });

        req.write(data);
        req.end();
    }, 5000);
};

simulateIoTData();
