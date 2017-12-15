import wx, { Component } from 'labrador';
import school from '../../lib/school'
import score from '../../lib/score'
import utils from '../../lib/utils'
import store from '../../lib/store'

const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
const COMMON_HEADER = { 'Content-Type': 'application/x-www-form-urlencoded' };


export default class failExam extends Component {
	state = {
		lessons: {},
		schoolID: 0,
		iphoneX:false
	};
	
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
	}
	
	onLoad(opt) {
		this.getDeviceInfo()
		store.get('schoolID').then(res=>{
			if(res){
			
			}else{
				wx.redirectTo({
					url: '/pages/startup/startup',
					success: function (res) {
						// success
					},
					fail: function () {
						// fail
					},
					complete: function () {
						// complete
					}
				})
			}
		})
		
		this.goInLoad()
		wx.showShareMenu({
			withShareTicket:true
		});
		if (opt.scene == 1044) {
			wx.getShareInfo({
				shareTicket:opt.shareTickets[0],
				success:function (res) {
					let encryptedData=res.encryptedData;
				}
			})
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
	
	onShareAppMessage() {
		return{
			title:'教务小程序，查询更得力',
			path:'/pages/index/index',
			success:(res)=>{
				console.log(res,'转发成功');
				let shareTickets=res.shareTickets;
				if(shareTickets.length==0){
					return false;
				}
				wx.getShareInfo({
					shareTicket:shareTickets[0],
					success:function (res) {
						let encryptedData=res.encryptedData;
						
					}
				})
			},
			fail:(res)=>{
				console.log(res,'转发失败')
			}
		}
	}
	
	async goInLoad() {
		const result = await school.schoolStore.info.Get();
		const info = result.data;
		const schoolID = info.id || info.schoolId;
		let data = {
			schoolId: schoolID,
			top: 10
		};
		
		this.setState({ schoolID });
		
		try {
			this.request('/api/v3/failrate/top', 'GET', data).then(queryResp => {
				if (queryResp.data.code == 0 && queryResp.data.crawlerData) {
					let queryData = queryResp.data.crawlerData;
					let lessons = [];
					let r = 0.9;
					
					queryData.map(item => {
						item.failrate = (item.failrate * 100).toFixed(2) + '%';
						item.amount = this.pfr(item.amount) + '%';
						lessons.push(item)
					});
					
					this.setState({
						lessons
					})
				}
			})
		} catch (err) {
			console.error(err);
		}
		
	}
	
	pfr(amount) {
		const r = 0.9;
		return ((1 - Math.exp(amount * Math.log(r) * 0.1)) * 100).toFixed(2);
	}
	
	search(event) {
		let value = event.detail.value;
		let data = {
			schoolId: this.state.schoolID,
			q: value
		};
		
		if (value) {
			this.request('/api/v3/failrate/search', 'POST', data, COMMON_HEADER).then(searchResp => {
				if (searchResp.data.code == 0 && searchResp.data.crawlerData.length) {
					let searchData = searchResp.data.crawlerData;
					let lessons = [];
					
					searchData.map(item => {
						item.failrate = (item.failrate * 100).toFixed(2) + '%';
						item.amount = this.pfr(item.amount) + '%';
						lessons.push(item)
					});
					
					this.setState({
						lessons
					})
				} else {
					this.setState({ lessons: [] })
				}
				
			});
			
		} else {
			this.goInLoad()
		}
	}
	
}