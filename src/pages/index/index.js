import wx, { Component } from 'labrador'
import config from '../../lib/config'
import bind from '../../lib/bind'
import school from '../../lib/school'
import store from '../../lib/store'
import utils from '../../lib/utils'
import { transferModule } from '../../lib/filterOut'
import { FeaturesMap, getHomeModules, getFeature, FeaturesImage, eduMap, CLASS, moduleConfig } from '../../lib/index'

//需要绑定的模块
const supportBind = ['edu', 'plugin/cet/CetQuery'];
//本地支持的模块
const supportModal = ['lesson', 'score', 'passrate', 'query/computer/NewComputer', 'query/computer/Computer', 'query/mandarin/Mandarin', 'cet/result'];
const blackList = ['ballot', 'te', 'examplan', 'card', '常用电话', 'game','emptyClassroom'];
const hasImage = ['lesson', 'score', 'passrate', 'te', 'examplan', 'emptyClassroom', 'card', 'report', 'electric', 'volunteer', 'book-refer34', 'borrow', 'gk', 'cetresult', 'ballot', 'querymandarinMandarin', 'querycomputerNewComputer', 'querycomputerComputer', 'game'];
export default class Index extends Component {
	constructor(props) {
		super(props);
		this.state = {
			featuresMap: FeaturesMap,
			FeaturesImage: FeaturesImage,
			name: '',
			disc: '',
			show: false,
			currentTab: 'func',
			schoolName: '',
			schoolID: 0,
			bindState: '',
			iphoneX: false,
			result: [],
			existModule: false
		}
	}
	
	onLoad(opt) {
		if (Object.keys(opt).length == 1) {
			this.setState({ currentTab: opt.currentTab })
		}
	}
	
	async onShow() {
		this.getDeviceInfo();
		// this._filterFeaturesMap();
		this._loadMpConfig();
	}
	
	school = {}
	
	hideLoginName(loginName) {
		return loginName.replace(/(\d{4})(.*)(\d+)/g, "$1***$3")
	}
	
	/**
	 *
	 * @returns {Promise.<void>}
	 * @private
	 */
	async _loadMpConfig() {
		try {
			const result = await school.schoolStore.info.Get();
			const info = result.data;
			const schoolID = info.id || info.schoolId;
			const schoolName = info.name || info.schoolName;
			this.setState({ schoolName, schoolID });
			const loginData = await store.GetConfig(utils.storageKeys.config);
			let loginName = '';
			if (loginData.data) {
				if (loginData.data.wechat.bindUser.edu) {
					loginName = loginData.data.wechat.bindUser.edu.loginName;
				}
			}
			
			loginName ? this.setState({ bindState: this.hideLoginName(loginName) }) : this.setState({ bindState: '未绑定' })
			config.reload(schoolID).then((res) => {
				const mp = res.data.mp || {};
				this.setState({
					name: mp.name,
					disc: mp.description
				});
				
				this._loadHomeModules(res.data);
				this.filterBindUrl(res.data);
			});
		} catch (e) {
			console.error(e);
		}
	}
	
	filterBindUrl({ supports }) {
		try {
			const result = [];
			
			supports.forEach(item => {
				item.modules.forEach(module => {
					if (blackList.includes(module.module.trim())) {
						return;
					}
					const icon = module.module.split('/').join('');
					module.icon = hasImage.includes(icon) ? icon : 'default';
					module.appletSupport = supportModal.includes(module.module);
					if (!module.bindUrl) {
						result.push(module);
						return;
					}
					if (supportBind.includes(module.bindUrl)) {
						result.push(module);
					}
				});
			});
			console.info(`total supports ${result.length}`);
			this.setState({ featuresMap: result });
		} catch (e) {
			console.error(e)
		}
		
	}
	
	async entryPage(e) {
		try {
			const eventItem = e.currentTarget.dataset.item;
			if (eventItem.appletSupport) {
				for (let item in moduleConfig) {
					if (item == eventItem.name) {
						if (moduleConfig[item].rep) {
							moduleConfig[item].url = await getFeature(moduleConfig[item].type);
							wx.navigateTo({ url: moduleConfig[item].url })
						} else {
							wx.navigateTo({ url: moduleConfig[item].url })
						}
					}
				}
			} else {
				this.changeEntry(eventItem.module)
			}
		} catch (e) {
			console.error(e)
		}
		
	}
	
	changeEntry(module) {
		const { schoolID } = this.state,
			path = transferModule(module, schoolID)
		wx.wx.navigateTo({ url: `/pages/iframe/iframe?module=${path}` });
	}
	
	currentedTab(event) {
		const { tab } = event.currentTarget.dataset;
		this.setState({ currentTab: tab })
	}
	
	getDeviceInfo() {
		const self = this;
		try {
			wx.wx.getSystemInfo({
				success: function (res) {
					if (res.screenHeight === 812) {
						self.setState({ iphoneX: true })
					}
				},
				fail(err) {
					console.log(err, '获取设备信息失败')
				}
			})
		} catch (err) {
			console.error(err);
		}
	}
	
	changeSchool() {
		wx.wx.navigateTo({ url: '/pages/selectSchool/selectSchool' })
	}
	
	
	async changeState() {
		const result = await school.schoolStore.info.Get();
		const info = result.data;
		const isBound = info.isBound;
		if (isBound) {
			wx.wx.showModal({
				title: '提示',
				content: '确认解除绑定吗？',
				success: function (res) {
					store.clear('schoolID');
					if (res.confirm) {
						school.setting.info.Clear();
						bind.unbind().then(() => {
							school.loadList();
							wx.wx.redirectTo({
								url: '/pages/index/index'
							})
						}, () => {
							console.log("score unbind failed")
						})
					}
				}
			})
		} else {
			wx.wx.navigateTo({ url: '/pages/bind/bind?schoolId=' + (info.id || info.schoolId) + "&schoolName=" + (info.name || info.schoolName) })
		}
	}
	
	/**
	 * 根据发送的请求得到的结果判断那个模块在哪个学校显示，如果有的话就添加进去
	 * @param supports
	 * @returns {Promise.<void>}
	 */
	async _loadHomeModules({ supports }) {
		try {
			const featuresMap = getHomeModules(supports);
			this.setState({ featuresMap });
			// setTimeout(() => this._filterFeaturesMap(), 0);
		} catch (err) {
			console.error(err);
		}
		
	}
	
	/**
	 * 替换需要绑定的路由
	 * @private
	 */
	// _filterFeaturesMap() {
	// 	const { featuresMap } = this.state;
	// 	featuresMap.map(async (features) => {
	// 		if (features.rep) {
	// 			features.url = await getFeature(features.type);
	// 		}
	// 		return features;
	// 	});
	// 	setTimeout(() => {
	// 		this.setState({ featuresMap });
	// 	}, 200);
	// }
	
	
}
