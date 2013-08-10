var default_cfg = {
   remoteHost : "http://saveas.nighca.me/"
};
var qiniuHost = {
    rs: 'http://rs.qbox.me',
    rsf: 'http://rsf.qbox.me'
};

const MAX_LIST_NUM = 1000;

var checkConfig = function(){
    if(!localStorage["remoteHost"] || !localStorage["accessKey"] || !localStorage["secretKey"] || !localStorage["domain"] || !localStorage["bucket"]){
        chrome.tabs.create({
            url: './pages/options.html'
        });
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