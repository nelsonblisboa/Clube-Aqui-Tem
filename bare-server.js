import http from 'http';
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HELLO FROM BARE NODE SERVER! Request to: ' + req.url);
});
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log('Bare server listening on ' + port);
});
