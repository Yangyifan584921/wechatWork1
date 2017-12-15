import cetStore from './name';
import store from './store';
import school from './school';
import utils from './utils';

const LESSON = 'LESSON';
const SCORE = 'SCORE';
const CET = 'CET';
const FAIL_EXAM = 'FAIL_EXAM';
const QUERY = 'QUERY';
export const CLASS = 'CLASS';


export const eduMap = {
	[SCORE]: '/pages/score/score',
	[LESSON]: '/pages/lesson/lesson',
	[CLASS]: '/pages/classTable/classTable',
};
const configSupport = ['成绩', '课程', '挂科率', '计算机考试(旧)','计算机考试', '普通话考试', '英语四六级', '班级课表'];

export const moduleConfig = {
	'成绩': {
		icon: 'score',
		type: SCORE,
		rep: true,
		url: eduMap[SCORE],
		weight: 0,
	},
	'课程': {
		icon: 'lesson',
		type: LESSON,
		rep: true,
		url: eduMap[LESSON],
		weight: 1,
	},
	'挂科率': {
		icon: 'failExam',
		type: FAIL_EXAM,
		rep: false,
		url: '/pages/failExam/failExam',
		weight: 2,
	},
	'计算机考试(旧)': {
		icon: 'computer',
		type: QUERY,
		rep: false,
		url: '/pages/samePage/samePage?module=computer&service=Computer',
		weight: 3,
	},
	'计算机考试': {
		icon: 'computer',
		type: QUERY,
		rep: false,
		url: '/pages/samePage/samePage?module=computer&service=NewComputer',
		weight: 3,
	},
	'普通话考试': {
		icon: 'putonghua',
		type: QUERY,
		rep: false,
		url: '/pages/samePage/samePage?module=mandarin&service=Mandarin',
		weight: 4,
	},
	'英语四六级': {
		icon: 'cet',
		type: CET,
		rep: true,
		url: '/pages/cet/cet',
		weight: 5,
	},
	'班级课表': {
		icon: 'class',
		type: CLASS,
		rep: true,
		url: eduMap[CLASS],
		weight: 6,
	},
};
// 首页显示列表
export const FeaturesMap = [
	/*{
		title: '成绩',
		icon: 'score',
		type: SCORE,
		rep: true,
		url: eduMap[SCORE],
	},
	{
		title: '课表',
		icon: 'lesson',
		type: LESSON,
		rep: true,
		url: eduMap[LESSON],
	},
	{
		title: '挂科率',
		icon: 'failExam',
		type: FAIL_EXAM,
		rep: false,
		url: '/pages/failExam/failExam'
	},
	{
		title: '计算机',
		icon: 'computer',
		type: QUERY,
		rep: false,
		url: '/pages/samePage/samePage?module=computer&service=Computer'
		
	},
	{
		title: '普通话',
		icon: 'putonghua',
		type: QUERY,
		rep: false,
		url: '/pages/samePage/samePage?module=mandarin&service=Mandarin'
		
	},
	{
		title: '四六级',
		icon: 'cet',
		type: CET,
		rep: true,
		url: '/pages/cet/cet'
	}*/
];

export const FeaturesImage = [
	{
		src: '../images/samePage',
	},
	{
		src: '../images/failExam',
	},
	{
		src: '../images/cet'
	}

]

/**
 * 获取需要替换的URI
 * @param type
 * @returns {Promise.<*>}
 */
export const getFeature = (type) => {
	try {
		switch (type) {
			case CET:
				return _fetchCetURICet();
			case SCORE:
			case LESSON:
				return _fetchCetURIEDU(type);
			case CLASS:
				return _fetchCetURIClass()
		}
	} catch (e) {
		console.error(e)
	}
	
};


/**
 * 判断是否绑定四六级
 * @returns {Promise.<*>}
 * @private
 */
const _fetchCetURICet = async () => {
	const info = await cetStore.Get();
	if (info) {
		return '/pages/cetResult/cetResult'
	}
	
	return '/pages/cet/cet'
};

const _fetchCetURIClass = async () => {
	const schoolInfo = await school.schoolStore.info.Get();
	
	// 无学校时，跳转到列表页，进行学校选择
	// if (!Object.keys(schoolInfo).length || Object.keys(schoolInfo.data).length === 1) {
	// 	return '/pages/selectSchool/selectSchool';
	// }
	
	let class_list = await school.class_change.Get();
	if (!Object.keys(class_list).length || !class_list) {
		return '/pages/classChoose/classChoose'
	}
	
	return '/pages/classTable/classTable?clazzId=' + class_list.data.id + "&schoolId=" + (schoolInfo.data.id || schoolInfo.data.schoolId)
	
	
}

const _fetchCetURIEDU = async (type) => {
	try {
		const schoolInfo = await school.schoolStore.info.Get();
		
		// 无学校时，跳转到列表页，进行学校选择
		// if (!Object.keys(schoolInfo).length || Object.keys(schoolInfo.data).length === 1) {
		// 	return '/pages/selectSchool/selectSchool';
		// }
		
		const info = schoolInfo.data;
		
		// 未绑定时，进入绑定页
		if (!info.isBound) {
			return '/pages/bind/bind?schoolId=' + (info.id || info.schoolId) + "&schoolName=" + (info.name || info.schoolName)
		}
		
		return eduMap[type];
	} catch (err) {
		console.log(err);
	}
};

export const getHomeModules = (supports) => {
	try {
		let _allModules = [];
		supports.forEach(item => {
			_allModules = [
				..._allModules,
				...item.modules
			]
		});
		const homeModules = _allModules.filter(item => configSupport.includes(item.name)).map(item => ({ ...item, ...moduleConfig[item.name], }));
		homeModules.sort((pre, next) => pre.weight - next.weight);
		return homeModules;
	} catch (err) {
		console.error(err);
		return [];
	}
	
};
