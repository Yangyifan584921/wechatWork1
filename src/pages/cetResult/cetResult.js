import wx, { Component } from 'labrador';
import school from '../../lib/school'
import name from '../../lib/name'
import { errorText } from '../../lib/errMap';

const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};

export default class cetResult extends Component {
	state = {
		showMenu: false,
		showEn: false,
		showMask: false,
		captchaSrc: '',
		errorCaptcha: false,
		hover: false,
		focusOn: '',
		total: '',
		type: '',
		listening: '',
		reading: '',
		writing: '',
		ticketNumber: '',
		name: '',
		show: false,
		schoolId: 0,
		
		currentType: 'chsi',
		loadingMask:false,
		successMask:false
	};
	currentToast = null
	
	//发送请求
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
	
	// 错误提示
	showToast(resp) {
		if (resp.data.code !== 0) {
			wx.wx.showModal({
				title: '提示',
				content: errorText[resp.data.code] || resp.data.msg,
				showCancel: false
			});
			return;
		}
		
		if (resp.data.crawlerData && resp.data.crawlerData.code !== 0) {
			wx.wx.showModal({
				title: '提示',
				content: errorText[resp.data.crawlerData.code] || resp.data.crawlerData.msg,
				showCancel: false
			});
		}
	}
	
	//页面显示时获取数据
	onLoad(opt) {
		this.loadCetInfo();
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
	
	async getSearch(){
		let search =await helpSearch.Get();
		let {}=search;
	}
	
	onShareAppMessage() {
		return{
			title:'查询小程序，使用更得力',
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
	
	async loadCetInfo() {
		const result = await school.schoolStore.info.Get();
		const info = result.data;
		const schoolID = info.id || info.schoolId;
		this.setState({ schoolId: schoolID });
		
		//请求五：
		const queryResp = await this.request('/api/v3/plugin/cet/CetQuery/query', 'GET', {});
		
		if (queryResp.data.code == 0 && queryResp.data.crawlerData && queryResp.data.crawlerData.code == 0) {
			const cetInfo = queryResp.data.crawlerData.data;
			
			this.setState({
				total: cetInfo.total,
				type: cetInfo.type,
				listening: cetInfo.listening,
				reading: cetInfo.reading,
				writing: cetInfo.writing,
				ticketNumber: this.hideTicketNumber(cetInfo.ticketNumber),
				name: cetInfo.name,
			})
		} else {
			this.showToast(queryResp);
		}
		
	}
	
	/**
	 * 准考证号中间替换为星号
	 * @param ticketNumber
	 * @returns {string|*|XML|void}
	 */
	hideTicketNumber(ticketNumber) {
		return ticketNumber.replace(/(\d{5})(.*)(\d{5})/g, "$1*****$3")
	}
	
	
	//显示/隐藏菜单框
	handleShowMenu() {
		// 隐藏菜单
		(!this.state.showEn && !this.state.show) && this.setState({ showMenu: !this.state.showMenu })
	}
	
	handleHideMenu() {
		this.setState({
			showMenu: false,
			showEn: false,
			show: false,
			showMask: false
		})
	}
	
	
	handleBack() {
		wx.showModal({
			title: '注销',
			content: '点击确认取消绑定',
		}).then((res) => {
			if (res.confirm) {
				wx.wx.redirectTo({ url: '/pages/cet/cet' });
				name.Clear();
			}
		})
	}
	
	
}
