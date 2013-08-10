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


var listResource = function(callback, marker, limit, prefix){
    limit = limit || MAX_LIST_NUM;
    getConfig(function(remoteHost, accessKey, secretKey, domain, bucket){
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

var resource_list = function(){
    var resources = [];
    return {
        load : function(callback){
            var _this = this;

            listResource(function(err, resp, domain){
                if(!err){
                    _this.clean();
                    var items = resp.items.sort(function(a, b){
                        return a.putTime > b.putTime ? 1 : -1;
                    });
                    for (var i = 0, l = items.length; i < l; i++) {
                        console.log(items[i].key, new Date(items[i].putTime/10000));
                        if(i >= 1){
                            console.log(items[i].putTime - items[i-1].putTime);
                        }
                        _this.add({
                            name : items[i].key,
                            newUrl : "http://" + domain + "/" + items[i].key
                        });
                    };
                }
                callback && callback(err, resources);
            });
        },
        clean : function(){
            return resources = [];
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

var filter = function(list, keyword){
    if(!keyword){
        return list;
    }

    var result = [];
    var pattern = new RegExp(keyword.toLowerCase());

    for (var i = 0, l = list.length; i < l; i++) {
        if(pattern.test(list[i].name.toLowerCase())){
            result.push(list[i]);
        }
    };
    return result;
};