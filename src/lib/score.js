import http from './http'

module.exports = {
    score: function (schoolId) {
        return http.get('/api/v3/edu/score')
    },
    rank: function (name) {
        return http.get(`/api/v3/score/${name}`)
    },

}