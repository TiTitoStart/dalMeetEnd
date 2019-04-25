'use strict'

const Router = require('koa-router')
const User = require('../app/controllers/user')
const Moment = require('../app/controllers/moment')
const App = require('../app/controllers/app')

module.exports = function(){
	var router = new Router({
    prefix: '/api'
  })

  // user
  router.post('/signup', App.hasBody, User.signup)
  // router.post('/u/update', App.hasBody, App.hasToken, User.update)

  // DB Interface test
  router.post('/users/get', User.users)
  router.post('/users/update', App.hasBody, App.hasToken, User.update)
  router.post('/users/addlike', App.hasBody, App.hasToken, User.addLike)
  // router.post('/test/user/add',User.addUser)

  // router.post('/test/user/delete',User.deleteUser)

  router.post('/login', App.hasBody, User.login)

  /** 
   moment 关于状态
  **/
  //新增
  router.post('/moment/add', App.hasBody, App.hasToken, Moment.add)
  //获取
  router.post('/moment/get', App.hasToken, Moment.get)
  //删除
  router.post('/moment/delete',App.hasBody, App.hasToken, Moment.delete)

  return router
}