const {
	src,
	dest,
	series,
	watch,
	parallel
} = require("gulp");

const gulpif = require('gulp-if');
const spritesmith = require('gulp.spritesmith');
const del = require("del");
const webserver = require("gulp-webserver");

const production = false; //是否生产环境
// .pipe(gulpif(production, xxxxxxxxxx())) //生产环境才执行
const distDir = './xcx';
const srcDir = './client';

// const srchttp = 'https://vision-pub.oss-cn-zhangjiakou.aliyuncs.com/';
const srchttp = 'https://vision-dev1.oss-cn-zhangjiakou.aliyuncs.com/';

// 清图片缓存，加版本号
var myDate = new Date();
var month = myDate.getMonth() < 10 ? "0" + (myDate.getMonth() + 1) : (myDate.getMonth() + 1);
var day = myDate.getDate() < 10 ? "0" + myDate.getDate() : myDate.getDate();

var hours = myDate.getHours() < 10 ? "0" + myDate.getHours() : myDate.getHours();
var minutes = myDate.getMinutes() < 10 ? "0" + myDate.getMinutes() : myDate.getMinutes();
var timestamp = myDate.getFullYear() + "" + month + "" + day + "" + hours + "" + minutes;


function clean(cb) {
	return del([distDir+"/images"]); //删除指定的目录，为转存文件做准备
}

// 小图标合成
function revSpriteSmall() {
	console.log('处理雪碧图');
	return src([srcDir + '/small/*']) //需要合并的图片地址
	  .pipe(spritesmith({
		imgName: '../images/small.png', //保存合并后图片的地址
		cssName: '../wxss/small.wxss', //保存合并后对于css样式的地址
		padding: 40, //合并时两个图片的间距
		algorithm: 'binary-tree', //注释1
		cssTemplate: (data) => {
			// data为对象，保存合成前小图和合成打大图的信息包括小图在大图之中的信息
			let arr = [],
				width = data.spritesheet.width,
				height = data.spritesheet.height,
				url = srchttp + "small.png";
			// url = data.spritesheet.image;

			data.sprites.forEach(function (sprite) {
				arr.push(
					".icon-" + sprite.name +
					"{" +
					"background: url('" + url + "?v=" + timestamp + "') " +
					"no-repeat " +
					(sprite.offset_x+1) + "rpx " + (sprite.offset_y+1) + "rpx;" +
					"background-size: " + width + "rpx " + height + "rpx;" +
					"width: " + (sprite.width + 4) + "rpx;" +
					"height: " + (sprite.height + 4) + "rpx;" +
					"}\n"
				)
			})
			// return "@fs:108rem;\n"+arr.join("")
			return arr.join("")
		}
	  }))
	  .pipe(dest(distDir + '/images/'))
}

// 中等图合成
function revSpriteMiddle() {
	console.log('处理雪碧图');
	return src([srcDir + '/middle/*']) //需要合并的图片地址
	  .pipe(spritesmith({
		imgName: '../images/middle.png', //保存合并后图片的地址
		cssName: '../wxss/middle.wxss', //保存合并后对于css样式的地址
		padding: 40, //合并时两个图片的间距
		algorithm: 'binary-tree', //注释1
		cssTemplate: (data) => {
			// data为对象，保存合成前小图和合成打大图的信息包括小图在大图之中的信息
			let arr = [],
				width = data.spritesheet.width,
				height = data.spritesheet.height,
				url = srchttp + "middle.png";
			// url = data.spritesheet.image;

			data.sprites.forEach(function (sprite) {
				arr.push(
					".icon-" + sprite.name +
					"{" +
					"background: url('" + url + "?v=" + timestamp + "') " +
					"no-repeat " +
					(sprite.offset_x + 6) + "rpx " + (sprite.offset_y + 6) + "rpx;" +
					"background-size: " + (width+6) + "rpx " + (height+6) + "rpx;" +
					"width: " + (sprite.width + 12) + "rpx;" +
					"height: " + (sprite.height + 12) + "rpx;" +
					"}\n"
				)
			})
			// return "@fs:108rem;\n"+arr.join("")
			return arr.join("")
		}
	  }))
	  .pipe(dest(distDir + '/images/'))
}

// 大等图合成
function revSpriteLarge() {
	console.log('处理雪碧图');
	return src([srcDir + '/nosize/*']) //需要合并的图片地址
	  .pipe(spritesmith({
		imgName: '../images/nosize.png', //保存合并后图片的地址
		cssName: '../wxss/nosize.wxss', //保存合并后对于css样式的地址
		padding: 40, //合并时两个图片的间距
		algorithm: 'binary-tree', //注释1
		cssTemplate: (data) => {
			// data为对象，保存合成前小图和合成打大图的信息包括小图在大图之中的信息
			let arr = [],
				width = data.spritesheet.width,
				height = data.spritesheet.height,
				url = srchttp + "nosize.png";
			// url = data.spritesheet.image;

			data.sprites.forEach(function (sprite) {
				arr.push(
					".icon-" + sprite.name +
					"{" +
					"background: url('" + url + "?v=" + timestamp + "') " +
					"no-repeat " +
					sprite.offset_x + "rpx " + sprite.offset_y + "rpx;" +
					"background-size: " + width + "rpx " + height + "rpx;" +
					"width: " + sprite.width + "rpx;" +
					"height: " + sprite.height + "rpx;" +
					"}\n"
				)
			})
			// return "@fs:108rem;\n"+arr.join("")
			return arr.join("")
		}
	  }))
	  .pipe(dest(distDir + '/images/'))
}

// 中等图合成
function revSpriteUser() {
	console.log('处理雪碧图');
	return src([srcDir + '/user/*']) //需要合并的图片地址
	  .pipe(spritesmith({
		imgName: '../images/user.png', //保存合并后图片的地址
		cssName: '../wxss/user.wxss', //保存合并后对于css样式的地址
		padding: 40, //合并时两个图片的间距
		algorithm: 'binary-tree', //注释1
		cssTemplate: (data) => {
			// data为对象，保存合成前小图和合成打大图的信息包括小图在大图之中的信息
			let arr = [],
				width = data.spritesheet.width,
				height = data.spritesheet.height,
				url = srchttp + "user.png";
			// url = data.spritesheet.image;

			data.sprites.forEach(function (sprite) {
				arr.push(
                    ".icon-" + sprite.name +
                    "{" +
                    "background: url('" + url + "?v=" + timestamp + "') " +
                    "no-repeat " +
                    (sprite.offset_x + 3) + "rpx " + (sprite.offset_y + 3) + "rpx;" +
                    "background-size: " + width + "rpx " + height + "rpx;" +
                    "width: " + (sprite.width + 6) + "rpx;" +
                    "height: " + (sprite.height + 6) + "rpx;" +
                    "}\n"
                )
			})
			// return "@fs:108rem;\n"+arr.join("")
			return arr.join("")
		}
	  }))
	  .pipe(dest(distDir + '/images/'))
}
function serve() {
	src("./").pipe(
		webserver({
			host: "localhost",
			port: 368,
			livereload: true, // 实时重新加载
			open: distDir+"/index.html", // 启动时默认浏览器打开的文件
			directoryListing: {
				enable: true,
				path: distDir,
			},
			proxies: [{
				source: "/film",
				target: "https://api.iynn.cn/film/", // 代理的域名
			}, ],
		})
	);
}

const Run = series(
	// clean,
	parallel(revSpriteSmall, revSpriteMiddle, revSpriteLarge, revSpriteUser),
)

watch([srcDir+'/'], Run);
exports.server = series(Run, serve);