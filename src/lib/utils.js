

module.exports = {
	storageKeys: {
		schoolList: "/global/schoolList-V1",
		school: "/global/school",
		class_change: "/global/class_change",
		class_list: "/global/class_list",
		setting: "/global/setting",
		config: "/global/config",
		lessonTerm: "/global/lessonTerm",
		person:"/global/studentName",
		schoolID:"/global/schoolID",
		search:"/global/search",
		result:"/global/result"
	},
	errors: {
		cacheMissed: "cacheMissed"
	},
	formatTime: function (timeStamp = '', formatStyle = 'yyyy-MM-dd hh:mm:ss') {
		let tempDate = timeStamp ? new Date(timeStamp) : new Date();
		
		let args = {
			"M+": tempDate.getMonth() + 1,
			"d+": tempDate.getDate(),
			"h+": tempDate.getHours(),
			"m+": tempDate.getMinutes(),
			"s+": tempDate.getSeconds(),
			"q+": Math.floor((tempDate.getMonth() + 3) / 3),
			"S": tempDate.getMilliseconds()
		};
		
		/(y+)/.test(formatStyle);
		formatStyle = formatStyle.replace(RegExp.$1, (tempDate.getFullYear() + "").substr(4 - RegExp.$1.length));
		
		for (let key in args) {
			let tempNumber = args[ key ];
			if (new RegExp("(" + key + ")").test(formatStyle)) {
				formatStyle = formatStyle.replace(RegExp.$1, RegExp.$1.length == 1 ? tempNumber : ("00" + tempNumber).substr(("" + tempNumber).length));
			}
		}
		return formatStyle;
	}
}