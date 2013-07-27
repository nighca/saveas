
/*
 * GET home page.
 */
var fs = require('fs'),
    qiniu = require('qiniu'),
    readOF = require("../readof");

var retFault = function(res, err){
    console.error("err: ", err);
    return res.json({
        ok: false,
        data: err
    });
};

var retRes = function(res, data){
    console.error("res: ", data);
    return res.json({
        ok: true,
        data: data
    });
};

exports.index = function(req, res){
    retRes(res);
};

exports.saveas = function(req, res){
    var config = req.body.config, 
        resource = req.body.resource;
    if(!config || !resource){
        retFault(res, 'Param Wrong!');
    }

    var bucket = config.bucket,
        uploadToken = config.UploadToken,
        key = resource.name,
        fileURL = resource.url;
    if(!bucket || !uploadToken || !key || !fileURL){
        retFault(res, 'Param Wrong!');
    }

    var filePath = "temp" + parseInt(Math.random()*10000, 10);

    var conn = new qiniu.digestauth.Client();
    var rs = new qiniu.rs.Service(conn, bucket);

    var localFile = filePath,
        customMeta = "",
        callbackParams = {"bucket": bucket, "key": key},
        enableCrc32Check = false,
        mimeType = "application/octet-stream";

    console.log(key);
    readOF.read(fileURL,localFile,function(error, data){ //Get the file
        if(error){
            retFault(res, error);
            return;
        }
        rs.uploadFileWithToken(
            uploadToken, 
            localFile, 
            key, 
            mimeType, 
            customMeta, 
            callbackParams, 
            enableCrc32Check, 
            function(resp){
                fs.unlink(localFile);//delete the temp file

                if (resp.code != 200) {
                    retFault(res, resp);
                    return;
                }

                retRes(res, {
                    url: "http://" + config.domain + "/" + key
                });
        });
    });
};