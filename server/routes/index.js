
/*
 * GET home page.
 */
var fs = require('fs'),
	qiniu = require('qiniu'),
	readOF = require("readof");



exports.index = function(req, res){
	var fileURL = 'http://www.baidu.com/img/baidu_sylogo1.gif';
	var filePath = 'temp_test';
	var response = {};
	
	readOF.read(fileURL,filePath,function(data,error){ //Get the file
	    if(error){
	    	console.log("get remote file error: ", error);
	    	response.ok = false;
	    	response.data = error;
	    	res.json(response);
	    }else{
	    	response.ok = true;
	    	res.json(response);
	    }
	});
};

exports.saveas = function(req, res){
	var response = {};

	var config = req.body.config;
  	var resource = req.body.resource;

	var fileURL = resource.url;
	var filePath = "temp_" + resource.name;

  	// 配置密钥
	qiniu.conf.ACCESS_KEY = config.accessKey;
	qiniu.conf.SECRET_KEY = config.secretKey;

	// 实例化带授权的 HTTP Client 对象
	var conn = new qiniu.digestauth.Client();

	// 实例化 Bucket 操作对象
	var bucket = config.bucket;
	var rs = new qiniu.rs.Service(conn, bucket);

	// 上传文件第1步
	// 生成上传授权凭证（uploadToken）
	var opts = {
	    scope: bucket,
	    expires: 3600
	};
	var token = new qiniu.auth.UploadToken(opts);
	var uploadToken = token.generateToken();

	// 上传文件第2步
	// 组装上传文件所需要的参数
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
	    	// 上传文件第3步
			// 上传文件
			rs.uploadFileWithToken(uploadToken, localFile, key, mimeType, customMeta, callbackParams, enableCrc32Check, function(resp){
			    fs.unlink(localFile);//delete the temp file

			    console.log("\n===> Upload File with Token result: ", resp);
			    if (resp.code != 200) {
	    			response.ok = false;
	    			response.data = resp;
	    			res.json(response);
			        return;
			    }

			    /*
			    // 查看已上传文件属性信息
			    rs.stat(key, function(resp) {
			        console.log("\n===> Stat result: ", resp);
			        if (resp.code != 200) {
			            // ...
			            return;
			        }
			    });
			*/

			    /*
			    // 获取文件下载链接（含文件属性信息）
				var saveAsFriendlyName = key;
				rs.get(key, saveAsFriendlyName, function(resp) {
				    console.log("\n===> Get result: ", resp);

				    

				    if (resp.code != 200) {
				        // ...
				        return;
				    }
				});
				*/

				// 将bucket的内容作为静态内容发布
				var DEMO_DOMAIN = bucket + '.qiniudn.com';
				rs.publish(DEMO_DOMAIN, function(resp){
				    console.log("\n===> Publish result: ", resp);

				    

				    if (resp.code != 200){
				    	response.ok = false;
	    				response.data = resp;
	    				res.json(response);
				        clear(rs);
				    }else{
				    	response.ok = true;
	    				response.data = {
							url: "http://" + DEMO_DOMAIN + "/" + key
						};
						res.json(response);
				    	
						return;
				    }
				});

			});

	    }
	});
};