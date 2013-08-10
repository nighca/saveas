This tool helps to Save & Manage resources in page to [Qiniu Cloud Storage](http://www.qiniu.com/ "Qiniu").
======

 * Author:   nighca

 * Mail:     nighca@live.cn
 
结构
----

 * 服务端
 
   node.js + express

 * 客户端

   chrome extension

使用方法
----
   
 1.  chrome -> 管理扩展程序 -> 载入正在开发的扩展程序 -> 选择extension文件夹

 2.  chrome -> SaveAs -> 选项 -> 填入 accsessKey & secretKey, bucket ([七牛云存储](http://www.qiniu.com/ "Qiniu"))

 3.  remoteHost 默认 "http://saveas.nighca.me/" (服务器不记录个人信息，源代码见server/), 可以自己搭建服务器，服务器代码在server/下，运行方式：

 	$ npm install

 	$ node app.js

 	将地址填入 remoteHost
