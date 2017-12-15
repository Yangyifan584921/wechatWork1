import utils from './utils'

let set = function (key, data) {
	console.log('save token', key, data);
	return new Promise(function (rs, rj) {
		wx.setStorage({
			key: key,
			data: data,
			success: function (res) {
				// success
				res.data = data
				rs(res)
			},
			fail: function () {
				// fail
				rj()
			},
			complete: function () {
				// complete
			}
		})
	})
}

let get = function (key) {
	console.log("store get", key)
	return new Promise((rs, rj) => {
		wx.getStorage({
			key: key,
			success: rs,
			fail: rj,
		})
	})
}

let GetSchool = function (key) {

	return new Promise((rs, rj) => {
		wx.getStorage({
			key: key,
			success: function (res) {
				// success
				console.log("store get", key)
				rs && rs(res);
			},
			fail: function (res) {
				// fail
				rs && rs(res);
			},
			complete: function () {
				// complete
			}
		})
	})
}

let GetConfig = function (key) {
	
	return new Promise((rs, rj) => {
		wx.getStorage({
			key: key,
			success: function (res) {
				// success
				console.log("store get", key)
				rs && rs(res);
			},
			fail: function (res) {
				// fail
				rs && rs(res);
			},
			complete: function () {
				// complete
			}
		})
	})
}

/**
 * 学校信息store
 * @type {{Set: (function(*)), Get: (function()), Clear: (function())}}
 */
/*const SchoolStore = {
	Set(data) {
		wx.setStorage({
			key: SCHOOL_STORE_KEY,
			data,
			success: function (res) {
				console.log('set school config succes', res);
			}
		})
	},
	Get() {
		return new Promise((rs, rj) => {
			console.info('calll')
			wx.getStorage({
				key: SCHOOL_STORE_KEY,
				success: function (res) {
					rs && rs(res);
				},
				fail: function (res) {
					rs && rs(res);
				}
			})
		})
	},
	Clear(){
		wx.removeStorage({
			key: SCHOOL_STORE_KEY,
			success: function (res) {
				console.log('clear school config');
			}
		})
	}
};*/


let clear = function (key) {
	return new Promise((rs, rj) => {
		wx.removeStorage({
			key: key,
			success: function (res) {
				// success
				rs(res)
			},
			fail: function () {
				// fail
				rj()
			},
			complete: function () {
				// complete
			}
		})
	})
}

module.exports = {
	get: get,
	set: set,
	getSchool: GetSchool,
	GetConfig:GetConfig,
	clear
}