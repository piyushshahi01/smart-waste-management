const http = require('http');

const simulateSensorData = () => {
    const locations = [
        'Sector 62, Noida',
        'Botanical Garden, Noida',
        'Rajiv Chowk, Delhi',
        'Indirapuram, Ghaziabad',
        'Sector 18, Noida'
    ];

    console.log('Starting sensor simulation using native http...');

    setInterval(() => {
        const location = locations[Math.floor(Math.random() * locations.length)];
        const fillLevel = Math.floor(Math.random() * 100);
        const gasLevel = Math.floor(Math.random() * 800);
        const temperature = Math.floor(Math.random() * 50);

        const data = JSON.stringify({
            location,
            fillLevel,
            gasLevel,
            temperature
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/bins/update',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    console.log(`Updated bin: ${location} | Fill: ${fillLevel}% | Status: ${json.status}`);
                } catch (e) {
                    console.log(`Response error for ${location}: ${body}`);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`Simulation error: ${error.message}. Is backend running on port 5000?`);
        });

        req.write(data);
        req.end();
    }, 5000);
};

simulateSensorData();
