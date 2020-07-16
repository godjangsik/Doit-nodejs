var express = require('express')
, http = require('http')
, path = require('path');
var bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static')
, errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');

var expressSession = require('express-session');

// 파일업로드용 미들웨어
var multer = require('multer');
var fs = require('fs');

// 클라이언트에서 ajax 로 요청했을 때 CORS(다중서버 접속) 지원
var cors = require('cors');


var app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded( { extended : false }));
app.use(bodyParser.json());

app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));


app.use(cookieParser());

app.use(expressSession({
	secret : 'my key',
	resave : true,
	saveUninitialized : true
}));

app.use(cors());


// multer 미들웨어 사용 : body-parser -> multer -> router 순서
// 파일제한 10개, 1G
var storage = multer.diskStorage({
	destination : function(req, file, callback){
		callback(null, 'uploads');
	},
	filename : function(req, file, callback){
		callback(null, file.originalname + Date.now());
	}
});

var upload = multer({
	storage : storage,
	limits : {
		files : 10,
		fileSize : 1024 * 1024 * 1024
	}
});



var router = express.Router();

router.route('/process/product').get(function(req, res){
	console.log('/process/product 호출됨');

	if(req.session.user){
		res.redirect('/product.html');
	}else{
		res.redirect('/login2.html');
	}
});


router.route('/process/login').post(function(req, res){
	console.log('/process/login 호출됨');

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	if(req.session.user){
		console.log('이미 로그인 되셨습니다.');

		res.redirect('/product.html');
	}else{
		req.session.user = {
				id : paramId,
				name : '소녀시대',
				authorized : true
		};

		res.writeHead('200', { 'Content-Type' : 'text/html;charset=utf8' });
		res.write('<h1>로그인 성공</h1>');
		res.write('<div><p>Param id : ' + paramId + '</p></div>');
		res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
		res.write('<br/><br/><a href="/process/product">로그인후 페이지로 이동</a>');
		res.end();
	}
});

router.route('/process/logout').get(function(req, res){
	console.log('/process/logout 호출됨');

	if(req.session.user){
		console.log('로그아웃합니다');

		req.session.destroy(function(err){
			if(err) { throw err; }

			console.log('세션을 삭제하고 로그아웃되었습니다.');
			res.redirect('/login2.html');
		});
	}else{
		console.log('로그인되지 않았습니다.');

		res.redirect('/login2.html');
	}
});



router.route('/process/photo').post(upload.array('photo', 1), function(req, res){
	console.log('/process/photo 호출됨');

	try{
		var files = req.files;

		console.log('#==== 업로드된 첫 번째 파일 정보 ====#');
		console.log(req.files[0]);
		console.log('#=====================#');


		var originalname = '';
		var filename = '';
		var mimetype = '';
		var size = 0;


		if(Array.isArray(files)){
			console.log('배열에 들어있는 파일 갯수 : %d', files.length);

			for(var idx=0; idx < files.length ; ++idx){
				originalname = files[idx].originalname;
				filename = files[idx].filename;
				mimetype = files[idx].mimetype;
				size = files[idx].size;
			}
		}

		console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', ' + mimetype + ', ' + size);


		res.writeHead('200', { 'Content-Type' : 'text/html;charset=utf8' });
		res.write('<h3>파일업로드성공</h3>');
		res.write('<hr/>');
		res.write('<p>원본파일이름 : ' + originalname + ' -> 저장파일명 : ' + filename + '</p>');
		res.write('<p>MIME TYPE : ' + mimetype + '</p>');
		res.write('<p>파일크기 : ' + size + '</p>');
		res.end();

	}catch(err){
		console.log(err.stack);
	}
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
