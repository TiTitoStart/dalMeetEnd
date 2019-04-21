'use strict'

var xss = require('xss')
var mongoose =  require('mongoose')
var User = mongoose.model('User')
var uuid = require('uuid')
import userHelper from '../dbhelper/userHelper'

/**
 * 注册新用户
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */
exports.signup = async (ctx, next) => {
  var phoneNumber = xss(ctx.request.body.phoneNumber)
  var password = xss(ctx.request.body.password)
	var user = await User.findOne({
	  phoneNumber: phoneNumber
	}).exec()
	if(!phoneNumber || !password) {
    ctx.body = {
      code: 406,
      result: '参数缺失'
    }
    return next
  }
	var verifyCode = Math.floor(Math.random()*10000+1)
	if (!user) {
	  var accessToken = uuid.v4()

	  user = new User({
	    nickname: '还没有昵称呢',
	    avatar: 'https://dpic.tiankong.com/gk/if/QJ6630287935.jpg?x-oss-process=style/670ws',
	    phoneNumber: xss(phoneNumber),
	    verifyCode: verifyCode,
      accessToken: accessToken,
      password: password
    })
    try {
      user = await user.save()
      ctx.body = {
        code: 0,
        result: user
      }
    }
    catch (e) {
      ctx.body = {
        code: 405,
        result: '服务器发生错误'
      }
      return next
    }
	}
	else {
	  ctx.body = {
      code: 401,
      result: '用户已存在'
    }
    return next
	}
}

/**
 * 登入
 * @param {Function} next
 * @yield {[type]}
 */
exports.login = async (ctx, next) => {
  var phoneNumber = xss(ctx.request.body.phoneNumber.trim())
  var password = ctx.request.body.password
	var user = await User.findOne({
	  phoneNumber: phoneNumber
	}).exec()
  console.log(user)
  if(!user) {
    ctx.body = {
      code: 403,
      result: '用户不存在'
    }
    return next
  }
  if(user.password !== password) {
    ctx.body = {
      code: 404,
      result: '密码错误'
    }
    return next
  }
  user.accessToken = uuid.v4()
	try {
    user = await user.save()
    ctx.body = {
      code: 0,
      result: user
    }
  }
  catch (e) {
    ctx.body = {
      success: 405,
      result: '服务器发生错误'
    }
    return next
  }
}

/**
 * 更新用户信息操作
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.update = async (ctx, next) => {
  var body = ctx.request.body
  var user = ctx.session.user
  var fields = 'avatar,gender,age,nickname,real_name,career,own_tags,slogan,command'.split(',')

  fields.forEach(function(field) {
    if (body[field]) {
      if(body[field] instanceof Object) {
        for(let i in body[field]) {
          user[field][i] = body[field][i]
        }
      }
      else {
        user[field] = JSON.parse(JSON.stringify(xss(body[field])))
      }
    }
  })

  user = await user.save()

  ctx.body = {
    code: 0,
    result: user
  }
}



/**
 * 数据库接口测试
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.users = async (ctx, next) => {
  var data = await userHelper.findAllUsers()
  // var obj = await userHelper.findByPhoneNumber({phoneNumber : '13525584568'})
  // console.log('obj=====================================>'+obj)
  
  ctx.body = {
    code: 0,
    result: data
  }
}
/* 删除用户操作*/
exports.deleteUser = async (ctx, next) => {
  const phoneNumber = xss(ctx.request.body.phoneNumber.trim())
  console.log(phoneNumber)
  var data  = await userHelper.deleteUser({phoneNumber})
  ctx.body = {
    code: 0,
    result: data
  }
}
/* 新增likeList操作*/
exports.addLike = async (ctx, next) => {
  var body = ctx.request.body
  var user = ctx.session.user
  user.like_list = body.like_list

  user = await user.save()

  ctx.body = {
    code: 0,
    likeList: user.like_list
  }
}