var srcList = document.getElementById("src_list");
var infoWrapper = document.getElementById("info");
var searchIn = document.getElementById("search_in");
var qrChecker = document.getElementById("qr_checker");

var showInfo = function(info, time){
	time = time || 2000;
	infoWrapper.innerHTML = info;
	setTimeout(function(){
		infoWrapper.innerHTML  ='';
	}, time);
};

var getQR = function(item){
	return item.newUrl + '?qrcode';
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
	var qrcode = 
		'<a href="' + getQR(item) + '" target="_blank" >' + 
		'<img class="qrcode" src="' + 
		getQR(item) + 
		'">' + 
		'</a>';
	var thumb = 
		'<img class="thumb" src="' + 
		getThumb(item) + 
		'" width="50">';
	var link = '<a href="' + item.newUrl + '" target="_blank" >' + 
		thumb +
		item.name + 
		'</a>';

	var node = '<li class="resource">' + 
		removeIcon + 
		link +
		qrcode +
		'</li>';

	return node;
}

var renderResourceList = function(resources){
	srcList.innerHTML = '';
	for(var i=0;i<resources.length;i++){
		srcList.innerHTML = createNode(resources[i]) + srcList.innerHTML;
	}

	var resources = srcList.getElementsByClassName("resource");

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

qrChecker.addEventListener('click', function(e){
	if(this.className === 'qr-off'){
		this.className = 'qr-on';
		srcList.className = 'qr';
	}else{
		this.className = 'qr-off';
		srcList.className = '';
	}
});

