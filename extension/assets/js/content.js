chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

	if(request.type === "notice"){
		var resource = request.resource;
		var name = window.prompt("资源保存为：（唯一名称）", resource.name);

		console.log(resource);

		if(name){
			sendResponse({
				name : name
			});
		}

		return;
	}
	
});

