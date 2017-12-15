import wx, { Component, PropTypes } from 'labrador';
import utils from '../../lib/utils'
import lesson from '../../lib/lesson'
import school from '../../lib/school'

const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
const COMMON_HEADER = { 'Content-Type': 'application/x-www-form-urlencoded' };

export default class LessonPicker extends Component {
	
	constructor(props) {
		super(props)
		this.state = {
			term: 0,
			week: 1,
			
			show: false,
			isImage: false,
			lessonData: null,
			lessonItem: [],
			
			extraData: null,
			selectedItem: [],
			weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
			selectedTag: {},
			
			/*new*/
			selectedItemTemp: [],
			allData: null,
			firstComeInSelectedItem: [],
			currentTerm: {},
			currentWeek: '1',
			setCurrentTermWeek: null, // 如果本地没有保存数据，是第一次进来
			isSetting: false,
			prepareResetLocalData: false,
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
					'Applet-SessionID': App.session ? App.session.sessionId : ''
				},
				success: rs,
				fail: rj
			})
		});
	}
	
	allData=[]
	
	show(currentTerm, currentWeek, allData, setCurrentTermWeek = false, isImage = false) {
		try{
			this.setState({
				allData:allData,
				isImage:isImage,
				currentTerm:currentTerm,
				currentWeek:currentWeek,
				show:true,
				setCurrentTermWeek:setCurrentTermWeek,
			});
			this.allData=allData;
			
			this.start(currentTerm, currentWeek)
		}catch (e){
			console.error(e)
		}
		
	}
	
	close(e) {
		console.log('关闭弹窗', e)
		// 如果不是第一次设置，才能隐藏模态框
		if (!this.state.setCurrentTermWeek || e.currentTarget.dataset.catchtap == 'handleConfirm') {
			this.parent.setState({ overflow: false })
			
			this.setState({ show: false, isSetting: false, prepareResetLocalData: false })
		}
		if (e.currentTarget.dataset.catchtap !== 'handleConfirm') {
			this.parent.setState({ overflow: true })
			this.setState({ show: true })
		}
	}
	
	start(currentTerm, currentWeek) {
		if(this.state.allData||this.allData){
			let crawlerData = this.allData.crawlerData.data
			// 对学年按照最近的时间排序
			crawlerData.sort((a, b) => a.term.year < b.term.year)
			this.state.lessonData = crawlerData;
			
			// 选中当前的学期和周
			this.setSelectCurrentDateItem(currentTerm, currentWeek)
		}
	}
	
	setSelectCurrentDateItem(currentTerm, week, reset = false) {
		let lessons = this.state.lessonData;
		let selectedTermIndex = 0
		
		lessons.filter((lesson, index) => {
			if (lesson.term.year == currentTerm.year && lesson.term.no == currentTerm.no) {
				selectedTermIndex = index
			}
		})
		
		const weekKey = this.state.weeks.indexOf(week);
		
		let selectedWeekIndex = weekKey < 0 ? 0 : weekKey;
		
		this.state.selectedItem = [selectedTermIndex, selectedWeekIndex]
		// 用来储存原始数据和当做高亮当前选中项的条件
		this.state.firstComeInSelectedItem = [selectedTermIndex, selectedWeekIndex]
		
	}
	
	// 获取 picker 滚动事件
	
	handlePicker(e) {
		let target = e.detail.value
		this.state.selectedItem = [target[0], target[1]]
	}
	
	handlePickerSet() {
		this.setState({ isSetting: true })
		
		let currentWeek = this.state.currentWeek
		this.setSelectCurrentDateItem(this.state.currentTerm, currentWeek, true)
	}
	
	
	isCurrentTerm(selectedTerm) {
		let defaultTerm = this.state.allData.extraData.term
		return selectedTerm.year == defaultTerm.year && selectedTerm.no == defaultTerm.no
	}
	
	noHide(e) {
		this.close(e)
		if(this.state.isSetting){
			this.setState({ isSetting:true })
		}else{
			this.setState({ isSetting:false })
		}
	}
	
	// 确认按钮事件
	handleConfirm(e) {
		try {
			let allData = this.state.allData
			let lessonData = this.state.lessonData;
			
			if(!lessonData.length){
				this.close(e);
				return;
			}
			
			let term = lessonData[this.state.selectedItem[0]].term;
			let week = this.state.weeks[this.state.selectedItem[1]]
			let startDate = lesson.calculateStartDateWithWeek(week)
			let { lessons, imgs } = lesson.getCurrentWeekTable(allData, term, week)
			
			// 切换日课表
			if (!this.isCurrentTerm(term) && !this.parent.state.switchDayWeek) {
				this.parent.setState({ switchDayWeek: true })
			}
			
			this.parent.setState({ currentTerm: term, currentWeek: week, lessons, imgs })
			
			this.close(e);
			
			// 如果用户要重置数据
			if (this.state.prepareResetLocalData) {
				let { startDate, term } = allData.extraData
				let week = lesson.calculateCurrentWeek(startDate)
				this.saveTermWithToCache(term, week, startDate)
				this.reportSetting();
				return
			}
			
			if (this.state.isSetting || this.state.setCurrentTermWeek) {
				this.saveTermWithToCache(term, week, startDate)
				this.reportSetting();
			}
		} catch (err) {
			console.error(err);
		}
	}
	
	/**
	 * 上报周次设置
	 * @returns {Promise.<void>}
	 */
	async reportSetting() {
		try{
			const result = await school.schoolStore.info.Get();
			const info = result.data;
			const schoolID = info.id || info.schoolId;
			let week = this.state.weeks[this.state.selectedItem[1]];
			let startDate = lesson.calculateStartDateWithWeek(week);
			let term = this.state.currentTerm.no;
			let year = this.state.currentTerm.year;
			let data={
				startDate: startDate, // 开学日期
				term:term, // 当前学期
				year: year, // 当前年份
				schoolId: schoolID.id, // 学校ID
				module: 'lesson' // 上报模块，这里可以默认lesson就行
			}
			this.request('/api/v3/startdate/setting','POST',data,COMMON_HEADER)
		}catch (e){
			console.error(e)
		}
		
	}
	
	saveTermWithToCache(term, week, startDate) {
		wx.setStorage({
			key: utils.storageKeys.lessonTerm,
			data: { term, week, startDate }
		}).then(success => console.log('保存课表信息成功'))
		
	}
	
	// 点击设置事件
	resetCurrentWeek() {
		console.log('准备重置用户数据')
		this.setState({ prepareResetLocalData: true })
		
		let { term, startDate } = this.state.allData.extraData
		let currentWeek = lesson.calculateCurrentWeek(startDate);
		this.setSelectCurrentDateItem(term, currentWeek, true)
	}
	
	// 进入后台时重置picker
	onHide() {
		this.resetCurrentWeek()
	}
}