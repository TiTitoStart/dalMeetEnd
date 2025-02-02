'use strict'

// 用于封装controllers的公共方法

var mongoose = require('mongoose')
var uuid = require('uuid')
var User = mongoose.model('User')

exports.hasBody = async (ctx, next) => {
  var body = ctx.request.body || {}
  // console.log(this.query.phonenumber)
  console.log('body', body)

  if (Object.keys(body).length === 0) {
    ctx.body = {
      result: '某参数缺失',
      code: 406
    }

    return next
  }

  await next()
}

// 检验token
exports.hasToken = async (ctx, next) => {
  var accessToken = ctx.header.token
  console.log('ctx.header.Token', ctx.header.token);

  if (!accessToken) {
    ctx.body = {
      result: '令牌失效',
      code: 407
    }

    return next
  }

  var user = await User.findOne({
    accessToken: accessToken
  })
  .exec()

  if (!user) {
    ctx.body = {
      result: '用户没有登入',
      code: 408
    }

    return next
  }

  ctx.session = ctx.session || {}
  ctx.session.user = user

  await next()
}