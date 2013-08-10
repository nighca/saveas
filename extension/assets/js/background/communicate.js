
//-------------------------------------------- listen --------------------------------------------

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    
    if(request.type === "get_resources"){ //send resources to popup

        if(!request.refresh){
            sendResponse({
                ok : true,
                resources : filter(resource_list.getAll(), request.keyword)
            });
        }else{
            resource_list.load(function(err, resources){
                sendResponse({
                    ok : !err,
                    resources : filter(resources, request.keyword)
                });
            });
        }

        return true;
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
                sendResponse({
                    ok : !err,
                    data : err
                });

                return;
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

