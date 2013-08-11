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
