function createNode(nodeInfo){
	var node = '<a href="' + 
		nodeInfo.newUrl + 
		'" target="_blank" >' + 
		'<li class="resource"><img src="' + 
		nodeInfo.newUrl + 
		'" width="50">' + 
		nodeInfo.name + 
		'</li></a>';
	return node;
}

var src_list = document.getElementById("src_list");

chrome.extension.sendMessage({type: "get_resources"}, function(response){
	if(response.ok){
		var resources = response.resources;
		for(var i=0;i<resources.length;i++){
			src_list.innerHTML += createNode(resources[i]);
		}
	}
});
