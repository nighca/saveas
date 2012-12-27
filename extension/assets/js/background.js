var default_cfg = {
	remoteHost : "http://saveas.nighca.me/"
};
if(!localStorage["remoteHost"])
 	localStorage["remoteHost"] = default_cfg.remoteHost;

var keyWords = {"accessKey": true, "secretKey": true, "bucket": true, "domain": true, "remoteHost": true};

var resource_list = function(){
	var resources = [];
	return {
		load : function(){
			resources = [];
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
	

	if(!localStorage["remoteHost"] || !localStorage["accessKey"] || !localStorage["secretKey"] || !localStorage["domain"] || !localStorage["bucket"]){
		alert("config needed!");
		return false;
	}
	var remoteHost = localStorage["remoteHost"];

	var opts = {
	    scope: localStorage["bucket"],
	    expires: 60
	};
	var Generator = new UploadToken(opts);

	var token =  Generator.generateToken();
	var QNConfig = {
		UploadToken : token, 
		bucket : localStorage["bucket"] || null,
		domain : localStorage["domain"] || null
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

		var suffixMatch = /(\w+)(\.([a-zA-Z0-9]+)|)(\?|\@|$)/;
		var suffix = "";
		if(suffixMatch.test(info.srcUrl)){
			var res = suffixMatch.exec(info.srcUrl);
			console.log(res);
			name = res[1];
			suffix = res[2];
		}

		if(info.mediaType){ //"image", "video", "audio"
			var resource = {
				name : name,
				url : info.srcUrl,
				type : info.mediaType,
				suffix : suffix
			}
		}else{ //"link"
			var resource = {
				name : name,
				url : info.linkUrl,
				type : "page",
				suffix : suffix
			}
		}

		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendMessage(tab.id, {type: "notice" ,resource: resource}, function(response) {
				//console.log(response);
				if(response.name){
					var new_name = response.name;
					if(!(new_name in keyWords)){
						resource.name = new_name;
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

	if(request.type === "hide_resource"){ //send resources to popup
		var resource = request.resource;

		if(!localStorage[resource.name]){
			sendResponse({
				ok : false,
				data : "no such resource (" + resource.name + ")"
			});
		}else{
			delete localStorage[resource.name];
			resource_list.load();
			sendResponse({
				ok : true,
				data : "removed."
			});
		}

		return;
	}
	
});

