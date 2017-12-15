// feedback.js

import wx, { Component,PropTypes } from 'labrador';
import school from '../../lib/school';
import feedback from '../../lib/feedback';

export default class Agreement extends Component {
    schoolId: null;
    state={
        disable:true,
        text:''
    }

    onReady() {
		school.schoolStore.info.Get().then( res => {
            this.schoolId = res.schoolId;
        })
    }

    handleSubmit(event) {

        let schoolId = this.schoolId;
        let {question, contact} = event.detail.value;

        if (question && contact) {
            let data = {
                topic: question,
                number: contact,
                schoolId
            };

            feedback.feedback(data).then( res => {
                console.log(res, 'feedback res')
                wx.showModal({
                    title: '提示',
                    content: '反馈成功, 感谢您使用萌小助！',
                    showCancel: false,
                }).then( () => {
                    wx.navigateBack();
                })
            })
        }

    }
    
    blur1(e) {
		let value=e.detail.value;
		this.setState({text:value})
	}
	
	blur2(e) {
		let value=e.detail.value;
		if(this.state.text&&value){
		    this.setState({disable:false})
        }else{
			this.setState({disable:true})
        }
	}
}

