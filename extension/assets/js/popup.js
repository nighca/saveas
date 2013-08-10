var src_list = document.getElementById("src_list");
var infoWrapper = document.getElementById("info");
var searchIn = document.getElementById("search_in");

var showInfo = function(info, time){
	time = time || 2000;
	infoWrapper.innerHTML = info;
	setTimeout(function(){
		infoWrapper.innerHTML  ='';
	}, time);
};

var getThumb = function(item){
	var imgNamePattern = /((\.gif)|(\.png)|(\.jpg)|(\.bmp))$/;
	if(imgNamePattern.test(item.name)){
		return item.newUrl;
	}

	var vdoNamePattern = /((\.mp4)|(\.webm))$/;
	if(vdoNamePattern.test(item.name)){
		return item.newUrl + '?vframe/jpg/offset/2/w/200/h/120';
	}

	return '';
};

function createNode(item){
	var removeIcon = '<span class="remove_op">x</span>';
	var img = '<img src="' + 
		getThumb(item) + 
		'" width="50">';
	var link = '<a href="' + item.newUrl + '" target="_blank" >' + 
		img +
		item.name + 
		'</a>';

	var node = '<li class="resource">' + 
		removeIcon + 
		link +
		'</li>';

	return node;
}

var renderResourceList = function(resources){
	src_list.innerHTML = '';
	for(var i=0;i<resources.length;i++){
		src_list.innerHTML = createNode(resources[i]) + src_list.innerHTML;
	}

	var resources = src_list.getElementsByClassName("resource");

	for (var i = resources.length - 1; i >= 0; i--) {
		var remove = resources[i].getElementsByClassName("remove_op")[0];
		remove.addEventListener("click", removeItem);
	};
};

var getResources = function(refresh, keyword){
	chrome.extension.sendMessage({type: "get_resources", refresh: refresh, keyword: keyword}, function(response){
		if(response.ok){
			var resources = response.resources;
			renderResourceList(resources);
		}else{
			waitAndGetResources(refresh, keyword);
		}
	});
};

var waitAndGetResources = function(refresh, keyword){
	setTimeout(function(){
		getResources(refresh, keyword);
	}, 500);
};

var removeItem = function(event){
	var li = this.parentNode;
	var key = li.getElementsByTagName("a")[0].innerText;
	showInfo('Dealing...');

	chrome.extension.sendMessage({type: "remove_resource", resource: {name: key}}, function(response){
		console.log("remove response: ", response);
		if(response.ok){
			showInfo('OK!');
			li.outerHTML = '';
		}else{
			showInfo('Error: ' + JSON.stringify(response.data));
		}
		waitAndGetResources(true);
		return;
	});
};

getResources();

search_in.addEventListener('keyup', function(e){
	var keyword = this.value.trim();
	getResources(false, keyword);
});


