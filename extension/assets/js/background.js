var default_cfg = {
	remoteHost : "http://saveas.nighca.me/"
};
if(!localStorage["remoteHost"])
 	localStorage["remoteHost"] = default_cfg.remoteHost;

var keyWords = {"accessKey": true, "secretKey": true, "bucket": true, "remoteHost": true};


var resource_list = function(){
	var resources = [];
	return {
		load : function(){
			for(var key in localStorage){
				if(!(key in keyWords)){
					var resource = {
						name : key,
						newUrl : localStorage[key]
					};
					this.add(resource);
				}
			}
		},
		add : function(resource){
			var key = resource.name;
			var value = resource.newUrl;
			localStorage[key] = value;

			return resources.push(resource);
		},
		getAll : function(){
			return resources;
		}
	}
}();

resource_list.load();

function noticeFlash(type, content, imgUrl){
	var notification = webkitNotifications.createNotification(
	  	imgUrl, 
	  	type, 
	  	content
	);
	notification.show();
	setTimeout(function(){
		notification.cancel();
	}, 4000);
}

function sendResource(resource){
	var QNConfig = {
		accessKey : localStorage["accessKey"] || null,
		secretKey : localStorage["secretKey"] || null,
		bucket : localStorage["bucket"] || null
	}

	var remoteHost = localStorage["remoteHost"] || default_cfg.remoteHost;


	if(!QNConfig.accessKey){
		alert("config needed!");
		return false;
	}
	$.ajax({
		url: remoteHost,
		type: "POST",
		dataType: "json",
		data: {
			resource: resource,
			config: QNConfig
		},
		success: function(resp){
			if(!resp.ok){
				console.log("err:", resp);
				noticeFlash('Fail', JSON.stringify(resp.data), resource.newUrl);
			}else{
				resource.newUrl = resp.data.url;
				resource_list.add(resource);
				noticeFlash('Success', resource.type + " saved!", resource.newUrl);
			}
		},
		error: function(err){
			console.log("err:", err);
			noticeFlash('Fail', JSON.stringify(err), null);
		}
	});	
}


//-------------------------------------------- create menu option --------------------------------------------

var createProperties = {
	type : "normal",
	title : "Save As...",
	contexts : ["image", "video", "audio"],
	onclick : function(info, tab) {

		var suffixMatch = /\.[a-zA-Z0-9]+(\?|\@)/;
		var suffixMatch2 = /\.[a-zA-Z0-9]+$/;
		var suffix = "";
		if(suffixMatch.exec(info.srcUrl)){
			suffix = suffixMatch.exec(info.srcUrl)[0];
			suffix = suffix.slice(0, suffix.length-1);
		}else{
			var temp = suffixMatch2.exec(info.srcUrl);
			if(temp)
				suffix = temp[0];
		}

		if(info.mediaType){ //"image", "video", "audio"
			var resource = {
				url : info.srcUrl,
				type : info.mediaType,
				suffix : suffix
			}
		}else{ //"link"
			var resource = {
				url : info.linkUrl,
				type : "page",
				suffix : suffix
			}
		}

		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendMessage(tab.id, {type: "notice" ,resource: resource}, function(response) {
				//console.log(response);
				if(response.name){
					var name = response.name;
					if(!(name in keyWords)){
						resource.name = name;
						sendResource(resource);
					}else{
						noticeFlash("Fail", "The name is forbidden, try another.", null);
					}
				}
			});
		});
	}
}

var menuId = chrome.contextMenus.create(createProperties, function(){
	if(chrome.extension.lastError)
		console.log(chrome.extension.lastError);
});

//-------------------------------------------- listen --------------------------------------------

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	
	if(request.type === "get_resources"){ //send resources to popup

		sendResponse({
			ok : true,
			resources : resource_list.getAll()
		});

		return;
	}
	
});

