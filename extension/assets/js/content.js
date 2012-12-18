
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

	if(request.type === "notice"){
		var resource = request.resource;
		var name = window.prompt("Save " + resource.type + " \"" + resource.url + "\" As:");

		sendResponse({
			name : name
		});

		return;
	}
	
});

