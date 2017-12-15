import http from './http'
import config from './config'
import utils from './utils'
import school from './school';

const _unbind = async() => {
	try{
		const data = await school.schoolStore.info.Get();
		const info = data.data || {};
		info.isBound = false;
		school.schoolStore.info.Set(info).then((res) => {
			wx.redirectTo({ url: '/pages/index/index' })
		})
	}catch (err){
		console.error(err);
	}
	
}

module.exports = {
	captcha: function (schoolId) {
		return http.get(`/api/v3/edu/captcha`, { schoolId })
	},
	bind: function (params) {
		return http.get(`/api/v3/edu/bind`, params)
	},
	login: function (captcha) {
		return http.get('/api/v3/edu/login', { captcha })
	},
	update: function (methods) {
		return http.post(`/api/v3/edu/${methods}/update`)
	},
	status: function (methods) {
		return http.get(`/api/v3/edu/${methods}/status`)
	},
	unbind: function () {
		return new Promise((rs, rj) => {
			http.get('/api/v3/rebind').then(() => {
				let clears = [
					config.clear(utils.storageKeys.config),
					config.clear(utils.storageKeys.lessonTerm),
					config.clear(utils.storageKeys.person)
				]
				Promise.race(clears).then(rs, rj)
				_unbind();
			}, () => {
				rj()
			})
		})
	}
}