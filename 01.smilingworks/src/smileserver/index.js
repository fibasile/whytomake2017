const WebSocket = require('ws');
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
const byline = require('byline');

const WS_SERVER='ws://localhost:1880/ws/detectSmile'
const SMILE_CMD='./bin/smiledetect';
const SMILE_ARGS=[
   "--cascade=./data/haarcascade_frontalface_default.xml",
   "--smile-cascade=./data/haarcascade_smile.xml",
   "--scale=4.0"
];

const ws = new WebSocket(WS_SERVER, {
  perMessageDeflate: false
});




ws.on('open', function open() {

	ws.send('starting smiledetect');
	let prc = spawn(SMILE_CMD, SMILE_ARGS);

	prc.stdout.setEncoding('utf8');
	prc.stdout.on('data', function (data) {
	    let str = data.toString()
	    let lines = str.split(/\n/g);
	    lines.forEach(function(l){
		if (l.indexOf('smile:')!=-1){ 
		    let value = parseFloat(l.replace('smile:',''));
		    ws.send(JSON.stringify(value)); console.log(value);
		}
	    });
	});

	prc.on('close', function (code) {
	    console.log('process exit code ' + code);
	    process.exit(1);
	});


	ws.on('close', function close(){
	   prc.kill();
	});

	
	process.on( 'SIGTERM', function () {
	   ws.close(function () {
	   	prc.kill();
	     console.log("Finished all requests");
	   });
	});


});
