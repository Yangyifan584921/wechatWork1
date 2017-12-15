import wx, { Component } from 'labrador';
import errMap from '../../lib/errMap';
import helpSearch from '../../lib/helpSearch';
import helpResult from '../../lib/helpResult';
import Select from '../../components/select/select';
import { errorText } from '../../lib/errMap';
import Loading from '../../components/loading/loading';

const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};

export default class Text extends Component {
	state = {
		title: '',
		form: [],
		captchaImg: '',
		errorCaptcha: false,
		focusOn: '',
		buttonText: '',
		titles: [],
		lines: [],
		hover: true,
		idLoad: false,
		
		formSelectParam: {}
	};
	
	classify = {
		module: '',
		service: ''
	};
	sericalize = [];
	nextAction = '';
	form = [];
	inputValue = {};
	
	async onLoad(options) {
		try {
			this.classify.module = options.module;
			this.classify.service = options.service;
			this.login()
		} catch (e) {
			console.error(e)
		}
		
	}
	
	children() {
		return {
			Select: {
				component: Select,
				props: {
					form: this.state.form.filter(item => item.type === 'select'),
					onChange: this.onSelectChange.bind(this),
				}
			},
			Loading: {
				component: Loading
			}
		}
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
	};
	
	showToast() {
		wx.showToast({
			title: '',
			icon: 'success',
			duration: 1000
		})
	}
	
	//拿到组件传来的值
	onSelectChange(params) {
		try {
			this.setState({ formSelectParam: params });
		} catch (e) {
			console.error(e)
		}
		
	}
	
	async login() {
		
		let data = {
			module: this.classify.module,
			service: this.classify.service
		}
		const messResp = await this.request('/api/v3/flow/result', 'GET', data);
		if (messResp.data.data) {
			try {
				this.showToast()
				const messData = messResp.data.data.data;
				this.setState({
					titles: messData.titles,
					lines: messData.lines,
					hover: false
				})
				
			} catch (e) {
				console.error(e)
			}
		} else {
			this.setState({ hover: true })
			this.fail()
		}
		
	}
	
	async fail() {
		try {
			let data = {
				module: this.classify.module,
				service: this.classify.service,
				action: 'entry'
			};
			const loginResp = await this.request('/api/v3/flow/action', 'GET', data);
			//form循环
			let form = loginResp.data.crawlerData.data.form;
			// 初始化表单数据
			this._children.Select._initForm(form);
			this.setState({ form });
			let crawlerData = loginResp.data.crawlerData;
			
			if (crawlerData && crawlerData.code == 0) {
				this.setState({
					title: crawlerData.data.title,
					buttonText: crawlerData.data.buttonText
				});
				if (crawlerData.data.form[4]) {
					this.setState({
						captchaImg: 'data:image/png;base64,' + crawlerData.data.form[4].captchaImage
					});
				}
				
				this.sericalize = crawlerData.data.serializeKeys;
				this.nextAction = crawlerData.data.nextAction;
				this.form = form;
			}
			
		} catch (e) {
			console.error(e)
		}
		
	}
	
	query(e) {
		this.submit(e);
	}
	
	async submit(e) {
		try {
			this.classify.service == 'NewComputer' && this.nextAction == 'captcha' && this._children.Loading.onStart('加载中...');
			this.setState({ isLoad: true })
			const { formSelectParam } = this.state;
			let postData = {
				...e.detail.value,
				...formSelectParam,
			};
			const eValue = e.detail.value
			this.inputValue = e.detail.value;
			let data = {
				module: this.classify.module,
				service: this.classify.service,
				"action": this.nextAction,
				"params": JSON.stringify(postData),
				"serlalizeKeys": this.sericalize.join(',')
			};
			
			const actionResp = await this.request('/api/v3/flow/action', 'GET', data);
			if (actionResp.data.code == 0 && actionResp.data.crawlerData.code == 0) {
				
				if (this.nextAction == 'captcha') {
					if (this.classify.service == 'NewComputer') {
						this._children.Loading.onStop()
						const data = actionResp.data.crawlerData.data;
						this.actionCaptcha(data)
						this.nextAction = data.nextAction;
						return;
					}
				}
				this.setState({
					isLoad: false,
					hover: false,
					titles: actionResp.data.crawlerData.data.titles,
					lines: actionResp.data.crawlerData.data.lines
				});
				
				this.showToast()
				
			} else {
				this._children.Loading.onStop();
				this.setState({ isLoad: false })
				wx.wx.showModal({
					title: '提示',
					content: errorText[actionResp.data.crawlerData.code] || actionResp.data.crawlerData.msg,
					showCancel: false
				});
				if (this.state.form[4] || this.classify.service == 'NewComputer') {
					this.getCaptcha()
				}
			}
		} catch (e) {
			console.error(e)
		}
		
	}
	
	actionCaptcha(data) {
		this.form.length <= 3 && this.form.push(data.form[0]);
		
		this.setState({
			isLoad: false,
			title: data.title,
			buttonText: data.buttonText,
			captchaImg: 'data:image/png;base64,' + data.form[0].captchaImage
		})
	}
	
	//获取验证码
	async getCaptcha(e) {
		delete this.inputValue.verify;
		let data_cap = {
			module: this.classify.module,
			service: this.classify.service,
			action: 'captcha'
		};
		
		if (this.classify.service == 'NewComputer') {
			data_cap = {
				...data_cap,
				"params": JSON.stringify(this.inputValue)
			}
		}
		
		const capResp = await this.request('/api/v3/flow/action', 'GET', data_cap);
		if (capResp.data.code == 0 && capResp.data.crawlerData.code == 0) {
			this.setState({
				captchaImg: 'data:image/png;base64,' + ( capResp.data.crawlerData.data.image || capResp.data.crawlerData.data.form[0].captchaImage)
			})
		}
	}
	
	handleBack() {
		this.setState({ hover: true })
		this.fail();
		//TODO 点击返回时让验证码清空
	}
	
	
	gotoSearch() {
		wx.redirectTo({ url: '/pages/cet/cet' })
		if (this.classify.module == 'fetchCet') {
			helpSearch.Set(this.state.lines[0]);
			helpResult.Set(this.state.titles[0]);
		}
	}
}


	

