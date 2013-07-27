function createNode(nodeInfo){
	var isImg = function(name){
		var imgNamePattern = /((\.gif)|(\.png)|(\.jpg)|(\.bmp))$/;
		return imgNamePattern.test(name);
	};

	var removeIcon = '<span class="remove_op">x</span>';
	var img = '<img src="' + 
		(isImg(nodeInfo.name) ? nodeInfo.newUrl : '') + 
		'" width="50">';
	var link = '<a href="' + nodeInfo.newUrl + '" target="_blank" >' + 
		img +
		nodeInfo.name + 
		'</a>';

	var node = '<li class="resource">' + 
		removeIcon + 
		link +
		'</li>';

	return node;
}

var src_list = document.getElementById("src_list");
var infoWrapper = document.getElementById("info");

var showInfo = function(info){
	infoWrapper.innerHTML = info;
};

var removeItem = function(event){
	var key = this.parentNode.getElementsByTagName("a")[0].innerText;
	showInfo('...');

	chrome.extension.sendMessage({type: "remove_resource", resource: {name: key}}, function(response){
		console.log("remove response: ", response);
		if(!response.ok){
			showInfo('Error: ' + JSON.stringify(response.data));
			return;
		}
		showInfo('OK!');
		if(response.data){
			renderResourceList(response.data);
		}else{
			getResources();
		}
	});
};

var renderResourceList = function(resources){
	src_list.innerHTML = '';
	for(var i=0;i<resources.length;i++){
		src_list.innerHTML += createNode(resources[i]);
	}

	var resources = src_list.getElementsByClassName("resource");

	for (var i = resources.length - 1; i >= 0; i--) {
		var remove = resources[i].getElementsByClassName("remove_op")[0];
		remove.addEventListener("click", removeItem);
	};
};

var getResources = function(){
	chrome.extension.sendMessage({type: "get_resources"}, function(response){
		if(response.ok){
			var resources = response.resources;
			renderResourceList(resources);
		}else{
			setTimeout(getResources, 500);
		}
	});
};

getResources();


