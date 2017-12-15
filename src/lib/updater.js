import http from './http';

export const Updater = {
	/**
	 * 更新教务模块
	 * @param methods
	 * @returns {*}
	 */
	updateEdu(methods = ['lesson', 'score']) {
		const _methodStr = methods.join('-');
		return http.post(`/api/v3/edu/${_methodStr}/update`);
	}
};