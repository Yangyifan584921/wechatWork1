import bind from '../../lib/bind';
import school from '../../lib/school';
import errMap from '../../lib/errMap';
import wx, { Component } from 'labrador';
import Loading from '../loading/loading';

export default class Update extends Component {
	
	methods = 'score'
	
	constructor(props) {
		super(props)
		this.state = {
			captchaSrc: '',
			captcha: '',
			show: false,
			hover: false,
		};
		this.config = null;
	}
	
	onUpdate(props) {
	}
	
	children() {
		return {
			Loading: {
				component: Loading,
			},
		}
	}
	
	async start() {
		const result = await school.schoolStore.info.Get();
		const info = result.data;
		const schoolID = info.id || info.schoolId;
		
		this.config = this.props.config;
		this.setState({ hover: true });
		this.doStart(schoolID);
	}
	
	doStart(schoolId) {
		this._children.Loading.onStart('获取验证码...');
		
		bind.captcha(schoolId).then((res) => {
			let captcha = res.data.crawlerData.data;
			if (!captcha.need) {
				this.login('NO_CAPTCHA')
				return
			}
			this._children.Loading.onStop();
			let captchaSrc = 'data:image/png;base64,' + captcha.img
			this.setState({ captchaSrc, show: true })
			return;
		})
		
	}
	
	currentToast = null
	
	showToast(data) {
		this.currentToast = data
		wx.showToast(data)
		setTimeout(() => {
			if (this.currentToast == data) {
				wx.showToast(data)
			}
		}, data.duration)
	}
	
	hideToast() {
		this.currentToast = null
		wx.hideToast()
	}
	
	login(captcha) {
		this._children.Loading.onChange('登录中...');
		bind.login(captcha).then((res) => {
			let code = res.data.crawlerData.code;
			if (code != 0) {
				this._children.Loading.onStop();
				wx.showModal({
					title: '提示',
					content: errMap[code] || code.toString(),
					showCancel: false,
					complete: () => {
						this.cancel()
					}
				})
				return
			}
			
			console.log('即将执行更新')
			
			this.update();
		})
	}
	
	update() {
		this._children.Loading.onChange('请求更新..');
		
		bind.update(this.config.type).then((res) => {
			let code = res.data.crawlerData;
			if (code != 0) {
				this._children.Loading.onStop();
				wx.showModal({
					title: '提示',
					content: errMap[code] || code.toString(),
					showCancel: false,
					complete: () => {
						this.cancel()
					}
				})
				return
			}
			
			console.log('即将检查更新状态')
			
			this.checkStatus()
		})
	}
	
	checkStatus() {
		this._children.Loading.onChange('等待更新完成..');
		console.log(this.methods, 'here is methods')
		try {
			bind.status(this.methods).then((res) => {
				let code = res.data.crawlerData;
				if (code === 20100) {
					setTimeout(this.checkStatus.bind(this), 1000)
					return
				}
				
				if (code !== 0) {
					this._children.Loading.onStop();
					wx.showModal({
						title: '提示',
						content: errMap[code] || code.toString(),
						showCancel: false,
						complete: () => {
							this.cancel()
						}
					})
					return
				}
				wx.hideLoading()
				this.finish()
				
			})
		} catch (err) {
			console.error(err);
		}
	}
	
	finish() {
		this._children.Loading.onSuccess('更新完成.');
		setTimeout(() => {
			this.setState({ hover: false })
		}, 1000)
		this.props.callback()
		console.log(this.props, 'this props')
	}
	
	cancel() {
		this.setState({ hover: false, show: false })
	}
	
	onInput(e) {
		this.setState({ captcha: e.detail.value })
	}
	
	onConfirm() {
		this.setState({ show: false })
		this.login(this.state.captcha)
	}
	
	onRefreshCaptcha() {
		this.start()
	}
}