var _mysql = require('mysql');

if(process.env.VCAP_SERVICES){
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var db_info = env["mysql-5.1"][0]["credentials"];
	var HOST = db_info["host"];
	var PORT = db_info["port"];
	var MYSQL_USER = db_info["username"];
	var MYSQL_PASS = db_info["password"];
	var DATABASE = db_info["name"];
}else{
	var HOST = 'localhost';
	var PORT = 3306;
	var MYSQL_USER = 'root';
	var MYSQL_PASS = '';
	var DATABASE = 'SaveAs';
}

var TABLE = 'resources';

var mysql = _mysql.createClient({
    host: HOST,
    port: PORT,
    user: MYSQL_USER,
    password: MYSQL_PASS,
});

mysql.query('create database ' + DATABASE + ';', function(err, results, fields) {
	    if(err){
	    	//console.log("When create database: ", err);
	    }else{
	    	console.log("Database created.");
	    }
	});
mysql.query('use ' + DATABASE);
mysql.query('create table ' + TABLE + '(id int NOT NULL auto_increment, content nvarchar(8000), name nvarchar(40), theKey varchar(20), primary key(id));', function(err, results, fields) {
	    if(err){
	    	//console.log("When create table: ", err);
	    }else{
	    	console.log("Table created.");
	    }
	});

exports.insert = function(content, name, theKey, callback){
	content = escape(content);
	mysql.query('insert into ' + 
		TABLE +
		' (content, name, theKey) values ("' + 
		content + 
		'", "' + 
		name + 
		'", "' +
		theKey + 
		'")',function(err, results, fields) {
		    if(err){
		    	callback.fail(err);
		    }else{
		    	callback.succeed(results.insertId);
		    }
		});
};

exports.get_name = function(id, callback){
	mysql.query('select name from ' + TABLE + ' where id=' + id,
		function(err, results, fields) {
		    if (err){
		    	callback.fail(err);
		    }else {
		    	if(results.length < 1){
		    		callback.fail("Failed, no such record!");
		    	}else{
			        var col = results[0];
			        //console.log("get_name: result: ", results)
			        callback.succeed(col.name);
		    	}
		    }
		});
};

exports.get = function(id, theKey, callback){
	mysql.query('select * from ' + TABLE + ' where id=' + id,
		function(err, results, fields) {
		    if (err){
		    	callback.fail(err);
		    }else {
		    	if(results.length < 1){
		    		callback.fail("Failed, no such record!");
		    	}else{
			        var col = results[0];
			        if(theKey == col.theKey){
			        	callback.succeed(unescape(col.content), col.name);
			        }else{
			        	callback.fail("Failed, theKey wrong!");
			        }
		    	}
		    }
		});
};

exports.get_public = function(callback){
	mysql.query('select * from ' + TABLE + ' where theKey=""',
		function(err, results, fields) {
		    if (err){
		    	callback.fail(err);
		    }else {
		        callback.succeed(results);
		    }
		});
};

exports.get_all = function(callback){
	mysql.query('select * from ' + TABLE,
		function(err, results, fields) {
		    if (err){
		    	callback.fail(err);
		    }else {
		        callback.succeed(results);
		    }
		});
};

exports.update = function(id, content, name, theKey, callback){
	content = escape(content);

	mysql.query('update ' + TABLE + 
		' set content="' + content + 
		'", name="' + name + 
		'", theKey="' + theKey + 
		'" where id=' + id,function(err, results, fields) {
		    if(err){
		    	callback.fail(err);
		    }else{
		    	callback.succeed(results.message);
		    }
		});
};

exports.delete = function(id, theKey, callback){
	console.log('delete from ' + TABLE + ' where id=' + id +' and theKey="' + theKey +'"');
	mysql.query('delete from ' + TABLE + ' where id=' + id +' and theKey="' + theKey +'"',
		function(err, results, fields) {
		    if (err){
		    	callback.fail(err);
		    }else {
		    	callback.succeed();
		    }
		});
};