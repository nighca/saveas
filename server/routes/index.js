
/*
 * GET home page.
 */
var fs = require('fs'),
	qiniu = require('qiniu'),
	readOF = require("readof");



exports.index = function(req, res){
	var response = {};
	
	response.ok = true;
	res.json(response);
};

exports.saveas = function(req, res){
	var response = {};

	var config = req.body.config;
  	var resource = req.body.resource;

	var fileURL = resource.url;
	var filePath = "temp_file";

	var conn = new qiniu.digestauth.Client();

	var bucket = config.bucket;
	var rs = new qiniu.rs.Service(conn, bucket);

	var uploadToken = config.UploadToken;


	
	var key = resource.name + resource.suffix;

	var localFile = filePath,
	    customMeta = "",
	    callbackParams = {"bucket": bucket, "key": key},
	    enableCrc32Check = false,
	    mimeType = "application/octet-stream";

	
	readOF.read(fileURL,filePath,function(data,error){ //Get the file
	    if(error){
	    	console.log("get remote file error: ", error);
	    	response.ok = false;
	    	response.data = error;
	    	res.json(response);
	    }else{
			rs.uploadFileWithToken(uploadToken, localFile, key, mimeType, customMeta, callbackParams, enableCrc32Check, function(resp){
			    fs.unlink(localFile);//delete the temp file

			    console.log("\n===> Upload File with Token result: ", resp);
			    if (resp.code != 200) {
	    			response.ok = false;
	    			response.data = resp;
	    			res.json(response);
			        return;
			    }

			    response.ok = true;
				response.data = {
					url: "http://" + config.domain + "/" + key
				};
				res.json(response);

			});

	    }
	});

};