var BASE64={
	
	enKey: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
	
	deKey: new Array(
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
		52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
		-1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
		15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
		-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
		41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
	),
	
	encode: function(src){
		//用一个数组来存放编码后的字符，效率比用字符串相加高很多。
		var str=new Array();
		var ch1, ch2, ch3;
		var pos=0;
	   //每三个字符进行编码。
		while(pos+3<=src.length){
			ch1=src.charCodeAt(pos++);
			ch2=src.charCodeAt(pos++);
			ch3=src.charCodeAt(pos++);
			str.push(this.enKey.charAt(ch1>>2), this.enKey.charAt(((ch1<<4)+(ch2>>4))&0x3f));
			str.push(this.enKey.charAt(((ch2<<2)+(ch3>>6))&0x3f), this.enKey.charAt(ch3&0x3f));
		}
		//给剩下的字符进行编码。
		if(pos<src.length){
			ch1=src.charCodeAt(pos++);
			str.push(this.enKey.charAt(ch1>>2));
			if(pos<src.length){
				ch2=src.charCodeAt(pos);
				str.push(this.enKey.charAt(((ch1<<4)+(ch2>>4))&0x3f));
				str.push(this.enKey.charAt(ch2<<2&0x3f), '=');
			}else{
				str.push(this.enKey.charAt(ch1<<4&0x3f), '==');
			}
		}
	   //组合各编码后的字符，连成一个字符串。
		return str.join('');
	},
	
	decode: function(src){
		//用一个数组来存放解码后的字符。
		var str=new Array();
		var ch1, ch2, ch3, ch4;
		var pos=0;
	   //过滤非法字符，并去掉'='。
		src=src.replace(/[^A-Za-z0-9\+\/]/g, '');
		//decode the source string in partition of per four characters.
		while(pos+4<=src.length){
			ch1=this.deKey[src.charCodeAt(pos++)];
			ch2=this.deKey[src.charCodeAt(pos++)];
			ch3=this.deKey[src.charCodeAt(pos++)];
			ch4=this.deKey[src.charCodeAt(pos++)];
			str.push(String.fromCharCode(
				(ch1<<2&0xff)+(ch2>>4), (ch2<<4&0xff)+(ch3>>2), (ch3<<6&0xff)+ch4));
		}
		//给剩下的字符进行解码。
		if(pos+1<src.length){
			ch1=this.deKey[src.charCodeAt(pos++)];
			ch2=this.deKey[src.charCodeAt(pos++)];
			if(pos<src.length){
				ch3=this.deKey[src.charCodeAt(pos)];
				str.push(String.fromCharCode((ch1<<2&0xff)+(ch2>>4), (ch2<<4&0xff)+(ch3>>2)));
			}else{
				str.push(String.fromCharCode((ch1<<2&0xff)+(ch2>>4)));
			}
		}
	   //组合各解码后的字符，连成一个字符串。
		return str.join('');
	}
};

var base64ToUrlsafe = function(v) {
	return v.replace(/\//g, '_').replace(/\+/g, '-');
};

var encode = function(v) {
	var encoded = BASE64.encode(v);
	return base64ToUrlsafe(encoded);
};

function UploadToken(opts) {
  this.scope = opts.scope || null;
  this.expires = opts.expires || 3600;
  this.callbackUrl = opts.callbackUrl || null;
  this.callbackBodyType = opts.callbackBodyType || null;
  this.customer = opts.customer || null;
}

UploadToken.prototype.generateSignature = function() {
  var params = {
	"scope": this.scope,
	"deadline": this.expires + Math.floor(Date.now() / 1000),
	"callbackUrl": this.callbackUrl,
	"callbackBodyType": this.callbackBodyType,
	"customer": this.customer,
  };
  var paramsString = JSON.stringify(params)
  return encode(paramsString);
};

UploadToken.prototype.generateEncodedDigest = function(signature) {
  var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, localStorage["secretKey"]);

  hmac.update(signature);

  var hash = hmac.finalize();
  var str = hash.toString(CryptoJS.enc.Base64);

  return base64ToUrlsafe(str);
};

UploadToken.prototype.generateToken = function() {
  var signature = this.generateSignature();
  var encoded_digest = this.generateEncodedDigest(signature);
  return localStorage["accessKey"] + ":" + encoded_digest + ":" + signature;
};


// ------------------------------------------------------------------------------------------

var stringifyPrimitive = function(v) {
  if (typeof v === 'string') return v;
  if (typeof v === 'boolean'){
	if(v) return 'true';
	return 'false';
  }
  if (typeof v === 'number' && isFinite(v)) {
	return v;
  }
  return '';
};

var querystringify = function (obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
	obj = undefined;
  }

  if (typeof obj === 'object') {
	return Object.keys(obj).map(function(k) {
	  var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	  if (Array.isArray(obj[k])) {
		return obj[k].map(function(v) {
		  return ks + encodeURIComponent(stringifyPrimitive(v));
		}).join(sep);
	  } else {
		return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	  }
	}).join(sep);
  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
}

// func checksum
function checksum(path, body) {
  /*
	var hmac = crypto.createHmac('sha1', conf.SECRET_KEY);
	hmac.update(path + "\n");
	if (body) {
		hmac.update(body);
	}
	var digest = hmac.digest('base64');
	return util.base64ToUrlsafe(digest);
	*/

	var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, localStorage["secretKey"]);

	hmac.update(path + "\n");
	if (body) {
		hmac.update(body);
	}

	var hash = hmac.finalize();
	var str = hash.toString(CryptoJS.enc.Base64);

	return base64ToUrlsafe(str);
}

function AccessToken(url, params) {
	var parse = url.match(/^(([a-z]+):\/\/)?([^\/\?#]+)\/*([^\?#]*)\??([^#]*)#?(\w*)$/i);  

	this.path = parse[4];
	this.body = "";
	if (typeof params === 'string') {
		this.body = params;
	} else {
		this.body = querystringify(params);
	}
}

AccessToken.prototype.generateToken = function() {
  return localStorage["accessKey"] + ':' + checksum(this.path, this.body);
};