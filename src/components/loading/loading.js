import { Component } from 'labrador';

export default class loading extends Component {
	constructor(props) {
		super(props);
		this.state = {
			show: false,
			loading: false,
			text: '加载中'
		};
	}
	
	onStart(text) {
		this.setState({ show: true, loading: true, text });
	}
	
	onStop(){
		this.setState({ show: false, loading: false})
	}
	
	onChange(text) {
		this.setState({ show: true, loading: true, text });
	}
	
	onSuccess(text, duration = 1000) {
		this.setState({ loading: false, text });
		setTimeout(() => {
			this.setState({ show: false });
		}, duration);
	}
}
