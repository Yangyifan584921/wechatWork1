import http from './http'
import store from './store'
import utils from './utils'
import Promise from '../vendor/promise'

let load = function (schoolId = 0) {
	return store.get(utils.storageKeys.config, () => {
		return http.get('/api/v3/config', { schoolId })
	})
};

let reload = function (schoolId = 0) {
	return new Promise((rs, rj) => {
		http.get('/api/v3/config', { schoolId }).then((resp) => {
			store.set(utils.storageKeys.config, resp.data).then(rs, rj)
		})
	})
}

const extConfig = wx.getExtConfigSync() || {};
module.exports = {
	EDU_MODULES: ['score', 'lesson'],
	load,
	clear: function (storageKey) {
		return store.clear(storageKey)
	},
	reload,
	login: function (path, appid, openid) {
		return new Promise((rs, rj) => {
			wx.login({
				success(res) {
					http.post(path, {
						header: {
							'content-type': "application/x-www-form-urlencoded",
						},
						data: {
							appID: appid,
							openID: openid,
							code: res.code
						}
					}).then(resp => {
						if (resp.data.code !== 0) {
							wx.showModal({
								title: '登录失败',
								content: resp.data.msg,
								success: function (res) {
									if (res.confirm) {
										console.log('用户点击确定')
									} else if (res.cancel) {
										console.log('用户点击取消')
									}
								} });
							return
						}
						getApp().session = {
							SessID: resp.data.data.SessID
						};
						store.set('secureToken', resp.data).then(rs, rj)
						reload().then((res) => {
							rs(res)
						}, () => {
							rj()
						})
					})
				}
			})
		})
	}
}
