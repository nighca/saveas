//init
var config_in = document.getElementById("config_in");
var remoteHost_in = document.getElementById("remoteHost_in");
var accessKey_in = document.getElementById("accessKey_in");
var secretKey_in = document.getElementById("secretKey_in");
var domain_in = document.getElementById("domain_in");
var bucket_in = document.getElementById("bucket_in");

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
}


var submit_config = document.getElementById("submit_config");
submit_config.addEventListener("click", function(event){

	localStorage["remoteHost"] = remoteHost_in.value;

	var req = new XMLHttpRequest();
	req.open("GET", remoteHost_in.value, true);
	req.send();

	req.onreadystatechange = function(){
		if(this.readyState == 4){
			try{
				var resp = JSON.parse(this.responseText);
				if(!resp.ok){
					alert("Invalid remote host. (wrong response)");
				}
			}catch(e){
				console.log(e);
				alert("Invalid remote host. (no response)");
			}
			
		}
	};

	localStorage["accessKey"] = accessKey_in.value;
	localStorage["secretKey"] = secretKey_in.value;
	localStorage["domain"] = domain_in.value;
	localStorage["bucket"] = bucket_in.value;

	//window.location.reload();
});