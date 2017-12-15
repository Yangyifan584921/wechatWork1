
import wx, { Component,PropTypes } from 'labrador';

export default class LessonDetail extends Component {

    static propTypes = {
        item: PropTypes.object
    };

    static defaultProps = {
        item: {
            name: '无',
            time: '无',
            weeks: '无',
            teacher: '无',
            location: '无',

            show: false,
        }
    };

    constructor(props) {
        super(props)
        this.state = {
            name: '无',
            time: '无',
            weeks: '无',
            teacher: '无',
            location: '无',

            show: false,
        }
    }

    show(item){
        item.weeks = this.filterWeeks(item.weeks)

        let finalItem = Object.assign({}, LessonDetail.defaultProps.item, item )
        this.setState(finalItem)
    }

    hide() {
        this.setState(LessonDetail.defaultProps.item)
        this.parent.setState({overflow: false})
    }

    filterWeeks(weeks) {
        const tempWeeks = [];
        const lessonResult = [];

        // 查找非连贯周次位置
        for (let i = 0; i < weeks.length; i++) {
            const count = weeks[i + 1] - weeks[i];
            if (count !== 1) {
                tempWeeks.push(i);
            }
        }

        // 拼接周次
        let index = 0;
        for (let j = 0; j < tempWeeks.length; j++) {
            let weekStr = `${weeks[index]}-${weeks[tempWeeks[j]]}`;

            if (weeks[index] === weeks[tempWeeks[j]]) {
                weekStr = weeks[index];
            }

            lessonResult.push(weekStr);
            index = tempWeeks[j] + 1;
        }

        console.log(lessonResult, 'lesson result')

        return lessonResult.join(',');
    }
}