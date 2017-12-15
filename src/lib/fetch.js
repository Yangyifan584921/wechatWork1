// fetch.js

import http from './http'

export default {
    feedback(data) {
        return http.post('/api/err/report', { data })
    }
}