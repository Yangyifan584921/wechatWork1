import config from '../../lib/config'
import school from '../../lib/school'
import wx, { Component } from 'labrador';


export default class StartUp extends Component {
	async onLoad() {
		try {
			const schoolInfo = await school.schoolStore.info.Get();

			const extConfig = wx.getExtConfigSync() || {};
			const status = await config.login(extConfig.loginPath || "/applet/2/component-login", extConfig.appid, extConfig.openid);

			// 设置学校信息
			if (status && status.data && status.data.school) {
				console.log('已选择过学校，不再选择学校');
				const info = status.data.school;
				const wechat = status.data.wechat || { bindStatus: { edu: false } };
				info.isBound = wechat.bindStatus.edu;
				school.schoolStore.info.Set(info);
				wx.redirectTo({ url: '/pages/index/index' });
				return;
			}

			console.log('未选择过学校');
			if (!Object.keys(schoolInfo).length || Object.keys(schoolInfo.data).length === 1) {
				wx.redirectTo({ url: '/pages/selectSchool/selectSchool' })
			} else {
				wx.redirectTo({ url: '/pages/index/index' });
			}
		} catch (e) {
			console.log(e);
			wx.showModal({
				title: '错误',
				content: "" + e,
				success: function (res) {
					if (res.confirm) {
						console.log('用户点击确定')
					} else if (res.cancel) {
						console.log('用户点击取消')
					}
				}
			});
		}
	}
}
