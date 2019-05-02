'use strict'

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

// const db = 'mongodb://localhost/test'

/**
 * mongoose连接数据库
 * @type {[type]}
 */
mongoose.Promise = require('bluebird')
// mongoose.connection.openUri(db)
mongoose.connect('mongodb://localhost/test')

/**
 * 获取数据库表对应的js对象所在的路径
 * @type {[type]}
 */
const models_path = path.join(__dirname, '/app/models')


/**
 * 已递归的形式，读取models文件夹下的js模型文件，并require
 * @param  {[type]} modelPath [description]
 * @return {[type]}           [description]
 */
var walk = function(modelPath) {
  fs
    .readdirSync(modelPath)
    .forEach(function(file) {
      var filePath = path.join(modelPath, '/' + file)
      var stat = fs.statSync(filePath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(filePath)
        }
      }
      else if (stat.isDirectory()) {
        walk(filePath)
      }
    })
}
walk(models_path)

require('babel-register')
const Koa = require('koa')
const logger = require('koa-logger')
const session = require('koa-session')
const bodyParser = require('koa-bodyparser')
var cors = require('koa2-cors');
const app = new Koa()

// const server = require('http').Server(app);
// const io = require('socket.io')(server);
// const socket = require('./app/controllers/socket')

app.keys = ['tindy']
app.use(logger())
app.use(session(app))
app.use(bodyParser())
app.use(cors())




/**
 * 使用路由转发请求
 * @type {[type]}
 */
const router = require('./config/router')()

app
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(4400)

// const server = require('http').Server(app);
const Server = require('socket.io')
const io = new Server(4200)
//上线人数
var hashName = new Array()
io.on('connection', (socket) => {
  console.log('连接建立')
  // 群聊
  socket.on('sendGroupMsg', function (data) {
    socket.emit('receiveGroupMsg', data);
  });

  // 上线
  socket.on('online', data => {
    console.log('name', data)
    // hashName.push(socket.id)
    hashName[data._id] = socket.id
    console.log('hashName', hashName);
  });
  //向指定用户发送消息(同时在线上)
  socket.on('sayTo', data => {
    console.log(io.sockets.sockets.hasOwnProperty(data.fid))
    if(hashName.hasOwnProperty(data.fid) && io.sockets.sockets[hashName[data.fid]]) {
      var toSocket = io.sockets.sockets[hashName[data.fid]]
      console.log('receive', data)
      toSocket.emit('message', data)
    }
  });
})
console.log('app started at port 4400...');