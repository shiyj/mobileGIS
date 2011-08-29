HOST = null; // localhost
PORT = 8001;

var starttime = (new Date()).getTime();

var fu = require("./fu"),
    sys = require("sys"),
    url = require("url"),
    qs = require("querystring");

var SESSION_TIMEOUT = 600 * 1000;

var channel = new function () {
  var session;
  this.query = function (watchNick, callback) {
	for (var i in sessions){
		if (!sessions.hasOwnProperty(i)) continue;
		if (sessions[i].nick==watchNick) {
			session=sessions[i];
			break;	
		}
	}
	if(!session){
		callback({error:"该用户已退出！"});
		return;
	}else{
		callback({
				 lat:session.lat,
				 lon:session.lon				
				});
		return;
	}
  };
};

var sessions = {};

function createSession (nick,lat,lon) {
  if (nick.length > 50) return null;
  //if (/[^\w_\-^!]/.exec(nick)) return null;

  for (var i in sessions) {
    var session = sessions[i];
    if (session && session.nick === nick) return null;
  }

  var session = { 
    nick: nick, 
    id: Math.floor(Math.random()*99999999999).toString(),
    timestamp: new Date(),
	lat: lat,
	lon: lon,
	setLat: function(lat){
		session.lat=lat;
	},
	setLon: function(lon){
		session.lon=lon;
	},
    poke: function () {
      session.timestamp = new Date();
    },

    destroy: function () {
	  sys.puts(session.nick+' apart');
      delete sessions[session.id];
    }
  };

  sessions[session.id] = session;
  return session;
}

setInterval(function () {
  var now = new Date();
  for (var id in sessions) {
    if (!sessions.hasOwnProperty(id)) continue;
    var session = sessions[id];
    if (now - session.timestamp > SESSION_TIMEOUT) {
      session.destroy();
    }
  }
}, 1000);

fu.listen(Number(process.env.PORT || PORT), HOST);


fu.get("/whotest", function (req, res) {
  var params = url.parse(req.url, true).query;
  var clientCallback = params.callback;
  var nicks = [];
  for (var id in sessions) {
    if (!sessions.hasOwnProperty(id)) continue;
    var session = sessions[id];
    nicks.push(session.nick);
  }

  res.simpleJSON(200,{nicks:nicks},clientCallback);
sys.puts("get whotest!")
});


fu.get("/jointest", function (req, res) {

  sys.puts("someone try to join");
  var nick = qs.parse(url.parse(req.url).query).nick;
  var lat=qs.parse(url.parse(req.url).query).lat;
  var lon=qs.parse(url.parse(req.url).query).lon;
  var clientCallback=qs.parse(url.parse(req.url).query).callback;
  if (nick == null || nick.length == 0) {
    res.simpleJSON(400, {error: "Bad nick."},clientCallback);
    return;
  }
  var session = createSession(nick,lat,lon);
  if (session == null) {
    res.simpleJSON(400, {error: "Nick in use"},clientCallback);
    return;
  }

  sys.puts("connection: " + nick + "@" + res.connection.remoteAddress);
  res.simpleJSON(200, { id: session.id
                      , nick: session.nick
                      , starttime: starttime
                      },clientCallback);
});
fu.get("/part", function (req, res) {
  var id = qs.parse(url.parse(req.url).query).id;
  var session;
  if (id && sessions[id]) {
    session = sessions[id];
    session.destroy();
  }
  res.simpleJSON(200, {  });
});


fu.get("/recvtest", function (req, res) {
sys.puts("someone get receive!")
  var id = qs.parse(url.parse(req.url).query).id;
  var session=sessions[id];
  if (!session ) {
    res.simpleJSON(400, { error: "No such session id" });
    return;
  }
  session.poke();
  var watchNick = qs.parse(url.parse(req.url).query).watchNick;
  var clientCallback = qs.parse(url.parse(req.url).query).callback;
  sys.puts(session.nick+' query '+watchNick);
  channel.query(watchNick, function (messages) {
    if (session) session.poke();
    res.simpleJSON(200, { messages: messages },clientCallback);
  });
});

fu.get("/sendtest", function (req, res) {
  var id = qs.parse(url.parse(req.url).query).id;
  var lat = qs.parse(url.parse(req.url).query).lat;
  var lon = qs.parse(url.parse(req.url).query).lon;
  var session = sessions[id];
  var clientCallback=qs.parse(url.parse(req.url).query).callback;
  if (!session ) {
    res.simpleJSON(400, { error: "No such session id" });
    return;
  }
sys.puts(session.nick+" send his/her gps point.")
  session.poke();
  session.setLat(lat);
  session.setLon(lon);
  res.simpleJSON(200, { success:true },clientCallback);
});
fu.get("/showall",function(req,res){
  var id = qs.parse(url.parse(req.url).query).id;
  var session = sessions[id];
  var clientCallback=qs.parse(url.parse(req.url).query).callback;
  if (!session ) {
    res.simpleJSON(400, { error: "No such session id" });
    return;
  }
  sys.puts(session.nick+" get all the person on line");
  res.simpleJSON(200,{sessions:sessions},clientCallback);
});
