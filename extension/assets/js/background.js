var default_cfg = {
   remoteHost : "http://saveas.nighca.me/"
};
var qiniuHost = {
    rs: 'http://rs.qbox.me',
    rsf: 'http://rsf.qbox.me'
};

var checkConfig = function(){
    if(!localStorage["remoteHost"] || !localStorage["accessKey"] || !localStorage["secretKey"] || !localStorage["domain"] || !localStorage["bucket"]){
        alert("config needed!");
        return false;
    }
    return true;
};

var getConfig = function(callback){
    if(!checkConfig()){
        return false;
    }

    var remoteHost = localStorage["remoteHost"];
    var accessKey = localStorage["accessKey"];
    var secretKey = localStorage["secretKey"];
    var domain = localStorage["domain"];
    var bucket = localStorage["bucket"];

    callback && callback(remoteHost, accessKey, secretKey, domain, bucket);
};

var genUploadToken = function(bucket, accessKey, secretKey){
    var uploadTokenOpts = {
        scope: bucket,
        expires: 60,
        accessKey: accessKey,
        secretKey: secretKey
    };
    var uploadTokenGenerator = new UploadToken(uploadTokenOpts);
    return uploadTokenGenerator.generateToken();
};

var genAccessToken = function(url, accessKey, secretKey){
    var accessTokenOpts = {
        url: url,
        params: '',
        accessKey: accessKey,
        secretKey: secretKey
    };
    var accessTokenGenerator = new AccessToken(accessTokenOpts);
    return accessTokenGenerator.generateToken();
};

var noticeFlash = function(type, content, imgUrl){
    var notification = webkitNotifications.createNotification(
        imgUrl, 
        type, 
        content
    );
    notification.show();
    setTimeout(function(){
        notification.cancel();
    }, 4000);
};

var getList = function(callback){
    getConfig(function(remoteHost, accessKey, secretKey, domain, bucket){
        var marker, limit, prefix;
        var url = qiniuHost.rsf + '/list';
        url += '?bucket=' + bucket;
        url += '&marker=' + (marker || '');
        url += '&limit=' + (limit || '');
        url += '&prefix=' + (prefix || '');
        var accessToken = genAccessToken(url, accessKey, secretKey);
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            headers: {
                Authorization: 'QBox ' + accessToken
            },
            data: {},
            success: function(resp){
                callback && callback(null, resp, domain);
            },
            error: function(err){
                callback && callback(err);
            }
        });
    });
};

var resource_list = function(){
    var resources = [];
    return {
        load : function(callback){
            var _this = this;
            resources = [];
            getList(function(err, resp, domain){
                if(!err){
                    var items = resp.items;
                    for (var i = items.length - 1; i >= 0; i--) {
                        _this.add({
                            name : items[i].key,
                            newUrl : "http://" + domain + "/" + items[i].key
                        });
                    };
                }
                callback && callback(err, resources);
            });
        },
        add : function(resource){
            return resources.push(resource);
        },
        get : function(name){
            for (var i = resources.length - 1; i >= 0; i--) {
                if(resources[i].name == name){
                    return resources[i];
                }
            }
            return null;
        },
        getAll : function(){
            return resources;
        }
    }
}();

localStorage["remoteHost"] = localStorage["remoteHost"] || default_cfg.remoteHost;

resource_list.load();

var sendResource = function(resource, callback){
    getConfig(function(remoteHost, accessKey, secretKey, domain, bucket){
        var uploadToken = genUploadToken(bucket, accessKey, secretKey);
        var QNConfig = {
            UploadToken : uploadToken, 
            bucket : bucket,
            domain : domain
        };
        $.ajax({
            url: remoteHost,
            type: "POST",
            dataType: "json",
            data: {
                resource: resource,
                config: QNConfig
            },
            success: function(resp){
                if(!resp.ok){
                    console.log("err:", resp);
                    callback && callback(resp.data);
                }else{
                    resource.newUrl = resp.data.url;
                    callback && callback(null, resource);
                }
            },
            error: function(err){
                console.log("err:", err);
                callback && callback(err);
            }
        });
    });
};

var removeResource = function(resource, callback){
    getConfig(function(remoteHost, accessKey, secretKey, domain, bucket){
        var entryURI = bucket + ':' + resource.name;
        var url = qiniuHost.rs + '/delete/' + encode(entryURI);
        var accessToken = genAccessToken(url, accessKey, secretKey);
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            headers: {
                Authorization: 'QBox ' + accessToken
            },
            data: {},
            success: function(resp){
                callback && callback(null, resp);
            },
            error: function(err){
                callback && callback(err);
            }
        });
    });
};


//-------------------------------------------- create menu option --------------------------------------------

var createProperties = {
    type : "normal",
    title : "Save As...",
    contexts : ["image", "video", "audio", "link"],
    onclick : function(info, tab) {

        var suffixMatch = /(\w+)(\.([a-zA-Z0-9]+)|)(\?|\@|$)/, res, resource;

        if(info.mediaType){ //"image", "video", "audio"
            res = suffixMatch.exec(info.srcUrl) || [];
            resource = {
                name : res[1] || 'noname',
                url : info.srcUrl,
                type : info.mediaType,
                suffix : res[2] || ''
            }
        }else{ //"link"
            res = suffixMatch.exec(info.linkUrl) || [];
            resource = {
                name : res[1] || 'noname',
                url : info.linkUrl,
                type : "page",
                suffix : res[2] || '.html'
            }
        }

        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendMessage(tab.id, {type: "notice" ,resource: resource}, function(response) {
                //console.log(response);
                if(response && response.name){
                    var new_name = response.name + resource.suffix;
                    resource.name = new_name;
                    sendResource(resource, function(err, resource){
                        if(err){
                            noticeFlash('Fail', JSON.stringify(err), null);
                            return;
                        }
                        resource_list.add(resource);
                        noticeFlash(
                            'Success', 
                            resource.type.toUpperCase() + ' ' + resource.name + " saved!", 
                            resource.type=="image" ? resource.newUrl : ''
                        );
                    });
                }
            });
        });
    }
}

var menuId = chrome.contextMenus.create(createProperties, function(){
    if(chrome.extension.lastError)
        console.log(chrome.extension.lastError);
});

//-------------------------------------------- listen --------------------------------------------

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    
    if(request.type === "get_resources"){ //send resources to popup

        sendResponse({
            ok : true,
            resources : resource_list.getAll()
        });

        return;
    }

    if(request.type === "remove_resource"){ //send resources to popup
        var resource = resource_list.get(request.resource.name);

        if(!resource){
            sendResponse({
                ok : false,
                data : "no such resource"
            });
        }else{
            removeResource(resource, function(err){
                if(err){
                    sendResponse({
                        ok : false,
                        data : err
                    });
                    return;
                }
                setTimeout(function(){
                    resource_list.load(function(err, resources){
                        if(err){
                            sendResponse({
                                ok : true,
                                data : null
                            });
                            return;
                        }
                        sendResponse({
                            ok : true,
                            data : resources
                        });
                    });
                }, 300);
            });
        }

        return true;
    }

    if(request.type === "refresh_config"){ //send resources to popup
        resource_list.load(function(err, resources){
            if(err){
                sendResponse({
                    ok : false,
                    data: err
                });
                return;
            }
            sendResponse({
                ok : true,
                data: resources
            });
        });

        return true;
    }
    
});

