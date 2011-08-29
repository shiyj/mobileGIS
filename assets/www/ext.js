var App = new Ext.Application({
    name: 'MapApp',
    useLoadMask: true,
    launch: function () {
	Ext.regModel('Nick', {
        idProperty: 'id',
        fields: ['nick']
    });
	Ext.regStore('NickStore',{
		model: 'Nick'
	});
	MapApp.views.mapTopToolbar = new Ext.Toolbar({
         title: 'Map',
         items: [
             { xtype: 'spacer' }
         ]
     });
	
	MapApp.views.doMap = new Ext.Toolbar({
		layout: {
	        type: 'vbox',
	        pack: 'center',
	        align: 'stretch'
	    },
	    dock: 'bottom',
	    cls: 'card2',
	    scroll: 'vertical',
	    defaults: {
	        layout: {
	            type: 'hbox'
	        },
	        flex: 1,
	        defaults: {
	            xtype: 'button',
	            cls: 'demobtn',
	            flex: 1
	        }
	    },
	    items:[
	            { 
	            	ui: 'confirm', 
	            	text: '开始吧！！！',
	            	handler: function () {
	            		MapApp.views.container.setActiveItem('mapPanel', { type: 'slide', direction: 'left' });
	            	}	
	            }]
    });
	MapApp.views.settingTopToolbar = new Ext.Toolbar({
        title: '设置',
        items: [
            { xtype: 'spacer' }
        ]
    });
	MapApp.views.settingPanel= new Ext.Panel({
		id: 'settingPanel',
		fullscreen: true,
		defaults: {style: 'font-size: 24px;'},
		items: [{
                xtype: 'textfield',
                name: 'name',
                label: 'name',
                id: 'userName',
                required: true
            },{
                xtype: 'togglefield',
                name: 'enable',
                label: '开启监控'
            },{
            	xtype: 'button',
                text: 'OK',
                ui: 'action',
                handler: function(){
            		if(userInfo.sessionId!=''){
            			alert('已经加入，不能更改名词！');
            			return;
            		}
            		var userName=Ext.getCmp('userName').getValue();
            		if(userName!='')
            			userInfo.name=userName;
            		alert('用户名称已更改为：'+userInfo.name+'请确保是唯一值，并且在加入小组后将无法更改。');
            	}
        }
        ],

	});
	MapApp.views.teamTopToolbar = new Ext.Toolbar({
        title: '小组信息',
        items: [
            { xtype: 'spacer' },{
            	text: '刷新',
            	iconCls: 'refresh',
                iconMask: true,
                handler: function () {
            	getWho(MapApp.views.teamList);
            	}
            }
        ]
    });
	MapApp.views.teamJoin= new Ext.Toolbar({
		layout: {
	        type: 'vbox',
	        pack: 'center',
	        align: 'stretch'
	    },
	    dock: 'bottom',
	    cls: 'card4',
	    scroll: 'vertical',
	    defaults: {
	        layout: {
	            type: 'hbox'
	        },
	        flex: 1,
	        defaults: {
	            xtype: 'button',
	            cls: 'demobtn',
	            flex: 1
	        }
	    },
	    items:[
		{ 
	        ui: 'confirm', 
	        text: '加入小组',
	        dock: 'bottom',
	        handler: function () {
				if(userInfo.sessionId!='')
					alert('已经加入。');
				else{
				join();
				}
			}	
	     }]
	});
	MapApp.views.teamList = new Ext.List({
		id: 'teamList',
        fullscreen: true,
        emptyText: '<div style="margin:5px;">暂无成员加入。</div>',
		layout: 'fit',
	    itemTpl : '{nick}',
	    store: 'NickStore' 
	});
	
	var mapControlItems= {
	        xtype: 'toolbar',
	        ui: 'light',
	        dock: 'bottom',     
	        items: [{
	        	text: '返回',
                ui: 'back',
                handler: function () {
	        		MapApp.views.container.setActiveItem('tabPanel', { type: 'slide', direction: 'right' });
                }
	        	}, {
	        	text: '撤销',
                ui: 'action',
                handler: function () {
	        		undo();
	        		}
	        	}, {
	        	text: '恢复',
                ui: 'action',
                handler: function () {
	        		redo();
                	}
	        	}, {
	        	text: '踩点',
                ui: 'action',
                handler: function () {
                		setgeo();
	        		}
	        	}, {
	        	text: '完成',
                ui: 'action',
                handler: function () {
	        		finish();
                	}
	        	}]
	};

	
	MapApp.views.teamMapList = new Ext.List({
		id: 'teamMapList',
		emptyText: '<div style="margin:5px;">暂无成员加入。</div>',
        onItemDisclosure: function (record) {
			alert(record.get('nick'));
			userInfo.watchToggle=true;
			userInfo.watched.name=record.get('nick');
		},
	    itemTpl : '{nick}',
	    dockedItem: [{
	    	ui: 'confirm', 
	        text: '所有成员',
	        dock: 'bottom',
	        handler: function () {
				showAll();
			}	
	    }],
	    store: 'NickStore'
	    
	});
	var mapControlItems2 ={
		xtype: 'segmentedbutton',
        allowDepress: true,
        dock: 'bottom',
        layout: {
            pack: 'center'
        },
        items:[mapControlItems,{
        	   xtype: 'toolbar',
               ui: 'light',
               dock: 'bottom',
               defaults: {
                   iconMask: true,
                   ui: 'plain'
               },
               scroll: {
                   direction: 'horizontal',
                   useIndicators: false
               },
               layout: {
                   pack: 'center'
               },
               items: [{
            	   iconMask: true,
                   iconCls: "action",
                   handler: function(){
	            	   if (!App.popup) {
	                       App.popup = new Ext.Panel({
	                           floating: true,
	                           modal: true,
	                           centered: true,
	                           hideOnMaskTap: true,
	                           width: 200,
	                           height:240,
	                           items: [MapApp.views.teamMapList],
	                           scroll: 'vertical'
	                       });
	                   }
	            	   //toolbar.controls[0].activate();
	            	   getWho(MapApp.views.teamMapList);
	                   App.popup.show('pop');
               	   }
               }]
        }]
	};
	MapApp.views.mapPanel = new Ext.Panel({
		id: 'mapPanel',
		fullscreen: true,
        layout: {
            pack: 'center'
        },
        cardAnimation: 'slide',
		dockedItems: [{
			xtype: 'component',
			fullscreen: true,
			layout: 'fit',
			dock: 'center',
            id: 'map',
			listeners: {
               render: function(){
				init();
				watch();
				}
			}
	    },mapControlItems2],
		
	});
	
	MapApp.views.tabPanel = new Ext.TabPanel({
		id: 'tabPanel',
        tabBar: {
            dock: 'bottom',
            layout: {
                pack: 'center'
            }
        },
        fullscreen: true,
        ui: 'light',
        cardSwitchAnimation: {
            type: 'slide',
            cover: true
        },
        defaults: {
            scroll: 'vertical'
        },
        items: [{
            title: '主面板',
            html: '<h1>程序说明</h1><p>powered by engin.zzu</p>',
            iconCls: 'home',
            cls: 'card1'
        }, {
            title: '地图操作',
            iconCls: 'action',
            html:'<h1>地图操作规范</h1><p>谨慎操作，注意确保GPS终端所处位置卫星信号良好周围无遮挡物和反射较强的物体。</p><p>请确保GPS终端在踩点处安放稳定。</p>',
            cls: 'card2',
            dockedItems: [MapApp.views.mapTopToolbar,MapApp.views.doMap]
        }, {
            title: '设置',
            cls: 'card4',
            iconCls: 'settings',
            dockedItems: [MapApp.views.settingTopToolbar,MapApp.views.settingPanel]
        }, {
            title: '小组',
            cls: 'card5',
            iconCls: 'user',
            dockedItems:[MapApp.views.teamTopToolbar,MapApp.views.teamList,MapApp.views.teamJoin]
        }]
    });
	
	
	MapApp.views.container= new Ext.Panel({
        fullscreen: true,
        layout: 'card',
        cardAnimation: 'slide',
        items: [MapApp.views.tabPanel,MapApp.views.mapPanel]
    });
	}
});

