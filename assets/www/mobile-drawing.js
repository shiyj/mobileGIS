var userInfo= {
		watched: {
				name: '',
				lat: '',
				lon: ''},
		watchToggle: false,
		teamUrl: '',
		name: 'android',
		sessionId: '',
		since: '',
		setLat: function(lat){
					userInfo.lat=lat;
				},
		setLon: function(lon){
					userInfo.lon=lon;
				}
};


var vector = new OpenLayers.Layer.Vector('Vector Layer', {
        styleMap: new OpenLayers.StyleMap({
            temporary: OpenLayers.Util.applyDefaults({
                pointRadius: 16
            }, OpenLayers.Feature.Vector.style.temporary)
        })
    });
var toolbar = new OpenLayers.Control.Panel({
        displayClass: 'olControlEditingToolbar'
    });
var draw =new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Polygon, { displayClass: 'olControlDrawFeaturePolygon'});
var drawPoint= new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Point);
toolbar.addControls([
        new OpenLayers.Control({
            displayClass: 'olControlNavigation'
        }),
        draw
    ]);

//var mymap = new OpenLayers.Layer.WMS( "ENGIN","http://222.22.64.192/cgi-bin/mapserv?map=/home/engin/webapp/mapfile/tt.map&",{layers: ['xzq','jmd','cz','road']},{gutter: 15});
var mymap = new OpenLayers.Layer.WMS( "OpenLayers WMS", "http://vmap0.tiles.osgeo.org/wms/vmap0", {layers: 'basic'},{gutter: 15});
var map;
var init =function(){

	map = new OpenLayers.Map({
	        div: 'map',
	        controls: [
	            new OpenLayers.Control.TouchNavigation(),
	            new OpenLayers.Control.ZoomPanel(),
	            toolbar
	        ],
	        layers: [mymap, vector],
	        center: new OpenLayers.LonLat(0, 0),
	        zoom: 5,
	        theme: null
	    });
	toolbar.controls[1].activate();
}

function setgeo() {
	var onSuccess = function(position) {
	    alert("开启GPS成功，当前坐标：\n"+'纬度：'          + position.coords.latitude          + '\n' +
	          '经度：'         + position.coords.longitude         + '\n' +
	          '高程：'          + position.coords.altitude          + '\n' +
	          '精度：'          + position.coords.accuracy          + '\n' +
	          '高程精度' + position.coords.altitudeAccuracy  + '\n' +
	          '朝向：'           + position.coords.heading           + '\n' +
	          '速度：'             + position.coords.speed             + '\n' +
	          '时间：'         + new Date(position.timestamp)      + '\n');
	    //draw.setGeometry(position);
	    //draw.finalize();
	    var x=parseFloat(position.coords.latitude);
	    var y=parseFloat(position.coords.longitude);
	    draw.insertXY(y,x);
	};

	function onError(error) {
	    alert('code: '    + error.code    + '\n' +
	          'message: ' + error.message + '\n');
	};
	if(!userInfo.watchToggle){
		navigator.geolocation.getCurrentPosition(onSuccess, onError,{ enableHighAccuracy: true });
	}
};


function watch(){
	function onSuccess(position) {
		alert( 'Latitude: '  + position.coords.latitude      + '\n' +
                'Longitude: ' + position.coords.longitude );
	    var x=parseFloat(position.coords.latitude);
	    var y=parseFloat(position.coords.longitude);
	    var latlon= new OpenLayers.LonLat(y,x);
	    //把本身的nick和gps坐标发送出去。
	    userInfo.setLat(x);
	    userInfo.setLon(y);
	    if(userInfo.sessionId) 
	    	sendGPS(x,y);
	    //如果开启监测，则不画本身。
	    if(userInfo.watchToggle){
	    	recv();
	    	draw.handler.drawLocation(userInfo.watched.lon,userInfo.watched.lat);
	    	map.setCenter(new OpenLayers.LonLat(userInfo.watched.lon,userInfo.watched.lat));
	    } else {
		    draw.handler.drawLocation(y,x);
		    map.setCenter(latlon);
	    }
	}

	function onError(error) {
	    alert('code: '    + error.code    + '\n' +
	          'message: ' + error.message + '\n');
	}
	//既做定时器又侦测数据。
	var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { frequency: 3000,enableHighAccuracy: true });
};

function recv(){
	if(Ext.util.JSONP.current)
	Ext.util.JSONP.current=null;
	Ext.util.JSONP.request({
		url: 'http://10.0.2.2:8001/recvtest',
		params: {
			uid: Date.parse(new Date()),
			id: userInfo.sessionId,
			watchNick: userInfo.watched.name
		},
		callbackKey: 'callback',
		callback: function(result) {
			var messages=result.messages;
			alert('lat'+result.messages.lat);
			if(messages){
				userInfo.watched.lat=messages.lat;
				userInfo.watched.lon=messages.lon;
				alert(userInfo.watched.lat+'  is user lat')
			} else {
				alert("can't receive!");
			}
		}
	});
};
function sendGPS(lat,lon){
	if(Ext.util.JSONP.current)
	Ext.util.JSONP.current=null;
	Ext.util.JSONP.request({
	    url: 'http://10.0.2.2:8001/sendtest',
	    params: {
			uid: Date.parse(new Date()),
			lat: lat,
			lon: lon,
			nick: userInfo.name,
			id: userInfo.sessionId
			},
	    callbackKey: 'callback',
	    callback: function(result) {
	    }
	});
};
function join(){
	//Ext.getBody().mask('loading...', 'x-mask-loading', false);
	while(Ext.util.JSONP.queue.length)
		Ext.util.JSONP.queue.shift();
	if(Ext.util.JSONP.current)
	Ext.util.JSONP.current=null;
	Ext.util.JSONP.request({
	    url: 'http://10.0.2.2:8001/jointest',
	    params: {
			uid: Date.parse(new Date()),
			nick: userInfo.name,
			lat: userInfo.lat,
			lon: userInfo.lon
			},
	    callbackKey: 'callback',
	    callback: function(result) {
				var sessionid=result.id;
				var since=result.starttime;
				if(sessionid && since){
					userInfo.sessionId=sessionid;
					userInfo.since=since;
					alert("join successed with session id"+sessionid);
				}else {
					alert('join failed');
				}
				//Ext.getBody().unmask();
	    },
	});
};
function getWho(view){
	if(Ext.util.JSONP.current)
	Ext.util.JSONP.current=null;
	Ext.util.JSONP.request({
	    url: 'http://10.0.2.2:8001/whotest',
	    params: {uid: Date.parse(new Date())},
	    callbackKey: 'callback',
	    callback: function(result) {
	    	var nicksStore=view.getStore();
	    	var len=nicksStore.data.items.length;
	    	for(var i=len;i>=1;i--)
	    		nicksStore.removeAt(i-1);
	    	var nicks = result.nicks;
	        if (nicks) {
	        	if(nicks.length==0)
	        		alert("暂无成员加入小组。");
	        	else{
	        		for(var i=0;i<nicks.length;i++){
	        			nicksStore.add({nick:nicks[i]});
	        		}
	        	}		
	        }
	        else {
	            alert('连接服务器出错！\n请稍后尝试……');
	        }
	    }
	});
};

function showAll(){
	if(Ext.util.JSONP.current)
	Ext.util.JSONP.current=null;
	Ext.util.JSONP.request({
	    url: 'http://10.0.2.2:8001/showall',
	    params: {
			uid: Date.parse(new Date()),
			id: userInfo.sessionId
			},
	    callbackKey: 'callback',
	    callback: function(result) {
			//vector.features.length=0;
			vector.removeAllFeatures();
	    	var sessions=result.sessions;
	    	if(sessions){
	    		for(var i in sessions){
	    			var session=sessions[i];
	    			alert(session.nick);
	    			//drawPoint.addPoint(session.lon,session.lat);
	    		}
	    	} else {
	    		alert('wrong data.');
	    	}
	    }
	});
};
function undo() {
	draw.undo();
};
function redo() {
	draw.redo();
};
function finish(){
	draw.finishSketch();
};
function cancle() {
	draw.cancle();
};
