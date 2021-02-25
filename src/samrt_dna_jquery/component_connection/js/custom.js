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