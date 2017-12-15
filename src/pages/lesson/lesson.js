// lesson.js
import wx, { Component } from 'labrador';
import bind from '../../lib/bind'
import school from '../../lib/school'
import store from '../../lib/store'
import Lessons from '../../lib/lesson'
import Update from '../../components/update/update'
import TimeTable from '../../components/timeTable/timeTable'

const CLASSTIME = {
	"class_1": { "begin_time": "08:00", "end_time": "08:45", "time_slot": "morning" },
	"class_2": { "begin_time": "08:55", "end_time": "09:40", "time_slot": "morning" },
	"class_3": { "begin_time": "10:10", "end_time": "10:55", "time_slot": "morning" },
	"class_4": { "begin_time": "11:05", "end_time": "11:50", "time_slot": "morning" },
	"class_5": { "begin_time": "14:30", "end_time": "15:15", "time_slot": "afternoon" },
	"class_6": { "begin_time": "15:25", "end_time": "16:10", "time_slot": "afternoon" },
	"class_7": { "begin_time": "16:40", "end_time": "17:25", "time_slot": "afternoon" },
	"class_8": { "begin_time": "17:35", "end_time": "18:20", "time_slot": "afternoon" },
	"class_9": { "begin_time": "19:00", "end_time": "19:45", "time_slot": "evening" },
	"class_10": { "begin_time": "19:55", "end_time": "20:40", "time_slot": "evening" },
	"class_11": { "begin_time": "20:50", "end_time": "21:35", "time_slot": "evening" },
};

export default class Lesson extends Component {
	state = {
		allData: null,
		classSum: [],
		lessons: [], // 周课表数据容器
		imgs: [], // 图片课表
		dayLessons: [], // 日课表数据容器
		
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
	
	async onLoad(opt) {
		try {
			this.getLessons();
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
				}
			},
			TimeTable: {
				component: TimeTable,
				props: {
					onChange: this.onChangeState.bind(this),
					onChangeOver: this.onChangeOver.bind(this),
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
	
	onChangeOver(params) {
		try {
			this.setState({ over: params })
		} catch (e) {
			console.error(e)
		}
	}
	
	async getLessons() {
		let _this = this;
		let lesson = [];
		try {
			lesson = await Lessons.lesson();
			// 如果请求失败，则直接跳出
			if (lesson.statusCode != 200 || lesson.data.code || !lesson.data.crawlerData || lesson.data.crawlerData.code) {
				return
			}
			
			// this.setState({ allData: lesson.data })
			this.state.allData = lesson.data;
			this._children.TimeTable.showModal(lesson.data);
			let crawlerData = lesson.data.crawlerData.data;
			let classTime = Object.keys(lesson.data.extraData.classTime).length ? lesson.data.extraData.classTime : CLASSTIME;
			//给每节课添加课程开始时间和结束时间
			crawlerData.forEach(lessonItem => {
				lessonItem.lessons.forEach((lesson, key) => {
					if (lesson.hasOwnProperty('beginClass') && lesson.hasOwnProperty('endClass')) {
						lesson.beginTime = classTime['class_' + lesson.beginClass].begin_time;
						lesson.endTime = classTime['class_' + lesson.endClass].end_time;
					} else {
						lessonItem.lessons.splice(key, 1);
					}
				})
			});
			
			/*
			* 作用：判断课表数据是否需要更新
			* 判断条件：如果爬虫返回的数据为空，则需要更新
			* */
			if (!lesson.data.crawlerData || !Object.keys(lesson.data.crawlerData).length) {
				wx.showModal({
					title: '',
					content: '页面未显示课表，是否尝试更新课表？'
				}).then(res => {
					res.confirm && this.handleUpdate();
				})
				return
			}
			
			// 因为生命周期的问题，需要以 setTimeout 的方式延迟执行。
			setTimeout(function () {
				_this._children.TimeTable.getPopUpModal()
			}, 0)
			
		} catch (err) {
			console.error(err);
		}
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
	handleUpdate() {
		this._children.Update.methods = 'lesson'
		
		this._children.Update.start()
	}
	
	/*登出*/
	handleLogout() {
		wx.showModal({
			title: '注销',
			content: '点击确认取消绑定'
		}).then(res => {
			store.clear('schoolID');
			if (res.confirm) {
				school.setting.info.Clear();
				bind.unbind().then(() => {
					school.loadList();
					wx.navigateBack({
						url: '/pages/index/index'
					})
				}, () => {
					console.log("score unbind failed")
				})
			}
		})
	}
	
	/*反馈*/
	handleFeedback() {
		wx.navigateTo({
			url: '/pages/feedback/feedback'
		})
	}
}