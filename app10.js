var express = require('express')
, http = require('http')
, path = require('path');
var bodyParser = require('body-parser')
, static = require('serve-static');
var expressErrorHandler = require('express-error-handler');

var app = express();
var router = express.Router();

app.set('port', process.env.PORT || 3000);

// body-parser 를 사용해 application/x-www-from-urlencoded 파싱
app.use(bodyParser.urlencoded( { extended : false }));

// body-parser 를 사용해 application/json 파싱
app.use(bodyParser.json());

app.use(static(path.join(__dirname, 'public')));


router.route('/process/login').post(function(req, res){
	console.log('/process/login 처리함');

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	res.writeHead(200, { 'Content-Type' : 'text/html;charset=utf8'});
	res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param id : ' + paramId + '</p></div>');
	res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
	res.write('<div><a hrep="/public/login2.html">로그인 페이지로 돌아가기</a></div>');
	res.end();
});


router.route('/process/users/:id').get(function(req, res){
	console.log('/process/users/:id 처리함');

//URL 파라미터 확인
	var paramId = req.params.id;

	console.log('/process/users와 토큰 %s를 이용해 처리함', paramId);

	res.writeHead(200, { 'Content-Type' : 'text/html;charset=utf8'});
	res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param id : ' + paramId + '</p></div>');
	res.end();
});


app.use('/', router);


// 모든 router 처리 끝난 후 404 오류 페이지 처리
var errorHandler = expressErrorHandler({
	static : { '404' : './public/404.html' }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

http.createServer(app).listen(3000, function(){
	console.log('Express 서버가 3000번 포트에서 시작됨');
});
