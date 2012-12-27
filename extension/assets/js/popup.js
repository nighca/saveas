function createNode(nodeInfo){

	var node = '<li class="resource"><span class="hide_op">x</span><a href="' + 
		nodeInfo.newUrl + 
		'" target="_blank" >' + 
		'<img src="' + 
		nodeInfo.newUrl + 
		'" width="50">' + 
		nodeInfo.name + 
		'</a></li>';

	return node;
}

var src_list = document.getElementById("src_list");

chrome.extension.sendMessage({type: "get_resources"}, function(response){
	if(response.ok){
		var resources = response.resources;
		for(var i=0;i<resources.length;i++){
			src_list.innerHTML += createNode(resources[i]);
		}

		var resources = src_list.getElementsByClassName("resource");

		for (var i = resources.length - 1; i >= 0; i--) {
			var hide = resources[i].getElementsByClassName("hide_op")[0];
			hide.addEventListener("click", function(event){
				var key = this.parentNode.getElementsByTagName("a")[0].innerText;

				chrome.extension.sendMessage({type: "hide_resource", resource: {name: key}}, function(response){
					console.log("hide response: ", response);
					window.location.reload();
				});
			});
		};

	}
});



