/**
 * jQuery Lightbox
 * @author Warren Krewenki
 *
 * This package is distributed under the BSD license.
 * For full license information, see LICENSE.TXT
 *
 * Based on Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 *
 *
 **/

(function($) {
	$.fn.lightbox = function(options) {
		// build main options
		var opts = $.extend({}, $.fn.lightbox.defaults, options);
		var intervalId = '';

		$(window).resize(resizeOverlayToFitWindow);

		return $(this).on(opts.triggerEvent,function(){
			// initialize the lightbox
			initialize();
			showLightbox(this);
			return false;
		});

		/*
		# Initialize the lightbox by creating our html and reading some image data
		# This method is called by the constructor after any click events trigger it
		# You will never call it by itself, to my knowledge.
		*/
		function initialize() {
			$('#overlay, #lightbox').remove();
			opts.inprogress = false;

			// if jsonData, build the imageArray from data provided in JSON format
			if (opts.jsonData && opts.jsonData.length > 0) {
				var parser = opts.jsonDataParser ? opts.jsonDataParser : $.fn.lightbox.parseJsonData;                
				opts.imageArray = [];
				opts.imageArray = parser(opts.jsonData);
			}
	
			const closeButton = '<a href="javascript://" id="bottomNavClose"><img src="'+opts.fileBottomNavCloseImage+'"></a>';

			const lightboxHeader = '<div class="lightbox-header"><p id="lightbox-timer"></p><p class="light-action"><span id="image-date"></span><span>' + closeButton + '</span></p></div>';

			var outerImage =
				'<div id="imageContainer">' +
				lightboxHeader +
				'<img id="lightboxImage" />' +
				'<div id="loading"><img src="'+opts.fileLoadingImage+'"></div>';

			var imageData =
				'<div id="imageDataContainer" class="clearfix"><div id="imageData"><div id="imageDetails"><span id="caption"></span><span id="detail"></span></div>' + 
				'<div id="bottomNav"><button id="button-more" class="lightbox-button">Know More</button></div></div></div></div>';

			var string = '<div id="overlay"></div><div id="lightbox"><div id="outerImageContainer">' + outerImage + imageData + '</div></div>';

			$("body").append(string);

			if (opts.imageScroll === true) {
        		$('#lightbox').css('position', 'fixed')
			}

			$("#overlay, #lightbox").click(function(){ end(); }).hide();
			$("#bottomNavClose").click(function(){ end(); return false;});

			$('#imageDataContainer').width(opts.widthCurrent);

			if (!opts.imageClickClose) {
				$("#outerImageContainer").click(function(){ return false; });
			}

			return true;
		};

		/*
		# Get the document and window width/heigh
		#
		# Examples
		#
		#	getPageSize()
		#	# => [1024,768,1024,768]
		#
		# Returns a numerically indexed array of document width/height and window width/height
		*/
		function getPageSize() {
			var jqueryPageSize = new Array($(document).width(),$(document).height(), $(window).width(), $(window).height());
			return jqueryPageSize;
		};
	    
		function getPageScroll() {
			var xScroll, yScroll;

			if (self.pageYOffset) {
				yScroll = self.pageYOffset;
				xScroll = self.pageXOffset;
			} else if (document.documentElement && (document.documentElement.scrollTop || document.documentElement.scrollLeft)){  // Explorer 6 Strict, Firefox
				yScroll = document.documentElement.scrollTop;
				xScroll = document.documentElement.scrollLeft;
			} else if (document.body) {// all other Explorers
				yScroll = document.body.scrollTop;
				xScroll = document.body.scrollLeft;
			}

			var arrayPageScroll = new Array(xScroll,yScroll);
			return arrayPageScroll;
		};

		/*
		# Deploy the sexy overlay and display the lightbox
		#
		# imageObject - the jQuery object passed via the click event in the constructor
		#
		# Examples
		#
		#	showLightbox($('#CheesusCrust'))
		#
		# Returns a boolean true, because it's got nothing else to return. It should give visual feedback when run
		*/
		function showLightbox(imageObject) {
			/**
			* select, embed and object tags render over the lightbox in some browsers
			* Right now, the best way to fix it is to hide them, but that can trigger reloading of some flash content
			* I don't have a better fix for this right now, but I want ot leave this comment here so you and I both 
			* know that i'm aware of it, and I would love to fix it, if you have any suggestions.
			**/
			$("select, embed, object").hide();

			// Resize and display the sexy, sexy overlay.
			resizeOverlayToFitWindow();
			$("#overlay").hide().css({ opacity : opts.overlayOpacity }).fadeIn();
			imageNum = 0;

			if (opts.imageArray.length > 1) {
				for (i = 0; i < opts.imageArray.length; i++) {
					for (j = opts.imageArray.length - 1; j > i; j--) {
						if (opts.imageArray[i][0] == opts.imageArray[j][0]) {
							opts.imageArray.splice(j, 1);
						}
					}
				}


				while (opts.imageArray[imageNum] && (opts.imageArray[imageNum][0] != imageObject.href)) { 
					imageNum++;
				}
			}

			// calculate top and left offset for the lightbox
			var arrayPageScroll = getPageScroll();
			var lightboxTop = arrayPageScroll[1] + ($(window).height() / 10);
			var lightboxLeft = arrayPageScroll[0];
			$('#lightbox').css({top: lightboxTop+'px', left: lightboxLeft+'px'}).show();

			changeImage(imageNum);
		};
	    
		function changeImage(imageNum) {
			if (opts.inprogress == false) {
				opts.inprogress = true;

				// update global var
				opts.activeImage = imageNum;	

				// hide elements during transition
				$('#loading').show();
				// $('#lightboxImage, #hoverNav, #prevLink, #nextLink').hide();

				// delay preloading image until navbar will slide up
				if (opts.slideNavBar) { 
					$('#imageDataContainer').hide();
					$('#imageData').hide();
				}
				doChangeImage();
			}
		};

		function doChangeImage() {
			var imgPreloader = new Image();

			// once image is preloaded, resize image container
			imgPreloader.onload = function() {
				var newWidth = imgPreloader.width;
				var newHeight = imgPreloader.height;

				if (opts.scaleImages) {
					newWidth = parseInt(opts.xScale * newWidth);
					newHeight = parseInt(opts.yScale * newHeight);
				}

				if (opts.fitToScreen) {
					var arrayPageSize = getPageSize();
					var ratio;
					var initialPageWidth = arrayPageSize[2] - 2 * opts.borderSize;
					var initialPageHeight = arrayPageSize[3] - 200;

					var dI = initialPageWidth/initialPageHeight;
					var dP = imgPreloader.width/imgPreloader.height;

					if ((imgPreloader.height > initialPageHeight) || (imgPreloader.width > initialPageWidth)) {
						if (dI > dP) {
							newWidth = parseInt((initialPageHeight/imgPreloader.height) * imgPreloader.width);
							newHeight = initialPageHeight;
						} else {
							newHeight = parseInt((initialPageWidth/imgPreloader.width) * imgPreloader.height);
							newWidth = initialPageWidth;
						}
					}
				}

				$('#lightboxImage').
					attr('src', opts.imageArray[opts.activeImage][0])
					// .width(newWidth).
					// height(newHeight);

					resizeImageContainer(newWidth, newHeight);
			};

			imgPreloader.src = opts.imageArray[opts.activeImage][0];
		};

		function end() {
			clearInterval(intervalId);

			$('#lightbox').hide();
			$('#overlay').fadeOut(0);
			$('select, object, embed').show();
		};

		function preloadNeighborImages() {
			var preloadPrevImage, preloadNextImage;
			if (opts.loopImages && opts.imageArray.length > 1) {
				preloadNextImage = new Image();
				preloadNextImage.src = opts.imageArray[(opts.activeImage == (opts.imageArray.length - 1)) ? 0 : opts.activeImage + 1][0];

				preloadPrevImage = new Image();
				preloadPrevImage.src = opts.imageArray[(opts.activeImage == 0) ? (opts.imageArray.length - 1) : opts.activeImage - 1][0];
			} else {
				if ((opts.imageArray.length - 1) > opts.activeImage) {
					preloadNextImage = new Image();
					preloadNextImage.src = opts.imageArray[opts.activeImage + 1][0];
				}
				if (opts.activeImage > 0) {
					preloadPrevImage = new Image();
					preloadPrevImage.src = opts.imageArray[opts.activeImage - 1][0];
				}
			}
		};

		function resizeImageContainer(imgWidth, imgHeight) {
			// get current width and height
			opts.widthCurrent = $("#outerImageContainer").outerWidth();
			opts.heightCurrent = $("#outerImageContainer").outerHeight();

			// get new width and height
			var widthNew = Math.max(350, imgWidth  + (opts.borderSize * 2));
			var heightNew = (imgHeight  + (opts.borderSize * 2));

			// calculate size difference between new and old image, and resize if necessary
			wDiff = opts.widthCurrent - widthNew;
			hDiff = opts.heightCurrent - heightNew;

			$('#imageDataContainer').animate({width: opts.widthCurrent},opts.resizeSpeed,'linear');
			$('#outerImageContainer').animate({width: opts.widthCurrent},opts.resizeSpeed,'linear', function() {
				$('#outerImageContainer').animate({height: opts.heightCurrent},opts.resizeSpeed,'linear', function() {
					showImage();
				});
			});
			
			afterTimeout = function () {
				$('#prevLink').height(imgHeight);
				$('#nextLink').height(imgHeight);
			};

			// if new and old image are same size and no scaling transition is necessary,
			// do a quick pause to prevent image flicker.
			if((hDiff == 0) && (wDiff == 0)) {
				setTimeout(afterTimeout, 100);
			} else {
				// otherwise just trigger the height and width change
				afterTimeout();
			}

		};

		function showImage() {
			$('#loading').hide();
			$('#lightboxImage').fadeIn("fast");
			updateDetails();
			preloadNeighborImages();

			opts.inprogress = false;
		};

		function updateDetails() {
			const currentItem = opts.jsonData[opts.activeImage];

			if (opts.imageArray[opts.activeImage][1]) {
				$('#caption').html(opts.imageArray[opts.activeImage][1]).show();
			}

			if (opts.slideNavBar) {
				$("#imageData").slideDown(opts.navBarSlideSpeed);
			} else {
				$("#imageData").show();
			}

			if (currentItem['detail']) {
				$('#detail').html(currentItem['detail']).show();
			}


			if (currentItem['date']) {
				$('#image-date').html(currentItem['date']).show();
			}

			if (currentItem['link']) {
				$("#button-more").click(function(){ window.open(currentItem['link']); return false;});
			}

			$('#lightbox-timer').html('');

			let timerItem = '';

			for(let i = 0; i < 5; i++) {
				timerItem = timerItem + '<span class="warp-item"><span class="item"></span></span>'
			}

			$('#lightbox-timer').html(timerItem).show()


			resizeOverlayToFitWindow();
			updateNav();

			updateTimer();
		};

		function updateTimer() {
			$(".item").css("width","0%");

			let i = 0;

			intervalId = setInterval(function () {
				$(".item").eq(i).animate({width:"100%"},1000);


				if (i >= 5) {
					clearInterval(intervalId);

					changeImage((opts.activeImage == (opts.imageArray.length - 1)) ? 0 : opts.activeImage + 1); 
				}

				i++;
			},1000);
		};

		/*
		# Resize the sexy overlay to fit the constraints of your current viewing environment
		# 
		# This should now happen whenever a window is resized, so you should always see a full overlay
		*/
		function resizeOverlayToFitWindow(){
			$('#overlay').css({width: $(document).width(), height: $(document).height()});
		};

		function updateNav() {
			if (opts.imageArray.length > 1) {
				//$('#hoverNav').show();

				// if loopImages is true, always show next and prev image buttons 
				if(opts.loopImages) {
					$('#prevLink,#prevLinkText').show().click(function() {
						changeImage((opts.activeImage == 0) ? (opts.imageArray.length - 1) : opts.activeImage - 1); 
						return false;
					});

					$('#nextLink,#nextLinkText').show().click(function() {
						changeImage((opts.activeImage == (opts.imageArray.length - 1)) ? 0 : opts.activeImage + 1); 
						return false;
					});

				} else {
					// if not first image in set, display prev image button
					if(opts.activeImage != 0) {
						$('#prevLink,#prevLinkText').show().click(function() {
							changeImage(opts.activeImage - 1); 
							return false;
						});
					}

					// if not last image in set, display next image button
					if(opts.activeImage != (opts.imageArray.length - 1)) {
						$('#nextLink,#nextLinkText').show().click(function() {
							changeImage(opts.activeImage +1); 
							return false;
						});
					}
				}

			}

		};
	};

		$.fn.lightbox.parseJsonData = function(data) {
			var imageArray = [];

			$.each(data, function() {
				imageArray.push(new Array(this.url, this.title));
			});

			return imageArray;
		};

		$.fn.lightbox.defaults = {
		  triggerEvent: "click",
			allSet: false,
			fileLoadingImage: 'images/loading.gif',
			fileBottomNavCloseImage: 'images/x.svg',
			overlayOpacity: 0.6,
			borderSize: 10,
			imageArray: new Array,
			activeImage: null,
			imageScroll: false,
			inprogress: false,
			resizeSpeed: 0,
			widthCurrent: 250,
			heightCurrent: 250,
			scaleImages: false,
			xScale: 1,
			yScale: 1,
			displayTitle: true,
			navbarOnTop: false,
			displayDownloadLink: false,
			slideNavBar: false, 
			navBarSlideSpeed: 0,
			displayHelp: false,
			strings: {
				help: ' \u2190 / P - previous image\u00a0\u00a0\u00a0\u00a0\u2192 / N - next image\u00a0\u00a0\u00a0\u00a0ESC / X - close image gallery',
				prevLinkTitle: 'previous image',
				nextLinkTitle: 'next image',
				prevLinkText:  '&laquo; Previous',
				nextLinkText:  'Next &raquo;',
				closeTitle: 'close image gallery',
				image: 'Image ',
				of: ' of ',
				download: 'Download'
			},
			fitToScreen: false,		
			disableNavbarLinks: false,
			loopImages: false,
			imageClickClose: true,
			jsonData: null,
			jsonDataParser: null
		};	
})(jQuery);
