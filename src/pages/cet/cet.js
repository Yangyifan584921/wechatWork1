import wx, { Component } from 'labrador'
import { errorText } from "../../lib/errMap"
import cet from '../../lib/cet'
import config from '../../lib/config'
import store from '../../lib/store'
import school from '../../lib/school'
import name from '../../lib/name'
import helpSearch from '../../lib/helpSearch'
import helpResult from '../../lib/helpResult'
import Loading from '../../components/loading/loading';

const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
const COMMON_HEADER = { 'Content-Type': 'application/x-www-form-urlencoded' };


export default class Cet extends Component {
	
	
	state = {
		switch: true,
		disable: true,
		studentNumberError: false,
		focusOn: null,
		focus: 'true',
		studentName: '', //保存name
		studentNumber: '', //保存Number
		ticketNumber: '',
		name: '',
		disableInp: false,
		isload: false,
		captchaSrc: ''
	};
	
	school = {
		schoolId: 0
	};
	
	student = {
		studentNumber: 0
	}
	
	respResult={
	
	}
	
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
	
	children() {
		return {
			Loading: {
				component: Loading
			}
		}
	}
	
	async onLoad() {
		try {
			
			let search = await helpSearch.Get();
			let searchName = search.value;
			let result = await helpResult.Get();
			let resultNum = result.value;
			this.setState({
				studentName: searchName,
				studentNumber: resultNum,
				disable: false,
				focus: true
			})
		} catch (e) {
			console.error(e)
		}
		
		
	}
	
	
	//登录
	async fetchCaptcha(event) {
		try {
			this._children.Loading.onStart('拉取验证码');
			const schoolResult = await school.schoolStore.info.Get();
			const info = schoolResult.data;
			const schoolID = info.id || info.schoolId;
			this.school.schoolId = schoolID || 0;
			let data_cap = {
				"func": "neea",
				"schoolId": this.school.schoolId,
				"ticketNumber": this.state.studentNumber
			};
			const captchaResp = await this.request('/api/v3/plugin/cet/CetQuery/captcha', 'GET', data_cap);
			const crawlerData = captchaResp.data.crawlerData || {};
			if (captchaResp.data.code == 0 && crawlerData.code == 0 && crawlerData.data.img) {
				this._children.Loading.onStop();
				this.setState({ captchaSrc: 'data:image/png;base64,' + crawlerData.data.img })
			} else {
				this._children.Loading.onStop()
				this.showToast(captchaResp);
				return false;
			}
		} catch (err) {
			return false;
		}
		
	}
	
	
	async login(data) {
		this.setState({ isload: true });
		
		return new Promise((rs) => {
			console.info('start', data.func);
			try {
				this.request('/api/v3/plugin/cet/CetQuery/bind', 'GET', data).then(bindResp => {
					this.setState({ isload: false })
					const resp = bindResp.data;
					this.respResult.resp=resp;
					
					const bindCode = resp.code || resp.crawlerData.code;
					
					if (bindCode === 0) {
						//返回的code=0时成功
						rs && rs({ status: 0, msg: {} })
					} else if (bindCode === 40101) {
						//验证码输入错误
						rs && rs({ status: 1, msg: resp.crawlerData })
					}
					
					//查询失败
					rs && rs({ status: -1, msg: { msg: '查询失败' } })
				});
			} catch (err) {
				rs && rs({ status: -1, msg: { msg: '查询失败' } })
			}
		});
		
	}
	
	
	//点击提交按钮时的行为
	async query(event) {
		try {
			if (!this.state.captchaSrc) {
				this.fetchCaptcha();
				return;
			}
			
			let { studentName, studentNumber, captcha } = event.detail.value;
			this.student.studentNumber = studentNumber;
			console.log(event.detail.value)
			let data = {
				"ticketNumber": studentNumber,
				"name": studentName,
				"studentId": studentNumber + '_' + studentName,
				"captcha": captcha
			};
			
			const CET_LIST = ['neea', 'chsi', 'sushe'];
			const _errorStark = [];
			let result = '';
			
			for (let i = 0; i < CET_LIST.length; i++) {
				data.func = CET_LIST[i];
				
				
				result = await this.login(data);
				console.log(result, 'result')
				
				_errorStark.push(result)
				
				if (result.status >= 0) {
					break;
				}
			}
			const errMsg = _errorStark.filter(err => [1, -1].includes(err.status));
			
			if (!errMsg.length) {
				//成功
				console.log(this.respResult.resp.crawlerData.data.listening)
				if (this.respResult.resp.crawlerData.data.listening) {
					this.setState({
						isload: false,
						studentName: '',
						studentNumber: '',
						disable: false
					});
					helpSearch.Clear();
					helpResult.Clear();
					await name.Set(this.respResult.resp.crawlerData.data);
					wx.redirectTo({ url: '/pages/cetResult/cetResult' });
					return
				}
				
			} else {
				//弹出失败的内容
				wx.wx.showModal({
					title: '提示',
					content: result.msg.msg,
					showCancel: false
				});
				
				helpSearch.Set({ key: '姓名', value: studentName });
				helpResult.Set({ key: '准考证号', value: studentNumber });
			}
			
			
		} catch (event) {
			console.error(event)
		}
		
	}
	
	//判断文本框中的内容是否正确
	blur1(e) {
		const { studentNumber } = this.state;
		let studentName = e.detail.value;
		if (!studentName || !studentNumber || studentNumber.length !== 15) {
			this.setState({ disable: true })
		} else {
			
			this.setState({ disable: false });
		}
		this.setState({
			studentName: e.detail.value
		});
	}
	
	blur2(e) {
		const { studentName } = this.state;
		let studentNumber = e.detail.value;
		if (!studentName || !studentNumber || studentNumber.length !== 15) {
			this.setState({ disable: true })
		} else {
			
			this.setState({ disable: false });
		}
		
		this.setState({
			studentNumber: e.detail.value
		});
		
		if (typeof Number(this.state.studentNumber) !== 'Number') {
			this.setState({
				isload: false,
				
			})
		}
	}
	
	helpSearch() {
		wx.redirectTo({ url: "/pages/samePage/samePage?module=fetchCet&service=FetchCetApp" })
	}
	
}