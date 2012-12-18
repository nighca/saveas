//init
var accessKey, secretKey, bucket;
var config_in = document.getElementById("config_in");
var remoteHost_in = document.getElementById("remoteHost_in");
var accessKey_in = document.getElementById("accessKey_in");
var secretKey_in = document.getElementById("secretKey_in");
var bucket_in = document.getElementById("bucket_in");

remoteHost_in.value = localStorage["remoteHost"] || "";
accessKey_in.value = localStorage["accessKey"] || "";
secretKey_in.value = localStorage["secretKey"] || "";
bucket_in.value = localStorage["bucket"] || "";


var submit_config = document.getElementById("submit_config");
submit_config.addEventListener("click", function(event){

	localStorage["remoteHost"] = remoteHost_in.value;
	localStorage["accessKey"] = accessKey_in.value;
	localStorage["secretKey"] = secretKey_in.value;
	localStorage["bucket"] = bucket_in.value;

	window.location.reload();
});