import school from '../../lib/school'
import wx, { Component } from 'labrador';
import config from '../../lib/config'
import bind from '../../lib/bind'

export default class SelectSchool extends Component {
	/**
	 * 全部学校列表
	 * @type {Array}
	 */
	schools = []
	
	/**
	 *
	 * @type {{schoolList: Array, inputView: {isFocus: boolean}}}
	 */
	state = {
		iPhoneX: false,
		/**
		 * 当前显示的学校列表
		 */
		schoolList: [],
	}
	
	/**
	 * 页面加载
	 */
	onLoad() {
		this.getDeviceInfo()
		wx.showToast({
			title: '加载学校列表..',
			icon: 'loading',
			duration: 10000
		});
		this.loadSchoolList()
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
	
	/**
	 * 加载学校列表
	 */
	loadSchoolList() {
		school.List().then((schools) => {
			this.schools = schools;
			this.setState({ schoolList: schools });
			wx.hideToast();
		}, (err) => {
			console.log("school list", err)
		})
	}
	
	
	/**
	 * 输入学校名称
	 * @param event
	 */
	handleInput(event) {
		let value = event.detail.value;
		let selected = null
		let schoolList = this.schools.filter(school => {
			if (school.name == value) {
				selected = school
				console.log(sele)
			}
			if (school.name.indexOf(value) !== -1) {
				return true;
			}
		});
		
		this.setState({
			schoolList,
		});
		
	}
	
	/**
	 * 点击列表中的一个学校
	 * @param event
	 */
	async handleSelect(event) {
		try {
			const result = await school.schoolStore.info.Get();
			const info = result.data || { isBound: false };
			const isBound = info.isBound;
			
			if (isBound) {
				wx.wx.showModal({
					title: '提示',
					content: '请先解除绑定',
					success: function (res) {
						if (res.confirm) {
							wx.reLaunch({ url: '/pages/index/index?currentTab=mine' })
						}
					}
				})
				return;
			}
			
			let selectedSchool = event.currentTarget.dataset;
			// 默认未绑定
			selectedSchool.isBound = false;
			config.reload().then((res) => {
				try {
					const school = res.data.school || { id: 0 };
					(res.data.school && selectedSchool.id !== school.id) && bind.unbind();
				} catch (err) {
					console.error(err);
				}
			});
			await school.schoolStore.info.Set(selectedSchool);
			wx.wx.reLaunch({ url: '/pages/index/index' });
			this.changeSchool('/api/v3/edu/clazz/schoolConfig');
		} catch (err) {
			console.error(err);
		}
	}
	
	changeSchool(url) {
		const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
		const App = getApp();
		wx.wx.request({
			url: (extConfig.entrypoint || 'https://v2m.mengxiaozhu.cn') + url,
			data: {},
			method: 'GET',
			header: {
				'Applet-SessionID': (App.session && App.session.SessID) || ''
			}
		})
	}
}