import http from './http'

export default class Cet {
    query() {
        return http.get('/api/v3/plugin/cet/CetQuery/query')
    }

    update() {
        return http.get('/api/v3/plugin/cet/CetQuery/fetchTicket/update')
    }

    rebind() {
        return http.get('/api/v3/rebind/plugin/cet/CetQueryd')
    }

    bind(ticketNumber, name, province, schoolName, studentId) {
        return http.get('/api/v3/plugin/cet/CetQuery/bind', {
            ticketNumber,
            name,
            province,
            schoolName,
            studentId
        })
    }
}