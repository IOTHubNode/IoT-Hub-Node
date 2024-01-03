import http from 'http';
import { PORT } from './config/constant';
import { getIpAddress } from './utils/util';
import app from './app/web';


//http server·
const httpPort = PORT.http;
const httpServer = http.createServer(app.callback());
httpServer.listen(httpPort);
httpServer.on('error', (err: Error) => {
	console.log(err);
});
httpServer.on('listening', () => {
	const ip = getIpAddress();
	const address = `http://${ip}:${httpPort}`;
	const localAddress = `http://localhost:${httpPort}`;
	console.log(`app started at address:${localAddress} or ${address}`);
});

// //https server
// const httpsPort = PORT.https;
// const ACoptions = {
// 	key: fs.readFileSync(path.resolve(__dirname, '.\\config\\ssl\\private.key')), // SSL私钥文件路径
// 	cert: fs.readFileSync(path.resolve(__dirname, '.\\config\\ssl\\certificate.crt')), // SSL证书文件路径
// };
// const httpsServer = https.createServer(ACoptions, app.callback());
// httpsServer.listen(httpsPort);
// httpsServer.on('error', (err) => {
// 	console.log(err);
// });

// httpsServer.on('listening', () => {
// 	const ip = getIpAddress();
// 	const address = `https://${ip}:${httpsPort}`;
// 	const localAddress = `https://localhost:${httpsPort}`;
// 	console.log(`app started at address \n\n${localAddress}\n\n${address}`);
// });
