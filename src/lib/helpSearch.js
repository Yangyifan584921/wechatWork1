import Promise from '../vendor/promise'
import utils from './utils.js'


function getFromCache() {
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key: utils.storageKeys.search,
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

function Set(search) {
    return new Promise((resolve, reject) => {
        wx.setStorage({
            key: utils.storageKeys.search,
            data: search,
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

function Clear() {
	return new Promise((rs, rj) => {
		wx.removeStorage({
			key: utils.storageKeys.search,
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
    Clear:Clear
}