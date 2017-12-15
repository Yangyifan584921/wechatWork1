
import wx, { Component } from 'labrador';
import errMap from '../../lib/errMap';
import { errorText } from '../../lib/errMap';

const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};

export default class Select extends Component {
	constructor(props) {
		super(props);
		this.state = {
			//再下拉列表框中选中的index
			index: 0,
			//表示第几个下拉框
			currentIndex: 0,
			form: this.props.form,
			formProps: {},
			formText: {},
			selectValue: {}
		}
	}
	
	_initForm(forms = []) {
		forms = forms.filter(item => item.type === 'select');
		//得到下拉列表中的代号和文本
		const formProps = {};
		const selectValue = {};
		
		forms.forEach(item => {
			formProps[item.name] = item.defaultValue || item.options[0].value;
			selectValue[item.name] = 0;
		});
		
		// 初始化select参数
		this.props.onChange(formProps);
		
		this.setState({ selectValue, formProps });
	}
	
	bindPickerChange(e) {
		try {
			const { name, index } = e.target.dataset;
			const subIndex = e.detail.value;
			const { selectValue, formProps } = this.state;
			const selectedOpt = this.props.form[index].options[subIndex];
			
			selectValue[name] = subIndex;
			formProps[name] = selectedOpt.value;
			
			this.setState({ selectValue, formProps });
			this.props.onChange(formProps);
		} catch (e) {
			console.error(e)
		}
		
	}
	
	
}