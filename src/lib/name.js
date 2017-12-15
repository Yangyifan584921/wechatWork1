import Promise from '../vendor/promise'
import ObjectAssign from '../vendor/ObjectAssign'
import http from './http'
import store from './store'
import utils from './utils.js'

function getFromCache() {
	return new Promise((resolve, reject) => {
		wx.getStorage({
			key: utils.storageKeys.person,
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

async function Get() {
	try {
		return await getFromCache();
	} catch (err) {
		return false;
	}
}

function Set(studentName) {
	return new Promise((resolve, reject) => {
		wx.setStorage({
			key: utils.storageKeys.person,
			data: studentName,
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

function clear() {
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

module.exports = {
	Get: Get,
	Set: Set,
	Clear: clear
}