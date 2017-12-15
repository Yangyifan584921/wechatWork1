import score from '../../lib/score'
import ObjectAssign from '../../vendor/ObjectAssign'

import wx, { Component,PropTypes } from 'labrador';

export default class ScoreDetail extends Component {

    static propTypes = {
        item: PropTypes.object
    };

    static defaultProps = {
        item: {
            name: '',
            rank: '暂无',
            point: '',
            score: '',
            gpa: '',
            show: false,
        }
    };


    constructor(props) {
        super(props)
        this.state = {
            name: '',
            rank: '暂无',
            point: '',
            score: '',
            gpa: '',
            show: false,
        }
    }

    onUpdate(props) {

    }

    show(item){
        let detail = item
        detail.rank = '暂无'
        detail.show = true
        detail.point = isNaN(detail.point) ? '0.0' : (detail.point / 100).toFixed(1)
        detail.gpa = isNaN(detail.gpa) ? '0.0' : (detail.gpa / 100).toFixed(1)
        detail.show = true
        this.setState(detail)
        this.rank(detail)
    }

    rank(item) {
        score.rank(item.name).then((res) => {
            console.log("score detail rank", res)
            this.setState({rank: res.data.data.rank})
        })
    }

    cancel() {
        this.setState(ScoreDetail.defaultProps.item)
    }


}