'use strict'

var mongoose =  require('mongoose')
var Moment = mongoose.model('Moment')

/**
 * 查询指定用户的所有状态
 * @param  {[type]} options.phoneNumber [description]
 * @return {[type]}                     [description]
 */
exports.findByUser = async ({user_id}) => {
	var query = Moment.find({user_id})
	var res = null
	await query.exec(function(err, Moment) {
		if(err) {
			res = {}
		}else {
			res = Moment
		}
	})
	console.log('res====>' + res)
	return res;
}

/**
 * 增加一条用户状态
 * @param  {[Moment]} Moment [mongoose.model('Moment')]
 * @return {[type]}      [description]
 */
exports.addMoment = async (Moment) => {
	Moment = await Moment.save()
	return Moment
}

/**
 * 删除一条用户的状态
 * @param  {[type]} options._id [description]
 * @return {[type]}                     [description]
 */
exports.deleteMoment = async ({_id}) => {
	var flag = false
	console.log('flag==========>'+flag)
	await Moment.remove({_id}, function(err) {
		if(err) {
			flag = false
			// return false
		}else{
			flag = true
		}
		
	})
	console.log('flag=====await=====>'+flag)
	return flag
}
