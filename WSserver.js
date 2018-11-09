var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: process.env.WSPORT || 3001
    });
	
const uuidv4 = require('uuid/v4');

var xss = require("xss");
	
console.log("WebSocketServer is Running ... listening on port 3001");
wss.broadcast = function(data) {
    wss.clients.forEach(function each(client) {   
      client.send(JSON.stringify(data));
  });
};

wss.on('connection', function(ws) {
    ws.on('message', function(data) {
        data = JSON.parse(data);
        if (data.type === "message") {
            wss.broadcast({
                nick: ws.nick,
                uid: ws.uid,
                time: getDateTime(),
                message: xss(data.message),
                type: "message"
            });
        } else if (data.type === "nickname") {
            wss.broadcast({
                oldnick: ws.nick,
                nick: data.nick,
                uid: ws.uid,
                type: "nickname"
            });
            ws.nick = data.nick;
        }
    });
    ws.on('close', function() {
        wss.broadcast({
            nick: ws.nick,
            uid: ws.uid,
            type: "exit"
        });
    });
    ws.uid = uuidv4();;
    ws.nick = "GUEST";
    for (var i in this.clients) {
        ws.send(JSON.stringify({
            nick: this.clients[i].nick,
            uid: this.clients[i].uid,
            type: "join"
        }));
    }
    wss.broadcast({
        nick: ws.nick,
        uid: ws.uid,
        type: "join"
    });
});

 function getDateTime() {
    var now     = new Date(); 
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
  
    if(hour.toString().length == 1) {
         hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
         minute = '0'+minute;
    }
    if(second.toString().length == 1) {
         second = '0'+second;
    }   
    var dateTime = hour+':'+minute+':'+second;   
     return dateTime;
}

