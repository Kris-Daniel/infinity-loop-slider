function createSlider(className, options) {
	options = options ? options : {};

	if(options)
	{
		if(
			!options.hasOwnProperty('speed')
			|| options.speed <= 50
		)
			options.speed = 1000;
		if(
			options.autoplay
			&& options.autoplay < options.speed
		)
			options.autoplay = options.speed;
	}

	var CreateSlider = (function() {
		var CreateSlider = function(item) {
			this.slider  = item;
			this.$slider = $(item);
			this.$box    = $(item).find('.box');
			this.$left   = $(item).find('.left');
			this.$right  = $(item).find('.right');

			this.setup();
		};

		/*CreateSlider.prototype = Object.create(SliderData.prototype);
		CreateSlider.prototype.constructor = CreateSlider;*/

		CreateSlider.prototype.setup = function()
		{
			var it = this;

			//indexing slides ones
			if(!this.indexed)
			{
				this.indexed = true;
				$.each(this.getSlides(), function(index, value) {
					$(value).attr('data-ind', index);
				});
			}

			//add pushOut
			if(!this.pushOut)
			{
				this.pushOut = document.createElement('div');
				this.pushOut.className = 'pushOut';
				this.pushOut.style.transition = options.speed + 'ms all ease';
			}
			this.$box.prepend(this.pushOut);


			this.addSlides();

			//set clicks
			if(!this.settedClicks)
			{
				this.settedClicks = true;

				this.$left.click(function(e) {
					this.setted = true;
					it.setLeftClick(e, it);
				});

				this.$right.click(function(e) {
					this.setted = true;
					it.setRightClick(e, it);
				});

				if(options.dots) this.createDots();
			}

			this.setAutoplay();
		}

		CreateSlider.prototype.removeSlides = function(who)
		{
			//remove first or last item;
			var slides = this.getSlides();
			if(who == 'last')
				$(slides).last().remove();
			else if(who == 'first')
				$(slides).first().remove();
		}

		CreateSlider.prototype.addSlides = function(where)
		{
			//add clonedSlides
			var clonedSlides = this.cloneSlides();
			if(where == 'start')
				$(clonedSlides.last).insertAfter(this.pushOut)
			else if(where == 'end')
				this.$box.append(clonedSlides.first);
			else
			{
				this.$box.append(clonedSlides.first);
				$(clonedSlides.last).insertAfter(this.pushOut);
			}
		}

		CreateSlider.prototype.cloneSlides = function()
		{
			var slides = this.getSlides();

			//set right indexes
			if(!this.notFirstCloning)
			{
				var lastIndex  = slides.length - 1;
				var firstIndex = 0;
				this.notFirstCloning = true;
			}
			else
			{
				var lastIndex  = slides.length - 2;
				var firstIndex = 1;
			}

			//return cloned items
			var clonedSlides = {
				first: slides[firstIndex].cloneNode(true),
				last:  slides[lastIndex].cloneNode(true)
			}
			return clonedSlides;
		}

		CreateSlider.prototype.getSlides = function()
		{
			return this.$box.find('.slide');
		}

		CreateSlider.prototype.resetPushOut = function()
		{
			this.pushOut.style.transition = 'none';
			this.pushOut.style.width = '100%';
		}

		CreateSlider.prototype.setLeftClick = function(e, it)
		{
			var func = function()
			{
				it.removeSlides('last');
				it.resetPushOut();
				it.addSlides('start');
			};
			it.btnInsertClick(func, '200%');
		}

		CreateSlider.prototype.setRightClick = function(e, it)
		{
			var func = function()
			{
				it.removeSlides('first');
				it.resetPushOut();
				it.addSlides('end');
			};
			it.btnInsertClick(func, '0%');
		}

		CreateSlider.prototype.btnInsertClick = function(func, pushOutSize)
		{
			var it = this;
			it.clearAutoplay();
			if(!it.btnClicked)
			{
				it.btnClicked = true;
				it.pushOut.style.width = pushOutSize;
				if(options.dots)
				{
					var curentViewSlide = pushOutSize == '0%' ? 2 : 0;
					var curentSlideInd  = $(it.getSlides()[curentViewSlide]).data('ind');
					it.activeDot.className = 'dot';
					it.activeDot = it.$dots[curentSlideInd];
					it.activeDot.className  = 'dot active';
				}
				setTimeout(function()
				{
					func();
					setTimeout(function()
					{
						it.pushOut.style.transition = options.speed + 'ms all ease';
						it.setAutoplay();
						it.btnClicked = false;
					}, 20);
				}, options.speed - 10);
			}
		}

		CreateSlider.prototype.createDots = function()
		{
			var it = this;
			var div  = document.createElement('div');
			var dots = div.cloneNode(true);

			dots.className = 'dots';

			var slides = this.getSlides();
			for (var i = 1; i < slides.length - 1; i++)
			{
				var dot  = div.cloneNode(true);
				dot.className = 'dot';
				dot.slide = slides[i].cloneNode(true);
				dot.ind   = i - 1;
				if(i == 1)
				{
					dot.className  += ' active';
					this.activeDot = dot;
				}

				$(dot).click(function(e){
					if(!it.btnClicked) it.setDotClick(e, this);
				})
				$(dots).append(dot);
			}

			this.$dotsBox = $(dots);
			this.$dots    = $(dots).find('.dot');
			this.$slider.append(dots);
		}

		CreateSlider.prototype.setDotClick = function(e, dot)
		{
			var it = this;

			if(!$(dot).hasClass('active'))
			{
				//set new active dot
				this.activeDot.className = 'dot';
				this.activeDot = dot;
				dot.className  = 'dot active';

				//make new sequence of slides
				var newSequence = [].slice.call(this.$dots, dot.ind);
				newSequence     = newSequence.concat([].slice.call(this.$dots, 0, dot.ind))

				//refresh slider with new sequence
				this.$box.empty();
				newSequence.forEach(function(item, index) {
					it.$box.append(item.slide);
				});

				this.notFirstCloning = false;
				this.setup();
			}
			it.clearAutoplay();
			it.setAutoplay();
		}

		CreateSlider.prototype.setAutoplay = function()
		{
			if(options.autoplay)
			{
				var it = this;
				if(!this.autoplayed)
				{
					this.autoplay = setInterval(function() {
						it.$right.click();
					}, options.autoplay);
					this.autoplayed = true;
				}
			}
		}

		CreateSlider.prototype.clearAutoplay = function()
		{
			if(options.autoplay && this.autoplay)
			{
				this.autoplayed = false;
				clearInterval(this.autoplay);
			}
		}

		return CreateSlider;
	})();

	$.each($(className), function(index, value) {
		new CreateSlider(value);
	});
}

createSlider('.slider');