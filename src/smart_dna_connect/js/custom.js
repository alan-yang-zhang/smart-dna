function initNews() {
	$.ajax({
		url: "mock-data/news.json",
		type: "GET",
		dataType: "json",
		async: false,
		success: function(data) {
			initRenderUI(data);
			
			const a = $(".lightbox-json").lightbox({
				fitToScreen: true,
				jsonData: data,
				imageClickClose: false
			});
		}
	});
}

function initRenderUI(data) {
	const newFlag = '<span class="tag-new">New</span>';
	const imageItem = '<a href="#URL#" class="lightbox-json"><img src="#URL#" alt="" /></a>';

	data.forEach(element => {
		var regURL = new RegExp("#URL#","g");

		const currentItem = imageItem.replaceAll(regURL, element.url);

		$(".news-images").append(currentItem);
	});
}

function initProductOffer() {
	const $div_li =$("div.product-offer-menu ul li");

	$div_li.click(function(){
		$(this).addClass("active").siblings().removeClass("active");

		const index =  $div_li.index(this);

		$(".wrap-offer-description")
			.eq(index).removeClass("hide").siblings().addClass("hide");
	})
}

function initRadarChart() {
	var width = Math.min(700, window.innerWidth - 10),
	height = Math.min(width, window.innerHeight - 20);

	var data = [
			[
				{axis:"Medical",value:0.17},
				{axis:"Accident",value:0.50},
				{axis:"Savings",value:0.29},
				{axis:"Investment",value:0.4},
				{axis:"Life",value:0.22},
				{axis:"Critical Illness",value:0.28}
			]
			,[
				{axis:"Medical",value:0.8},
				{axis:"Accident",value:0.9 },
				{axis:"Savings",value:0.7},
				{axis:"Investment",value:0.7},
				{axis:"Life",value:0.7},
				{axis:"Critical Illness",value:0.7}
			]
			];

	var color = d3.scaleOrdinal().range(["#CC333F", "#529fca"]);
		
	var radarChartOptions = {
		maxValue: 1,
		levels: 5,
		textLabelIcon: ['assets/img/iconCatMedical.svg', 'assets/img/iconCatAccident.svg', 'assets/img/iconCatSavings.svg', 'assets/img/iconCatInvest.svg', 'assets/img/iconCatCoverage.svg', 'assets/img/iconCatIllness.svg'],
		labelColor: ['#CC333F', '#529fca'],
		title: 'Coverage at-a-glance'
	};

	RadarChart(".radar-chart", data, radarChartOptions);
}

function initMedicalChart() {
	const data = [
		{
			"labeltext": "Semi-Private",
			"footTitle": "Your Benefit Level"
		},
		{
			"labeltext": "Standard Private",
			"footTitle": "Benefit Level of People-like you"
		}
	]

	const color = d3.scaleOrdinal().range(["#529fca","#CC333F"]);

	const radarChartOptions = {
		w: 600,
        h: 300,
		color: color,
		labelIcon: ['assets/img/iconFillWardSemi.svg', 'assets/img/iconFillWard.svg'],
		labelColor: ['#CC333F', '#529fca'],
		title: 'Medical',
	};

	PieChart(".radar-chart", data, radarChartOptions);
}

function initNonMedicalChart(categoryType) {
	const labelIcon = 		{
		"Life": 'assets/img/iconCatCoverage.svg',
		"Critical Illness": 'assets/img/iconCatIllness.svg',
		"Investment": 'assets/img/iconCatInvest.svg',
		"Accident": 'assets/img/iconCatAccident.svg',
		"Savings": 'assets/img/iconCatSavings.svg',
	};

	const data = [
		{
			"key": "your Current Sum Assured",
			"value": "170000",
			"footTitle": "your Current Sum Assured"
		},
		{
			"key": "Sum Assured of people-like-you",
			"value": "200000",
			"footTitle": "Sum Assured of people-like-you"
		}
	]

	const color = d3.scaleOrdinal().range(["#529fca","#CC333F"]);

	const radarChartOptions = {
		w: 600,
        h: 300,
		color: color,
		labelIcon: labelIcon[categoryType],
		labelColor: ['#CC333F', '#529fca'],
		labelFullColor: ['#F5B7B1', '#AED6F1'],
		title: categoryType,
	};

	LineChart(".radar-chart", data, radarChartOptions);
}