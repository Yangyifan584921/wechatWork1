import score from '../../lib/score'
import ObjectAssign from '../../vendor/ObjectAssign'

import wx, { Component,PropTypes } from 'labrador';

export default class Input extends Component {

    static propTypes = {
        //focus: PropTypes.bool,
        bindInput: PropTypes.func
    };

    static defaultProps = {
        //focus: false,
        bindInput: null,
    };

    constructor(props) {
        super(props)
        this.state = {
            value: "",
        }
    }

    onUpdate(props) {

    }

    setValue() {

    }

    handleInput(e) {
        this.props.bindInput(e)
    }


}