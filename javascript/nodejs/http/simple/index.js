const http = require("http");
const host = '89.223.123.174';
const port = '80';

const requestListener = function(req, res) {
    res.writeHead(200);
	res.end('NodeJS, default http server!');
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log('Server is running on http://'+host+':'+port);
});
