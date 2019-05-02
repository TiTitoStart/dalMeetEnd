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
  var like = xss(ctx.request.body.like.trim())
  var user = ctx.session.user
  var likeList = user.like_list
  if(likeList.indexOf(like) === -1) {
     likeList.push(like)
     user.like_list = likeList
     user = await user.save()
     console.log('user-likeList', user)
     ctx.body = {
       code: 0,
       result: user.like_list
     }
  }
  else {
    ctx.body = {
      code: 204,
      result: '已存在'
    }
  }
}

/* 获取likeList详情操作*/
exports.getLike = async (ctx, next) => {
  var id = xss(ctx.request.body.id.trim())
  var test = await User.findOne({
	  _id: id
  }).exec()
  // var user = ctx.session.user
  var likeList = test.like_list
  // console.log('user.like_list', user.like_list)
  var result = await User.find({ _id: { $in: likeList } });
  console.log('result', result)
  ctx.body = {
    code: 0,
    result: result
  }
}

/* 查找具体id信息*/
exports.findOne = async (ctx, next) => {
  var id = xss(ctx.request.body.id.trim())
  var result = await User.findOne({
	  _id: id
  }).exec()
  ctx.body = {
    code: 0,
    result: result
  }
}