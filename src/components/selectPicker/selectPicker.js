import wx, { Component } from 'labrador';
import errMap from '../../lib/errMap';
import { errorText } from '../../lib/errMap';

const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};

export default class Select extends Component {
	constructor(props) {
		super(props);
		this.state = {
			focusEle: -1,
			form: this.props.form,
			formProps: {},
			formText: {}
		}
	}
	
	_initForm(forms = []) {
		forms = forms.filter(item => item.type === 'select');
		//得到下拉列表中的代号和文本
		const formProps = {};
		const formText = {};
		
		forms.forEach(item => {
			//筛选出与defaultValue（输入框中应该的默认值）相同的作为输入框中的默认值，filter返回一个数组
			const defaultText = item.options.filter(opt => opt.value === item.defaultValue)[0] || { key: item.options[0].key };
			formProps[item.name] = item.defaultValue || item.options[0].value;
			formText[item.name] = defaultText.key;
		});
		
		// 初始化select参数
		this.props.onChange(formProps);
		
		this.setState({ formProps, formText });
	}
	
	
	/**
	 * 改变文本框中的值
	 * @param e
	 */
	
	
	
	
}
