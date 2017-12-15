import wx, { Component } from 'labrador';
import Lessons from '../../lib/lesson';
import utils from '../../lib/utils';
import school from '../../lib/school';
import LessonDetail from '../../components/lessondetail/lessondetail'
import LessonPicker from '../../components/lessonpicker/lessonpicker'

export default class TimeTable extends Component {
	constructor(props) {
		super(props);
		this.state = {
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
			
			
			currentWeek: '1',
			currentTerm: {},
			currentDay: null,
			switchDayWeek: true
		}
	}
	
	
	children() {
		return {
			LessonDetail: {
				component: LessonDetail,
			},
			
			LessonPicker: {
				component: LessonPicker,
				props: { currentWeek: this.state.currentWeek }
			},
			
		}
	}
	
	opt = '';
	allData = [];
	time = {
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
	
	onLoad(opt) {
		this.opt = opt;
	}
	
	showModal(allData = []) {
		this.state.allData = allData;
		this.getPopUpModal();
	}
	
	getPopUpModal() {
		console.log('get cache')
		let allData = this.state.allData || this.allData;
		let { startDate, term } = allData.extraData;
		/*
		 * 作用：拉取本地缓存的 lesson 信息，根据缓存取得当前课表
		 *
		 * 取出开始日期 startDate，根据开始开始日期计算出当前周，
		 * 再根据计算得出的当前周，获得当前周课表, 之后再根据当前周课表的数据，获取当前日课表的数据
		 * */
		wx.getStorage({ key: utils.storageKeys.lessonTerm }).then(localRes => {
			console.log(localRes, '有缓存');
			const cache = localRes.data;
			const week = Lessons.calculateCurrentWeek(cache.startDate);
			this.setPageParams(cache.term, cache.startDate, week, true);
		}, () => {
			console.log('无缓存')
			let defaultCurrentWeek = Lessons.calculateCurrentWeek(startDate)
			this.setPageParams(term, startDate, defaultCurrentWeek, false);
		})
	}
	
	async _showModal() {
		
		wx.showModal({
			title: '提示',
			content: '已临近新学期，是否需要设置新课表周次？',
		}).then(res => {
			if (res.confirm) {
				this.handleLessonPicker();
				school.setting.info.Set('更新学期');
			} else {
				school.setting.info.Set('更新学期');
			}
		})
	}
	
	async setPageParams(term, startDate, defaultCurrentWeek, cached) {
		try {
			const allData = this.state.allData || this.allData;
			let { classSum } = allData.extraData;
			let { lessons, imgs } = Lessons.getCurrentWeekTable(allData, term, defaultCurrentWeek);
			let { dayLessons, dayOfWeekIndex } = Lessons.getCurrentDayTable(null, lessons, classSum);
			let { sevenDay, currentMonth } = Lessons.getCurrentMonth(startDate, defaultCurrentWeek);
			
			//2017-10-2
			console.log(startDate)
			
			//得到开学时间
			let startYear = startDate.split('-')[0];
			let startMonth = startDate.split('-')[1];
			
			let info = await school.setting.info.Get();
			
			if (!Object.keys(info).length) {
				
				//得到本地的时间
				let nowDate = new Date();
				let nowYear = nowDate.getFullYear();
				let nowMonth = nowDate.getMonth() + 1;
				
				//根据本地时间判断是第几个学期
				let startTerm = (startMonth >= 2 && startMonth <= 7) ? 1 : 2;
				//根据开学时间判断是第几个学期
				let nowTerm = (nowMonth >= 2 && nowMonth <= 7) ? 1 : 2;
				
				let sortTime1 = nowYear + '-' + 2 + '-' + 26;
				let sortTime2 = nowYear + '-' + 8 + '-' + 26;
				
				if (nowYear == startYear) {
					// 2017-08-28 ~~~ 2017-10-10
					if (startTerm == nowTerm) {
						if (startTerm == 1) {
							if (new Date(startDate).getTime() <= new Date(sortTime1).getTime()) {
								this._showModal();
							}
							return;
						} else if (startTerm == 2) {
							if (new Date(startDate).getTime() <= new Date(sortTime2).getTime()) {
								this._showModal();
							}
						}
						
					} else {
						// 2018-01-11 ~~~ 2018-02-23
						this._showModal();
					}
					
				} else {
					//// 2017-12-28 ~~~ 2018-01-11
					if (startTerm == nowTerm) {
						return;
					} else {
						// 2017-12-11 ~~~ 2018-03-23
						this._showModal();
					}
				}
			}
			
			this.setState({
				currentTerm: term,
				lessons,
				imgs,
				dayLessons,
				currentMonth,
				currentSevenDate: sevenDay,
				currentWeek: defaultCurrentWeek,
				currentTargetIdx: dayOfWeekIndex,
				classSum: Lessons.getClassSum(classSum),
			});
			!cached && this.disablePageScroll();
			!cached && this._children.LessonPicker.show(term, defaultCurrentWeek, allData, true, !!imgs.length)
		} catch (err) {
			console.error(err);
		}
	}
	
	/*禁用滚动*/
	disablePageScroll() {
		this.setState({ overflow: !this.state.overflow }, () => {
			//this.props.onChangeOver(this.state.overflow);
		});
		
	}
	
	handleLessonItemDetail(e) {
		try {
			this.disablePageScroll()
			let allData = this.state.allData || this.allData;
			let data = allData.extraData
			let { beginClass, endClass, dayOfWeek, weeks } = e.currentTarget.dataset.lessonDetail
			
			let lessonDetail = e.currentTarget.dataset.lessonDetail;
			
			lessonDetail.show = true
			lessonDetail.weeks = weeks;
			if (Object.keys(data.classTime).length) {
				lessonDetail.time = data.classTime['class_' + beginClass].begin_time + '-' + data.classTime['class_' + endClass].end_time;
			} else {
				lessonDetail.time = this.time['class_' + beginClass].begin_time + '-' + this.time['class_' + endClass].end_time;
			}
			
			
			this._children.LessonDetail.show(lessonDetail)
		} catch (e) {
			console.error(e)
		}
		
	}
	
	handleShowMenu() {
		this.setState({ showMenu: !this.state.showMenu }, () => {
			this.props.onChange(this.state.showMenu)
		});
		this.disablePageScroll();
	}
	
	
	handleDayOfWeek(e) {
		let dayOfWeek = e.target.dataset.dayOfWeek + 1
		
		let { dayLessons, dayOfWeekIndex } = Lessons.getCurrentDayTable(dayOfWeek, this.state.lessons, this.state.classSum)
		this.setState({ dayLessons, currentTargetIdx: dayOfWeekIndex })
	}
	
	
	//显示 picker
	handleLessonPicker() {
		try {
			this.disablePageScroll()
			let allData = this.state.allData || this.allData;
			let { currentTerm, currentWeek, imgs, lessons } = this.state;
			if (Object.keys(allData).length) {
				this._children.LessonPicker.show(currentTerm, currentWeek, allData, false, !!imgs.length)
			} else {
				wx.wx.showModal({
					title: '提示',
					content: '暂时没有课',
					
				})
			}
		} catch (e) {
			console.error(e)
		}
		
		
	}
	
	
	handleSwitchDayWeeks() {
		console.log('handleSwitchDayWeeks')
		if (this.state.imgs.length) {
			wx.showModal({
				title: '提示',
				showCancel: false,
				content: '您的学校无法以日期形式浏览'
				
			});
			return;
		}
		// 当前选择的学年
		let currentTerm = this.state.currentTerm
		let data = this.state.allData || this.allData;
		let defaultTerm = data.extraData.term || data.extraData.term
		
		if (defaultTerm.year == currentTerm.year && defaultTerm.no == currentTerm.no) {
			this.setState({ switchDayWeek: !this.state.switchDayWeek })
			return
		}
		
		wx.showModal({
			title: '提示',
			showCancel: false,
			content: '非当前学期，无法以日期模式浏览'
		})
	}
	
	
}