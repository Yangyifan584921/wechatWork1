import { Component } from 'labrador';
import store from '../../lib/store'

const extConfig = wx.getExtConfigSync() || {},
	{ entrypoint } = extConfig;

export default class webview extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			pagePath: '',
		}
	}
	
	async onLoad(opts) {
		try {
			const Token = await store.get('secureToken');
			console.log(Token)
			const TokenData = Token.data.data;
			const { module } = opts;
			let path = encodeURIComponent('#' + module);
			let url = `${entrypoint}/secure-entry/${TokenData.SecureToken}?r=${path}`;
			console.log('[URL]: ', url);
			this.setState({ pagePath: url });
		} catch (err) {
			console.error(err);
		}
		
	}
}

