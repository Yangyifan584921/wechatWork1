import wx, { Component } from 'labrador';
import school from '../../lib/school'

const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};

export default class ClassChoose extends Component {
	state = {
		//list_ten: [],
		list_arr: [],
		choose_class: false,
		clazzName: ''
	};
	
	async onLoad() {
		try {
			this.getDeviceInfo()
			let choose = await school.class_change.Get();
			if (Object.keys(choose).length) {
				this.setState({
					choose_class: true,
					clazzName: choose.data.clazzname
				})
			}
			this.getList()
		} catch (e) {
			console.error(e)
		}
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
	
	school = {
		schoolId: 0
	};
	
	list_arr = [];
	
	request(url, method, data, header = {}) {
		const App = getApp();
		return new Promise((rs, rj) => {
			wx.wx.request({
				url: (extConfig.entrypoint || 'https://v2m.mengxiaozhu.cn') + url,
				data: data,
				method: method,
				header: {
					...header,
					'Applet-SessionID': (App.session && App.session.SessID) || ''
				},
				success: rs,
				fail: rj
			})
		});
	};
	
	async getList() {
		try {
			let schoolInfo = await school.schoolStore.info.Get();
			let schoolId = schoolInfo.data.schoolId || schoolInfo.data.id;
			this.school.schoolId = schoolId;
			
			let classList = await  this.request('/api/v3/edu/clazz/list', 'GET', { 'schoolId': schoolId });
			if (classList.data.code == 0) {
				let list_arr = classList.data.data;
				//let list_ten = list_arr.splice(0, 9);
				this.list_arr = list_arr;
				this.setState({
					list_arr: list_arr,
					//list_ten: list_ten
				});
				school.class_list.info.Set(list_arr);
			}
		} catch (e) {
			console.error(e)
		}
		
	}
	
	async onChoice(e) {
		try {
			const dataset = e.target.dataset;
			// 设置班级缓存
			await school.class_change.Set(dataset);
			
			this.setState({
				choose_class: true,
				clazzName: dataset.clazzname
			});
			
			wx.redirectTo({ url: '/pages/classTable/classTable' });
			this.request('/api/v3/edu/clazz/updateConfig', 'GET', {
				id: dataset.id,
				clazzName: dataset.clazzname,
				clazzId: dataset.id
			});
		} catch (e) {
			console.error(e)
		}
		
	}
	
	search(e) {
		let value = e.detail.value;
		let selected = null;
		let list_arr = this.list_arr;
		console.log(list_arr)
		let filterClass = list_arr.filter(item => {
			if (item.clazzName == value) {
				selected = item
			}
			if (item.clazzName.indexOf(value) !== -1) {
				return true;
			}
		});
		this.setState({ list_arr: filterClass });
		console.log(this.state.list_arr)
		if (!value) {
			this.getList()
		}
	}
}