// bind.js
import errMap from "../../lib/errMap"
import bind from '../../lib/bind'
import school from '../../lib/school'
import config from '../../lib/config'
import store from '../../lib/store'
import { Updater } from '../../lib/updater';
import wx, { Component } from 'labrador';

export default class Bind extends Component {
	
	state = {
		schoolName: '',
		bindType: "edu",
		
		isLoaded: false,
		
		passwordError: false,
		
		captchaSrc: '',
		haveCaptcha: false,
		captchaError: false,
		
		loginNamePlaceholder: '请输入教务中可查询的账号',
		passwordPlaceholder: '请输入教务中可查询的账号密码',
		
		focusOn: null,
	}
	
	school = {
		schoolId: null,
		schoolName: '',
	}
	
	async onLoad(options) {
		const result = await school.schoolStore.info.Get();
		const info = result.data;
		const schoolID = info.id || info.schoolId;
		const schoolName = info.name || info.schoolName;
		this.setState({schoolName:options.schoolName || schoolName})
		this.school.schoolId = options.schoolId || schoolID;
		this.school.schoolName = options.schoolName || schoolName;
		
		// 拉取验证码
		this.getCaptcha();
	}
	
	onReady() {
		this.setState({ schoolName: this.school.schoolName ||this.state.schoolName})
	}
	
	handleInputFocus(event) {
		let inputType = event.currentTarget.dataset.inputType;
		let value = event.detail.value;
		if (!value) {
			this.setState({ focusOn: inputType })
		}
		this.setState({ passwordError: false, captchaError: false })
	}
	
	
	getCaptcha() {
		bind.captcha(this.school.schoolId).then(res => {
			wx.hideToast();
			let data = res.data.crawlerData.data;
			let srcHeader = 'data:image/png;base64,';
			this.setState({ haveCaptcha: data.need, captchaSrc: srcHeader + data.img });
		})
	}
	
	// 返回选择学校页面
	async handleNavigateBack() {
		await school.class_list.info.Clear();
		await school.class_change.Clear();
		wx.redirectTo({
			url: '/pages/selectSchool/selectSchool'
		})
	}
	
	handleBind(event) {
		
		try {
			let value = event.detail.value;
			
			let captcha = value.captcha;
			let password = value.password;
			let loginName = value.loginName;
			
			
			if (loginName && password && this.school.schoolId) {
				this.submit(loginName, password, captcha);
				
				
			}
		} catch (e) {
			console.log(e)
		}
		
		
	}
	
	submit(loginName, password, captcha = '') {
		let schoolId = this.school.schoolId
		let studentId = loginName;
		let studentPassword = password;
		let bindType = this.state.bindType;
		this.setState({ isLoaded: true });
		bind.bind({ schoolId, studentId, studentPassword, captcha, bindType }).then((res) => {
			let data = res.data.crawlerData;
			console.log("bind resp", res)
			if (data.code === 0) {
				config.reload(schoolId).then(_ => {
					try {
						const { school: schoolInfo } = this;
						
						schoolInfo.isBound = true;
						
						// 绑定完成后更新
						Updater.updateEdu(config.EDU_MODULES);
						
						school.schoolStore.info.Set(schoolInfo).then((res) => {
							wx.navigateBack({ url: '/pages/index/index' })
						})
					} catch (err) {
						console.error(err);
					}
				});
				
				return
			}
			
			console.log("bind error")
			
			wx.showModal({
				title: '提示',
				content: errMap[data.code] || data.code.toString(),
				showCancel: false,
				success: (res) => {
					this.handleGetCaptcha()
				}
			});
			
			this.setState({ isLoaded: false })
			
		})
	}
	
	//同意后跳出同意页
	handleToAgreementPage() {
		wx.navigateTo({ url: '/pages/agreement/agreement' })
	}
}