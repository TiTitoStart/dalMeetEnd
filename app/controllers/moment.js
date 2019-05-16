'use strict'

var xss = require('xss')
var mongoose =  require('mongoose')
var Moment = mongoose.model('Moment')
var User = mongoose.model('User')
var uuid = require('uuid')
import MomentHelper from '../dbhelper/MomentHelper'

/**
 * 新增一条状态
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */
exports.add = async (ctx, next) => {
  var token = ctx.header.token
  var content = ctx.request.body.content
  var imgs_url = ctx.request.body.imgs_url
  var user = await User.findOne({
	  accessToken: token
  }).exec()
  console.log('user', user)
	if(!content) {
    ctx.body = {
      code: 401,
      result: '参数缺失'
    }
    return next
  }
  var myMoment = new Moment({
    content: content,
    imgs_url: imgs_url,
    user_id: user._id,
    avatar: user.avatar,
    nickname: user.nickname
  })
  console.log('add moment ======>', myMoment)
  try {
    myMoment = await myMoment.save()
    ctx.body = {
      code: 0,
      result: myMoment
    }
  }
  catch (e) {
    ctx.body = {
      code: 405,
      message: '服务器发生错误'
    }
    return next
  }
	
}

/**
 * 获取指定用户的所有状态
 * @param {Function} next
 * @yield {[type]}
 */
exports.get = async (ctx, next) => {
  var token = ctx.header.token
  var user = await User.findOne({
	  accessToken: token
  }).exec()
	var Moment = await MomentHelper.findByUser({user_id: user._id})
  console.log('Moment', Moment)
  ctx.body = {
    code: 0,
    result: Moment
  }
}

/**
 * 获取指定用户关注用户的所有状态
 * @param {Function} next
 * @yield {[type]}
 */
exports.getLike = async (ctx, next) => {
  var token = ctx.header.token
  var user = await User.findOne({
	  accessToken: token
  }).exec()
  var likeList = user.like_list
	var Moments = await Moment.find({ user_id: { $in: likeList } });
  console.log('Moments', Moments)
  ctx.body = {
    code: 0,
    result: Moments
  }
}

/**
 * 数据库接口测试
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.Moments = async (ctx, next) => {
  var data = await MomentHelper.findAllMoments()
  // var obj = await MomentHelper.findByPhoneNumber({phoneNumber : '13525584568'})
  // console.log('obj=====================================>'+obj)
  
  ctx.body = {
    code: 0,
    result: data
  }
}

exports.delete = async (ctx, next) => {
  const mid = xss(ctx.request.body.mid)
  var data  = await MomentHelper.deleteMoment({_id: mid})
  ctx.body = {
    code: 0,
    result: data
  }
}

exports.getAll = async (ctx, next) => {
  var data = await MomentHelper.findAllMoments()
  ctx.body = {
    code: 0,
    result: data
  }
}