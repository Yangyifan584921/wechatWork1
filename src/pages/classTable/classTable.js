// lesson.js
import wx, { Component } from 'labrador';
import school from '../../lib/school'
import Lessons from '../../lib/lesson';

import Update from '../../components/update/update'
import TimeTable from '../../components/timeTable/timeTable'

const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};

export default class Lesson extends Component {
	state = {
		allData: null,
		classSum: [],
		lessons: [], // 周课表数据容器
		imgs: [], // 图片课表
		dayLessons: [], // 日课表数据容器
		classItem: [],
		
		selectedLessonItem: null,
		currentTargetIdx: null,
		
		currentMonth: null,
		currentSevenDate: null,
		
		showMenu: false,
		overflow: false,
		
		selectedTermInfo: {},
		
		updateConfig: { type: 'lesson' },
		
		currentWeek: '1',
		currentTerm: {},
		currentDay: null,
		switchDayWeek: true
	}
	
	school = {};
	
	opt = {}
	
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
	
	async onLoad(opt) {
		try {
			this.getClassLessons();
			this.opt = opt;
			wx.showShareMenu({
				withShareTicket: true
			});
			
			if (opt.scene == 1044) {
				wx.getShareInfo({
					shareTicket: opt.shareTickets[0],
					success: function (res) {
						let encryptedData = res.encryptedData;
					}
				})
			}
			
			
		} catch (e) {
			console.error(e)
		}
		
	}
	
	onShareAppMessage() {
		return {
			title: '教务小程序，查询更得力',
			path: '/pages/index/index',
			success: (res) => {
				console.log(res, '转发成功');
				let shareTickets = res.shareTickets;
				if (shareTickets.length == 0) {
					return false;
				}
				wx.getShareInfo({
					shareTicket: shareTickets[0],
					success: function (res) {
						let encryptedData = res.encryptedData;
						
					}
				})
			},
			fail: (res) => {
				console.log(res, '转发失败')
			}
		}
	}
	
	children() {
		return {
			
			Update: {
				component: Update,
				props: {
					config: this.state.updateConfig,
					//callback: this._children.TimeTable.getLessons()
				}
			},
			TimeTable: {
				component: TimeTable,
				props: {
					onChange: this.onChangeState.bind(this),
					//onChangeOver:this.onChangeOver,
				}
			}
			
		}
	}
	
	onChangeState(params) {
		try {
			this.setState({ showMenu: params })
		} catch (e) {
			console.error(e)
		}
	}
	
	/**
	 * 获取班级课表配置
	 * @returns {Promise.<*>}
	 */
	async fetchClazzConfig() {
		const remoteConfig = await Lessons.getClass();
		const localConfig = await school.class_change.Get();
		const schoolConfig = await school.schoolStore.info.Get();
		
		return {
			clazz: {
				...(remoteConfig.data.data || localConfig.data)
			},
			school: remoteConfig.data.data ? { id: remoteConfig.data.data.schoolId } : schoolConfig.data
		};
	}
	
	async getClassLessons() {
		const _clazzConfig = await this.fetchClazzConfig();
		
		if (_clazzConfig.clazz) {
			try {
				const respData = await this.request('/api/v3/edu/clazz/lesson', 'GET', {
					clazzId: _clazzConfig.clazz.id,
					schoolId: _clazzConfig.school.id
				});
				
				if (respData.data.code || respData.data.crawlerData && respData.data.crawlerData.code) {
					console.warn('获取班级课表失败');
					return;
				}
				
				this.setState({ allData: respData.data }, () => {
					this._children.TimeTable.showModal(respData.data)
				});
				
				const { crawlerData } = respData.data;
				
				/*
					* 作用：判断课表数据是否需要更新
					* 判断条件：如果爬虫返回的数据为空，则需要更新
					* */
				
				if (!crawlerData) {
					wx.showModal({
						title: '',
						content: '页面未显示课表，是否尝试更新课表？'
					}).then(res => {
						if (res.confirm) {
							this.handleUpdate()
						}
					});
					return;
				}
				this.updateClazzConfig(_clazzConfig.clazz);
			} catch (err) {
				console.error(err);
			}
		} else {
			console.warn('服务器及本地均无数据，跳转到选择班级');
			wx.redirectTo({ url: '/pages/classChoose/classChoose' });
		}
	}
	
	updateClazzConfig(config) {
		this.request('/api/v3/edu/clazz/updateConfig', 'GET', {
			id: config.id,
			clazzName: config.clazzname,
			clazzId: config.id
		});
	}
	
	/*禁用滚动*/
	disablePageScroll() {
		this._children.TimeTable.disablePageScroll()
	}
	
	
	/*菜单栏功能*/
	handleShowMenu() {
		try {
			this._children.TimeTable.handleShowMenu()
		} catch (e) {
			console.error(e)
		}
		
	}
	
	
	/*更新*/
	handleChoose() {
		wx.redirectTo({
			url: '/pages/classChoose/classChoose'
		})
	}
	
	
	/*反馈*/
	handleFeedback() {
		wx.navigateTo({
			url: '/pages/feedback/feedback'
		})
	}
}