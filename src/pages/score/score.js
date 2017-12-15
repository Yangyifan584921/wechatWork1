import ObjectAssign from '../../vendor/ObjectAssign'
import fetch from '../../lib/fetch'
import score from '../../lib/score'
import store from '../../lib/store'
import bind from '../../lib/bind'
import school from '../../lib/school'

import ScoreDetail from '../../components/scoredetail/scoredetail'
import Update from '../../components/update/update'
import wx, { Component } from 'labrador';

/**
 * 学期对应列表
 * 1： AUTUMN
 * 2： SPRING
 * 3： SMALL
 * 4： SUMMER_HOLIDAY
 * 5： WINTER_HOLIDAY
 */

const scoreTerm = {
	1: 4,
	2: 1,
	3: 2,
	4: 3,
	5: 5,
};

export default class Score extends Component {
	state = {
		scores: {},
		yearArr: [],
		selectInx: '',
		tableData: '',
		showMenu: false,
		scrollTop: '',
		scrollHeight: 0,
		updateConfig: { type: 'score' },
		selectedScoreItem: {},
		point: [],
		iphoneX: false
	}
	
	constructor(props) {
		super(props)
	}
	
	children() {
		return {
			update: {
				component: Update,
				props: {
					config: this.state.updateConfig,
					callback: this.setScoreData.bind(this)
				}
			},
			scoredetail: {
				component: ScoreDetail,
				props: {
					item: this.state.selectedScoreItem
				}
			}
		}
	}
	
	async onLoad(opt) {
		try {
			this.getDeviceInfo()
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
	
	getDeviceInfo() {
		const self = this;
		try {
			wx.wx.getSystemInfo({
				success: function (res) {
					if (res.screenHeight === 812) {
						self.setState({ iphoneX: true })
					}
				},
				fail(err) {
					console.log(err, '获取设备信息失败')
				}
			})
		} catch (err) {
			console.error(err);
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
	
	onReady() {
		this.setScoreData();
	}
	
	filterScore(score) {
		try {
			let mappedByYear = {};
			let years = [];
			score.map(item => {
				// 图片信息字段
				item.extras = [];
				
				// 学分换算
				item.scores && item.scores.forEach((score) => score.point = (score.point / 100).toFixed(1));
				
				let { year, no, reality } = item.term;
				reality = reality || 0;
				
				// 图片地址替换
				item.img = item.hasOwnProperty('img') ? item.img.map(uri => uri.startsWith('//') ? 'https:' + uri : uri) : [];
				// 学期排序字段
				item.term.order = scoreTerm[no];
				item.term.realYear = reality || year;
				
				if (reality === 0 && no !== 1) {
					year++;
					item.term.realYear = year;
				}
				
				year = reality || year;
				
				if (!mappedByYear[year]) {
					let yearScore = mappedByYear[year] = [];
					yearScore.unshift(item);
					years.push(year);
				} else {
					mappedByYear[year].unshift(item);
					mappedByYear[year].sort((a, b) => b.term.realYear - a.term.realYear || b.term.order - a.term.order);
				}
			});
			years.sort();
			return { mappedByYear, years }
		} catch (e) {
			console.error(e)
		}
		
	}
	
	setScoreData() {
		// 需要改进排序，不应使用 unshift 的方式
		score.score().then(res => {
			let scores = this.filterScore(res.data.crawlerData.data.termScores);
			this.state.scores = scores.mappedByYear;
			this.state.yearArr = scores.years;
			this.setState({ scores: scores.mappedByYear, yearArr: scores.years });
			this.selectYear(scores.years.length - 1);
		});
	}
	
	selectYear(index) {
		let year = this.state.yearArr[index]
		this.setState({ selectInx: index });
		this.setState({ tableData: this.state.scores[year], scrollTop: 'pageTop' });
	}
	
	handleChoiceYear(event) {
		this.selectYear(event.target.dataset.index)
	}
	
	handleScoreDetail(event) {
		let selectedScoreItem = event.currentTarget.dataset.scores;
		// TODO 不推荐使用
		this._children.scoredetail.show(selectedScoreItem)
	}
	
	handleShowMenu() {
		this.setState({ showMenu: !this.state.showMenu })
	}
	
	handleLogout() {
		wx.showModal({
			title: '注销',
			content: '点击确认取消绑定',
			
		}).then((res) => {
			if (res.confirm) {
				school.setting.info.Clear();
				store.clear('schoolID')
				bind.unbind().then(() => {
					school.loadList();
					wx.navigateBack({ url: '/pages/index/index', })
				}, () => {
					console.log("score unbind failed")
				})
			}
		})
	}
	
	handleUpdate() {
		console.log('run handle update')
		
		// TODO 不推荐使用
		this._children.update.start()
		
	}
	
	handleFeedback() {
		wx.navigateTo({
			url: '/pages/feedback/feedback'
		})
	}
	
	handleGPA() {
		wx.navigateTo({
			url: '/pages/gpa/gpa'
		})
	}
	
	imageLoad(e) {
		const { height } = e.detail,
			pageIndex = e.target.dataset.index,
			ids = pageIndex.split('_'),
			{ tableData } = this.state;
		
		tableData[ids[0]].extras[ids[1]] = { height };
		this.setState({ tableData });
	}
}