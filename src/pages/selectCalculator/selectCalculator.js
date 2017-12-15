import wx, { Component } from 'labrador';
import utils from '../../lib/utils'
import gpaRule from '../../lib/gpaRule'

export default class SelectCalculator extends Component {
    state = {
        rules: []
    }

    onLoad(opt) {
		
    	
        this.setState({
            rules: gpaRule.rules
        });
	
		wx.showShareMenu({
			withShareTicket:true
		});
		if (opt.scene == 1044) {
			wx.getShareInfo({
				shareTicket:opt.shareTickets[0],
				success:function (res) {
					let encryptedData=res.encryptedData;
				}
			})
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
				wx.getShareInfo({
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
	
	
	handleSelectRule(event) {
        console.log(event, 'handleSelectRule')
        let targetIndex = event.currentTarget.dataset.index;

        wx.redirectTo({
            url: `/pages/gpa/gpa?ruleIndex=${targetIndex}`
        })
    }
}