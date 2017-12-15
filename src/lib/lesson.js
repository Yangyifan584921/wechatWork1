import http from './http'
import utils from './utils'

export default {
	lesson() {
		return http.get('/api/v3/edu/lesson')
	},
	
	getClass(){
		return http.get('/api/v3/edu/clazz/config')
	},
	
	//每日的课程
	formatDayTable(dayLesson, sumSections) {
		const lessons = [];
		const length = dayLesson.length;
		
		//在这里拿到的课程原本是乱序的，将他根据beginClass进行排序
		dayLesson.sort((pre, next) => pre.beginClass - next.beginClass);
		
		// 如果本日无课程，则返回1-最后一节课
		if (length === 0) {
			lessons.push({
				beginClass: 1,
				endClass: sumSections,
				noLesson: true
			});
		} else {
			try {
				for (let i = 0; i < length; i++) {
					// [无课] 第一节课是否为空
					if (i === 0 && dayLesson[i].beginClass !== 1) {
						lessons.push({
							beginClass: i + 1,
							endClass: dayLesson[i].beginClass - 1,
							noLesson: true,
						});
					}
					
					// [所有] 课程左侧线条颜色类型
					dayLesson[i]['colorType'] = i % 2 + 1;
					// [有课] 将所有有课的内容压入数组
					lessons.push(dayLesson[i]);
					
					// [无课] 未到最后一节课&前后两节课是否连贯
					if (i < length - 1 && dayLesson[i].endClass < dayLesson[i + 1].beginClass - 1) {
						lessons.push({
							beginClass: parseInt(dayLesson[i].endClass) + 1,
							endClass: dayLesson[i + 1].beginClass - 1,
							noLesson: true,
						});
					}
					
					// [无课] 最后一节课是否为空
					if (i === length - 1 && dayLesson[i].endClass < sumSections) {
						lessons.push({
							beginClass: parseInt(dayLesson[i].endClass) + 1,
							endClass: sumSections,
							noLesson: true,
						});
					}
				}
			} catch (err) {
				console.error(err);
			}
		}
		return lessons;
	},
	
	// 获取当前周课程表
	getCurrentWeekTable(allData, currentTerm, currentWeek) {
		let { crawlerData } = allData;
		let currentTermLessons = [];
		
		//根据 extraData 里的 term 拿到相应的 lesson 数据
		crawlerData.data.forEach(lesson => {
			if (lesson.term.year === currentTerm.year && lesson.term.no === currentTerm.no) {
				if (lesson.hasOwnProperty('img')) {
					currentTermLessons = lesson.img.map(uri => uri.startsWith('//') ? 'https:' + uri : uri);
				} else {
					currentTermLessons = lesson.lessons
				}
			}
		})
		
		// 分拣出符合当前周次的课表
		let weekTableResult = { imgs: [], lessons: [] };
		currentTermLessons.filter(thisLesson => {
			if (typeof thisLesson === 'string') {
				weekTableResult.imgs.push(thisLesson)
			} else if (thisLesson.weeks.indexOf(currentWeek) !== -1) {
				weekTableResult.lessons.push(thisLesson)
			}
		})
		
		return weekTableResult
	},
	
	getCurrentDayTable(dayOfWeek, currentWeekLessons, classSum) {
		// 初始化当前日期
		if (!dayOfWeek) {
			//获取到表示星期的某一天的数字
			dayOfWeek = new Date().getDay()
		}
		
		// 找到指定星期课程
		let dayLessons = []
		currentWeekLessons.filter(lesson => {
			if (lesson.dayOfWeek == dayOfWeek) {
				dayLessons.push(lesson)
			}
		})
		
		
		
		// 返回格式化后的日课表数据
		
		return {
			dayOfWeekIndex: dayOfWeek - 1,
			dayLessons: this.formatDayTable(dayLessons, classSum)
		}
	},
	
	getCurrentMonth(startDate, currentWeek) {
		let selectedDate = new Date(startDate).getTime() + 7 * currentWeek * (24 * 60 * 60 * 1000)
		let sevenDay = this.getEveryDate(selectedDate)
		
		
		return {
			sevenDay,
			currentMonth: new Date(selectedDate).getMonth() + 1
		}
	},
	
	getEveryDate(dateLength) {
		const ONE_DAY = 24 * 60 * 60 * 1000 // 一天的毫秒数
		
		let DateArray = []
		let date = dateLength - ONE_DAY
		for (let i = 0; i < 7; i++) {
			DateArray.unshift(new Date(date - ONE_DAY * i).getDate())
		}
		
		return DateArray
	},
	
	// 计算当前周
	calculateCurrentWeek(startDate) {
		if (isNaN(Date.parse(startDate))) {
			return 1;
		}
		const ONE_DAY = 1000 * 60 * 60 * 24,
			// calculate startDate Monday
			startTimeStamp = new Date(new Date(startDate).setHours(0, 0, 0)),
			startWeekDay = startTimeStamp.getDay() || 7,
			startWeekMon = new Date(startTimeStamp.getTime() - (startWeekDay - 1) * ONE_DAY),
			
			// calculate currentTime Monday
			endTimeStamp = new Date(new Date().setHours(0, 0, 0)),
			endWeekDay = endTimeStamp.getDay() || 7,
			endWeekMon = new Date(endTimeStamp.getTime() - (endWeekDay - 1) * ONE_DAY),
			
			// calculate currentWeek
			currentWeek = Math.ceil((endWeekMon - startWeekMon) / ONE_DAY / 7);
		
		if (currentWeek > 24) {
			return 24
		} else if (currentWeek < 1) {
			return 1
		}
		return currentWeek;
	},
	
	//  根据用户选择的学年和周，计算startDate
	calculateStartDateWithWeek(week) {
		const date = new Date(),
			currentDay = date.getDay() || 7,
			oneDay = 1000 * 60 * 60 * 24,
			totalStamp = ((week - 1) * 7 + currentDay - 1) * oneDay,
			distanceStamp = new Date(date.getTime() - totalStamp);
		
		return utils.formatTime(distanceStamp, 'yyyy-MM-dd')
	},
	
	getClassSum(classSumNumber) {
		// 课程总数
		let classSum = []
		for (let i = 1; i <= classSumNumber; i++) {
			classSum.push(i)
		}
		return classSum
	},
	
	/*检查是否有课程, 用以判断是否要执行更新课表数据*/
	checkCurrentDataIsEmpty(allData) {
		//如果有数据，则返回 false 说明不为空
		return !allData.length > 0
	}
}