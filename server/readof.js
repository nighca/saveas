/**
 *读取远程文件到指定路径并提供回调
 *@param targetUrl string 要读取的图片的路径
 *@param targetPath string 目标存储路径，写完整，类型自行判断，无法根据content-type判断，可伪装
 *@param callback function 回调方法，写入完成或者出错的时候回调 callback(info,error) 
 *回调数据 出错时为空对象{}，成功时为 {
                        targetPath:targetPath,
                        targetUrl:targetUrl
                    }
 *@author yutou 
 *@email xinyu198736@gmail.com
 *@blog http://www.html-js.com
 *@source https://bitbucket.org/xinyu198736/readonlinefile/wiki/Home
 */

var getDataFrom = function(response, callback){
    var resultBuffer = new Buffer(response.headers["content-length"]*1 + 2);
    var buffers = [];

    response.on('end', function () {
        var i = 0, size = buffers.length, pos = 0;
        for (i = 0; i < size; i++){
            buffers[i].copy(resultBuffer, pos);
            pos += buffers[i].length;
        }
        callback && callback(null, resultBuffer);
    });

    response.on('data', function (chunk) {
        buffers.push(new Buffer(chunk));
    });
};

var read = function (targetUrl,targetPath,callback) {
    "use strict";
    callback = callback || function () {};
    var http = require('http');
    var url = require('url');
    var fs=require("fs");
    /* var mime= {
        "text/css":"css",
        "image/gif":"gif",
        "text/html":"html",
        "image/x-icon":"ico",
        "image/jpeg":"jpeg",
        "image/jpeg":"jpg",
        "text/javascript":"js",
        "application/json":"json",
        "application/pdf":"pdf",
        "image/png":"png",
        "image/svg+xml":"svg",
        "application/x-shockwave-flash":"swf",
        "image/tiff":"tiff",
        "text/plain":"txt",
        "audio/x-wav":"wav",
        "audio/x-ms-wma":"wma",
        "video/x-ms-wmv":"wmv",
        "text/xml":"xml"
    };*/
    var urlData = url.parse(targetUrl);
    var options = {
        hostname: urlData.hostname,
        port: urlData.port,
        path: urlData.path,
        method: 'GET'
    };
    var request = http.request(options, function(response){
        console.log(response.statusCode);
        switch(parseInt(response.statusCode, 10)){
        case 200: 
            getDataFrom(response, function(err, resultBuffer){
                if(err){
                    callback.call(response, err);
                    return ;
                }
                try {
                    fs.writeFile(targetPath, resultBuffer, function (e) {
                        if (e) {
                            callback.call(response,new Error("readOnlineFile write file error: " + e.message + " "));
                        }
                        callback.call(response, null, {
                            targetPath: targetPath,
                            targetUrl: targetUrl
                        });
                    });
                } catch (e) {
                    callback.call(response,new Error("readOnlineFile write file error: " + e.message + " "));
                }
            });
            break;
        case 302:
            read(response.headers['location'], targetPath, callback);
            break;
        default:
            callback.call(response, new Error("readOnlineFile " + response.statusCode + " request at " + targetUrl + " "));
            return ;
        }
    });

    request.end();
};

exports.read = read;