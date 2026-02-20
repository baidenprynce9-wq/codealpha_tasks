const fetch = require('node-fetch'); // May need to install node-fetch or use http

// Using native http to avoid dependency issues if node-fetch isn't installed
const http = require('http');

const data = JSON.stringify({
    name: 'Test Node',
    email: 'testnode' + Date.now() + '@example.com',
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', d => {
        process.stdout.write(d);
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
