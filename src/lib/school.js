import Promise from '../vendor/promise'
import ObjectAssign from '../vendor/ObjectAssign'
import http from './http'
import store from './store'
import utils from './utils.js'

const SCHOOL_TAG = 'SCHOOL_INFO';
const CLASS_NAME = 'CLASS_NAME';
const CLASS_LIST = 'CLASS_LIST';
const SETTING = 'SETTING';
const LIST_TAG = 'SCHOOL_LIST';

function listFromCache() {
	return new Promise((resolve, reject) => {
		wx.getStorage({
			key: utils.storageKeys.schoolList,
			success: function (res) {
				// success
				resolve(res)
			},
			fail: function () {
				// fail
				reject(utils.errors.cacheMissed)
			},
			complete: function () {
				// complete
			}
		})
	})
}

function listFromRemote() {
	return new Promise((resolve, reject) => {
		http.get('/MuniNg/h5_school_list').then(res => resolve(res), err => reject(err))
	})
}

const load = function (rs, rj) {
	listFromRemote().then(function (resp) {
		console.log("load schools from remote", resp);
		// wx.setStorage({
		// 	key: utils.storageKeys.schoolList,
		// 	data: resp.data.schools,
		// 	success: function (res) {
		// 		// success
		// 	}
		// })
		rs && rs(resp.data.schools)
	}, function (err) {
		console.log("load schools failed", err)
		rj && rj(err)
	})
}

function List(opts) {
	return new Promise((resolve, reject) => {
		try {
			console.log('start fetch school list');
			load(resolve, reject);
			// listFromCache().then(function (res) {
			// 	if (!res.data) {
			// 		load(resolve, reject)
			// 		return
			// 	}
			// 	console.log("load schools from cache", res)
			// 	resolve(res.data)
			// }, function (err) {
			// 	load(resolve, reject)
			// })
		} catch (e) {
			console.log("school.list", e)
		}
	})
}

function getFromCache() {
	return new Promise((resolve, reject) => {
		wx.getStorage({
			key: utils.storageKeys.school,
			success: function (res) {
				// success
				resolve(res)
			},
			fail: function () {
				// fail
				reject(utils.errors.cacheMissed)
			},
			complete: function () {
				// complete
			}
		})
	})
}

function Get() {
	return new Promise((resolve, reject) => {
		getFromCache().then(function (res) {
			if (!res.data) {
				reject(utils.errors.cacheMissed)
				return
			}
			console.log("load school from cache", res)
			resolve(res.data)
		}, function (err) {
			console.log("load school from cache missed", err)
			reject(utils.errors.cacheMissed)
		})
	})
}

function Set(school) {
	return new Promise((resolve, reject) => {
		wx.setStorage({
			key: utils.storageKeys.school,
			data: school,
			success: function (res) {
				// success
				resolve(res)
			},
			fail: function () {
				// fail
				reject()
			},
			complete: function () {
				// complete
			}
		})
	})
}


const schoolStore = {
	info: {
		Set(school) {
			console.info('start save school config');
			return new Promise((resolve, reject) => {
				wx.setStorage({
					key: SCHOOL_TAG,
					data: school,
					success: function (res) {
						resolve(res)
					},
					fail: function (err) {
						reject(err)
					}
				})
			});
		},
		Get() {
			console.info('read school config');
			return new Promise((resolve, reject) => {
				wx.getStorage({
					key: SCHOOL_TAG,
					success: function (res) {
						resolve(res);
					},
					fail: function (err) {
						// fail
						resolve({});
					}
				})
			})
		},
		Clear() {
			return new Promise((rs, rj) => {
				wx.removeStorage({
					key: SCHOOL_TAG,
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
	},
	list: {}
};

const class_change = {
	Set(className) {
		console.info('start save school config');
		return new Promise((resolve, reject) => {
			wx.setStorage({
				key: CLASS_NAME,
				data: className,
				success: function (res) {
					resolve(res)
				},
				fail: function (err) {
					reject(err)
				}
			})
		});
	},
	Get() {
		return new Promise((resolve, reject) => {
			wx.getStorage({
				key: CLASS_NAME,
				success: function (res) {
					resolve(res);
				},
				fail: function (err) {
					// fail
					resolve({});
				}
			})
		})
	},
	Clear() {
		return new Promise((rs, rj) => {
			wx.removeStorage({
				key: CLASS_NAME,
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
};

const class_list = {
	info: {
		Set(classList) {
			console.info('start save school config');
			return new Promise((resolve, reject) => {
				wx.setStorage({
					key: CLASS_LIST,
					data: classList,
					success: function (res) {
						resolve(res)
					},
					fail: function (err) {
						reject(err)
					}
				})
			});
		},
		Get() {
			console.info('read school config');
			return new Promise((resolve, reject) => {
				wx.getStorage({
					key: CLASS_LIST,
					success: function (res) {
						resolve(res);
					},
					fail: function (err) {
						// fail
						resolve({});
					}
				})
			})
		},
		Clear() {
			return new Promise((rs, rj) => {
				wx.removeStorage({
					key: utils.storageKeys.person,
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
	},
	list: {}
};


const setting = {
	info: {
		Set(info) {
			console.info('start save school config');
			return new Promise((resolve, reject) => {
				wx.setStorage({
					key: SETTING,
					data: info,
					success: function (res) {
						resolve(res)
					},
					fail: function (err) {
						reject(err)
					}
				})
			});
		},
		Get() {
			console.info('read school config');
			return new Promise((resolve, reject) => {
				wx.getStorage({
					key: SETTING,
					success: function (res) {
						resolve(res);
					},
					fail: function (err) {
						// fail
						resolve({});
					}
				})
			})
		},
		Clear() {
			return new Promise((rs, rj) => {
				wx.removeStorage({
					key: SETTING,
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
	},
	list: {}
};

module.exports = {
	List: List,
	Get: Get,
	Set: Set,
	schoolStore,
	class_change,
	class_list,
	setting,
	loadList: load
}