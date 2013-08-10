//init
const ENTER_KEY_CODE = 13;

var config_in = document.getElementById("config_in");
var remoteHost_in = document.getElementById("remoteHost_in");
var accessKey_in = document.getElementById("accessKey_in");
var secretKey_in = document.getElementById("secretKey_in");
var domain_in = document.getElementById("domain_in");
var bucket_in = document.getElementById("bucket_in");

var infoWrapper = document.getElementById("info");

var submit_config = document.getElementById("submit_config");

var showInfo = function(info){
	infoWrapper.innerHTML = info;
};

remoteHost_in.value = localStorage["remoteHost"] || "";
accessKey_in.value = localStorage["accessKey"] || "";
domain_in.value = localStorage["domain"] || "";
secretKey_in.value = localStorage["secretKey"] || "";
bucket_in.value = localStorage["bucket"] || "";


//chosen when focus
var inputs = document.getElementsByTagName("input");
for(var i=0,l=inputs.length;i<l;i++){
	var input = inputs[i];
	input.addEventListener("click", function (event) {
		this.select();
	});
	input.addEventListener("keyup", function (event) {
		if(event.keyCode === ENTER_KEY_CODE){
			for (var i = 0, l = inputs.length; i < l; i++) {
				if(!inputs[i].value.trim()){
					inputs[i].click();
					break;
				}
			}
			if(i === l){
				this.blur();
				submit_config.click();
			}
		}
	});
}

bucket_in.addEventListener("keyup", function(){
	var bucket = this.value.trim();
	var domain = bucket ? bucket + '.qiniudn.com' : '';
	domain_in.value = domain;
});

var saveConfigAndRefresh = function(){
	localStorage["remoteHost"] = remoteHost_in.value;
	localStorage["accessKey"] = accessKey_in.value;
	localStorage["secretKey"] = secretKey_in.value;
	localStorage["domain"] = domain_in.value;
	localStorage["bucket"] = bucket_in.value;

	showInfo("Saved.");

	chrome.extension.sendMessage({type: "refresh_config"}, function(response){
		if(response.ok){
			showInfo("Refresh resource list finished.");
		}else{
			showInfo("Refresh resource list failed." + JSON.stringify(response.data));
		}
	});
};

var checkServer = function(host, callback){
	var req = new XMLHttpRequest();
	req.open("GET", host, true);
	req.send();

	req.onreadystatechange = function(){
		if(this.readyState == 4){
			try{
				var resp = JSON.parse(this.responseText);
				if(!resp.ok){
					callback && callback("Invalid remote host. (wrong response)");
					return;
				}
			}catch(e){
				callback && callback("Invalid remote host. (no response)");
				return;
			}
			callback && callback();
		}
	};
};

submit_config.addEventListener("click", function(event){
	showInfo("...");

	var remoteHost = remoteHost_in.value;
	if(remoteHost){
		checkServer(remoteHost, function(err){
			if(err){
				showInfo(err);
				return;
			}
			saveConfigAndRefresh();
		});
	}else{
		showInfo('Without remote server, you will not be able to save file.');
		saveConfigAndRefresh();
	}
});