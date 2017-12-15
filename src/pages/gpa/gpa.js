// gpa.js

import wx, { Component } from 'labrador';

import score from '../../lib/score';
import gpaRule from '../../lib/gpaRule';
import config from '../../lib/config'
import utils from '../../lib/utils'
export default class Gpa extends Component {
    state = {
        scores: [],
        customScores: gpaRule.customScores.reverse(),
        customGPA: gpaRule.customGPA,
        gpa: '0.0',
        algorithmText: '',

        // 计算按钮样式判断
        calculateState: true,
		iphoneX: false
    }

    alg = []
    allPoint = 0
    gpaPointResult = 0
    originalScores = null

    errorCourseScore = 0

    onLoad(event,opt={}) {
		
        this.getDeviceInfo()
        console.log('触发onload');
		wx.wx.showShareMenu({
			withShareTicket:true
		});
		if (opt.scene == 1044) {
			wx.wx.getShareInfo({
				shareTicket:opt.shareTickets[0],
				success:function (res) {
					let encryptedData=res.encryptedData;
				}
			})
		}
        // GPA计算器算法选择器加载规则 和 GPA计算默认规则
        config.load().then(resp => {
            if (resp.data.school.gpa) {
                const {rule, data} = resp.data.school.gpa;
                gpaRule.rules[0] = rule;
                gpaRule.ruleData[0] = data;
            } else {
                gpaRule.rules =  gpaRule.rules.slice(1,  gpaRule.rules.length);
                gpaRule.ruleData.slice(0, 1);
            }
            const algorithmText = event.ruleIndex ? gpaRule.rules[event.ruleIndex].name : gpaRule.rules[0].name;
            this.setState({algorithmText});
        });

        let alg = event.ruleIndex ? gpaRule.ruleData[event.ruleIndex] : gpaRule.ruleData[0];
        this.alg = alg


        score.score().then( res => {
            if (res.data.code !== 0) {
                console.log('score 出错了')
                return
            }

            let termScores = res.data.crawlerData.data.termScores

            let scores = termScores.map( res => {
                let term = res.term;

                let newScores = res.scores.map( score => {
                    if (!parseInt(score.score)) {
                        this.errorCourseScore++
                    }

                    return {
                        name: score.name,
                        type: score.type,
                        point: (score.point / 100).toFixed(1),
                        score: score.numericalScore / 100,
                        originalScore: score.score,
                        status: true,
                        gpa: '-.-',
                        selected: true,
                    };
                })

                return {term, scores: newScores}
            })

            this.setState({scores})

            // 深拷贝
            this.originalScores = JSON.parse(JSON.stringify(scores))
        })
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
		return{
			title:'教务小程序，查询更得力',
			path:'/pages/index/index',
			success:(res)=>{
				console.log(res,'转发成功');
				let shareTickets=res.shareTickets;
				if(shareTickets.length==0){
					return false;
				}
				wx.wx.getShareInfo({
					shareTicket:shareTickets[0],
					success:function (res) {
						let encryptedData=res.encryptedData;
						
					}
				})
			},
			fail:(res)=>{
				console.log(res,'转发失败')
			}
		}
	}

    handleScorePicker(event) {
        let target = event.currentTarget.dataset

        let {termIndex, courseIndex} = target
        this.state.scores[termIndex].scores[courseIndex].score = this.state.customScores[event.detail.value]

        this.switchCalculateState(true);
        this.setState({scores: this.state.scores})
    }

    handleCreditPicker(event) {
        let target = event.currentTarget.dataset
        let {termIndex, courseIndex} = target

        this.state.scores[termIndex].scores[courseIndex].point = this.state.customGPA[event.detail.value]
        this.switchCalculateState(true);

        this.setState({scores: this.state.scores})
    }

    handleCalculate() {

        if(this.state.calculateState == false) {
            return
        }

        let _this = this;

        let scores = this.state.scores

        this.allPoint = 0
        this.gpaPointResult = 0

        function getSingleGPA(score) {
            if(isNaN(score)) {
                return 0
            }

            for (let i = 0; i < _this.alg.score.length; i ++) {
                if (score >= _this.alg.score[i]) {
                    return _this.alg.gpa[i].toFixed(1)
                }
            }

        }

        function getCalculatePoint(gpa, point) {
            if(isNaN(gpa) || isNaN(point)) {
                return
            }
            _this.gpaPointResult += gpa * point
        }

        function getAllPoint(point) {
            if(point == '' || point == 0) {
                return
            }
            _this.allPoint += parseInt(point)
        }

        // 计算错误异常课程
        if(this.errorCourseScore > 0) {
            wx.showModal({
              title: '异常提醒',
              showCancel: false,
              content: `检测到有${this.errorCourseScore}门成绩异常,将按照标准百分制进行换算.若需修改,请在计算结束后手动点击修改.`,
            })

            // 设置为 0 ，这样初始化页面时只出现一次提示。
            this.errorCourseScore = 0
        }

        scores.forEach( aScores => {
            aScores.scores.forEach( course => {
                if (course.selected) {
                    course.gpa = getSingleGPA(course.score)

                    getCalculatePoint(course.gpa, course.point)

                    getAllPoint(course.point)
                }
            })
        })

        this.setState({
            scores: this.state.scores
        })

        /*给 GPA 总成绩添加动画*/
        let gpa = 0.00;
        let timer = null;
        let gpaResult = (this.gpaPointResult / this.allPoint).toFixed(2)

        this.setState({gpa: 0.00})

        clearInterval(timer)

        timer = setInterval( () => {
            if (gpa < gpaResult) {
                gpa += 0.5
                this.setState({gpa: gpa.toFixed(2)})
            }

            if (gpa >= gpaResult) {
                this.setState({gpa: gpaResult})
                clearInterval(timer)
            }

        }, 90)

        // 切换按钮样式
        this.switchCalculateState(false)
    }

    handleCheckBox(e) {
        console.log(e, 'choice event')

        let termIdx = e.currentTarget.dataset.termIdx
        let courseIdx = e.currentTarget.dataset.courseIdx;

        let scores = this.state.scores;

        let target = scores[termIdx].scores[courseIdx];

        target.selected = !target.selected;

        this.setState({scores})

        this.switchCalculateState(true)
    }

    // 跳转到选择GPA算法页面
    handleToRulesPage() {
        wx.redirectTo({
          url: '/pages/selectCalculator/selectCalculator'
        })
    }

    handleRest() {
        wx.showModal({
            title: '提示', content: '重置后,您之前的参数修改将被重置',
        }).then( res => {
            let json = JSON.stringify(this.originalScores)

            if(res.confirm) {
                this.setState({
                    gpa: '0.0', scores: JSON.parse(json),
                })
                this.switchCalculateState(true)

            }
        })
    }

    switchCalculateState(state) {
        this.setState({
            calculateState: state
        })
    }
}