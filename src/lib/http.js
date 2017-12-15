import Promise from '../vendor/promise'
import ObjectAssign from '../vendor/ObjectAssign'


const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
/**
 *
 * @param method
 * @param url
 * @param {Object} options
 * @returns {Promise}
 * @private
 */
const _http = (method, url, options = {}) => {
    const App = getApp();

    // TODO: 需要完善
    url = (extConfig.entrypoint || 'https://v2m.mengxiaozhu.cn') + url;

    if (!options.hasOwnProperty('data')) {
        options = { data: options }
    }

    if (!options.header) {
        options.header = {}
    }
    options.header['Applet-SessionID'] = (App.session && App.session.SessID) || '';

    return new Promise((resolve, reject) => {
        let params = {
            url,
            method,
            success(res) {
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        };

        if (options) params = ObjectAssign(params, options);
        wx.request(params);
    })
};

export default {
    get(url, options) {
        return _http('GET', url, options)
    },

    post(url, options) {
        return _http('POST', url, options)
    },

    delete(url, options) {
        return _http('DELETE', url, options)
    }
}
