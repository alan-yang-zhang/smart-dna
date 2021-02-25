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
			[//iPhone
				{axis:"Medical",value:0.17},
				{axis:"Accident",value:0.50},
				{axis:"Savings",value:0.29},
				{axis:"Investment",value:0.88},
				{axis:"Life",value:0.22},
				{axis:"Critical Illness",value:0.28}
			]
			,[//Samsung
				{axis:"Medical",value:0.44},
				{axis:"Accident",value:0.55},
				{axis:"Savings",value:0.33},
				{axis:"Investment",value:0.44},
				{axis:"Life",value:0.55},
				{axis:"Critical Illness",value:0.77}
			]
			];

	var color = d3.scaleOrdinal().range(["#529fca","#CC333F"]);
		
	var radarChartOptions = {
		maxValue: 0.5,
		levels: 5,
		roundStrokes: true,
		color: color,
		textLabelIcon: ['assets/img/iconDiMedical.svg', 'assets/img/iconDiSavings.svg', 'assets/img/iconDiCi.svg', 'assets/img/iconDiLife.svg', 'assets/img/iconDiAccident.svg', 'assets/img/iconDiInvestment.svg'],
		title: 'Coverage at-a-glance',
		textColor: '#242424',
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
		labelIcon: ['assets/img/iconDiMedical.svg', 'assets/img/iconDiSavings.svg'],
		labelColor: ['#CC333F', '#529fca'],
		title: 'Medical',
		textColor: '#242424',
	};

	PieChart(".radar-chart", data, radarChartOptions);
}

function initNonMedicalChart(categoryType) {
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
		labelIcon: ['assets/img/iconDiMedical.svg'],
		labelColor: ['#CC333F', '#529fca'],
		labelFullColor: ['#F5B7B1', '#AED6F1'],
		title: categoryType,
		textColor: '#242424',
	};

	LineChart(".radar-chart", data, radarChartOptions);
}