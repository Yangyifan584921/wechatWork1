const needSchoolID = ['teacherrate', 'electric', 'emptyClassRoom', 'report', 'gk', 'game', 'bookRefer'];

export const transferModule = (module, schoolId) => {
	if (!module.startsWith('query/')) {
		module = (module.replace(/([A-Z])/g, "-$1").toLowerCase()).replace(/\-(\w)/g, function (all, letter) {
			return letter.toUpperCase()
		});
	}
	
	if (module === 'autoScore') {
		module = 'auto-score';
	}
	
	// 空自习室
	if (module === 'emptyClassroom') {
		module = 'emptyClassRoom';
	}
	
	// 教师挂科率
	if (module === 'teacherrate') {
		module = 'passrate/teacher';
	}
	
	// 通用模块
	if (module.startsWith("common-crawler")) {
		module = module.replace("common-crawler", "commonCrawler");
	}
	
	// 图书查询
	if (module.startsWith('bookRefer')) {
		module = 'bookRefer';
	}
	
	// 高考
	if (module === 'gk') {
		module = 'pluginGkGkEmail';
	}
	
	
	if (needSchoolID.includes(module)) {
		return `/${module}/${schoolId}`;
	}
	
	return '/' + module;
}
