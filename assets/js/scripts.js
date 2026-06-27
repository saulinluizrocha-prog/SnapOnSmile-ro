$(function () {

  
/***
  ** Polyfills
  **/

objectFitImages(); // object-fit polyfill

/***
  ** Lottery
  **/

// constructor function
var Spinner = function(options) {
  var self = this;

  var defaults = {
    element: '.spinner',
    sections: [10,20,30,40,50,60,70,80],
    spinRound: 7,
    spinSpeed: 1200,
    goalSections: [80],
    percent: 40,
    degree: 0,
    localStorage: true
  };

  $.extend(self, defaults, options);

  self.init();

  return self;
};

Spinner.prototype.init = function() {

  this.sectionNumber = this.sections.length;
  this.spinSpeed = this.spinRound*1200;
  this.sectionDegree = 360/this.sectionNumber;

};

Spinner.prototype.getSection = function() {

  var numLow = 0, numHigh = this.goalSections.length-1;
  var adjustedHigh = (parseFloat(numHigh) - parseFloat(numLow)) + 1;
  var numRand = Math.floor(Math.random()*adjustedHigh) + parseFloat(numLow);

  this.percent = this.goalSections[numRand];
  return this.sections.indexOf(this.percent) + 1;

};

Spinner.prototype.getDegInsideSection = function() {

  var numLow = 2, numHigh = this.sectionDegree-2;
  var adjustedHigh = (parseFloat(numHigh) - parseFloat(numLow)) + 1;
  var degInsideSection = Math.floor(Math.random()*adjustedHigh) + parseFloat(numLow);

  return degInsideSection;

};

Spinner.prototype.getDegree = function() {

  var fullCycle = this.spinRound * 360;
  var degToRandSection = this.getSection()*this.sectionDegree;
  var degInsideSection = this.getDegInsideSection();
  var goalSection = fullCycle - degToRandSection + degInsideSection;

  this.degree = goalSection;
  return goalSection;

};

Spinner.prototype.spin = function(beforeSpin, afterSpin) {

  var spinner = this;

  $(this.element).animate({  deg: spinner.getDegree() }, {
    step: function(now,fx) {
      $(this).css('-webkit-transform','rotate('+now+'deg)');
      $(this).css('-moz-transform','rotate('+now+'deg)');
      $(this).css('transform','rotate('+now+'deg)');
    },
    duration: spinner.spinSpeed,
    start: beforeSpin,
    done: afterSpin
  }, 'ease');

};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var spinnerPercentages,
    spinnerBtn = $('.spinner-btn'),
    content = $('.lottery').nextUntil('script').hide();

var spinner = JSON.parse(localStorage['Spinner'] || '{}');

if ($.isEmptyObject(spinner)) {

  var spinner = new Spinner({
    goalSections: [80],
    localStorage: 1
  });

  spinnerBtn.one('click', function() {

    var baubbleAnimation;
    var bubbles = $('[class^="spinner-bubble-"]:visible');
    var bubblesLength = bubbles.length;

    spinner.spin(

      function beforeSpin() {

        $(spinner.element).parent().addClass('spin');

        // spinnerBtn.children('span').hide().html('<span class="spinner-btn-text" style="font-size: 4em">&#9749;</span>').fadeIn(500);

        function doBaubbleAnimation() {
          bubbles.eq(getRandomInt(0, bubblesLength)).addClass('bouncePer').one('animationend oAnimationEnd mozAnimationEnd webkitAnimationEnd', function() {
            $(this).removeClass('bouncePer');
          })
        }

        doBaubbleAnimation();
        baubbleAnimation = setInterval(function(){

          doBaubbleAnimation();

        }, 200)

      },

      function afterSpin() {

      clearInterval(baubbleAnimation);

      bubbles.removeClass('bouncePer');

      $('.spinner-bubble-'+spinner.percent).addClass('bouncePerLong').one('animationend oAnimationEnd mozAnimationEnd webkitAnimationEnd', function() {})

      $('.orders .circles').hide();
      // $('.lottery').hide(1000);

      content.show(1000);

      $('.orders .circles').fadeIn(1000);

      $(spinner.element).parent().removeClass('spin');

      spinnerBtn.children('span').hide().removeAttr('style').html('Felicitări<br> reducerea dumneavoastră este de <b>50%</b>').fadeIn(500);

      $('.discount').text(spinner.percent);

      $('.old-price').each(function(){
        _this = $(this);
        var actualPrice = parseFloat(_this.siblings('.actual-price').text());
        var oldPrice = Math.round((actualPrice / (100 - spinner.percent)) * 100);
        _this.text(oldPrice + ' грн');
      });

      $('.slick-initialized').each(function(){
        $(this).slick('setPosition');
      });

      setTimeout(function() {

        $('html, body').animate({
          scrollTop: content.eq(0).offset().top
        }, 1000);

      }, 1000)

      localStorage.Spinner = JSON.stringify(spinner.localStorage && spinner);

      }

    );

  });


} else {

  content.show();

  spinnerBtn.children('span').hide().removeAttr('style').html('Felicitări<br> reducerea dumneavoastră este de <b>50%</b>').fadeIn(500);

  $('.discount').text(spinner.percent);

  $('.old-price').each(function(){
    _this = $(this);
    var actualPrice = parseFloat(_this.siblings('.actual-price').text());
    var oldPrice = Math.round((actualPrice / (100 - spinner.percent)) * 100);
    _this.text(oldPrice + ' грн');
  });

  $(spinner.element).animate({deg: spinner.degree}, {
    duration: 0,
    step: function(now,fx){
      $(this).css('-webkit-transform','rotate('+now+'deg)');
      $(this).css('-moz-transform','rotate('+now+'deg)');
      $(this).css('transform','rotate('+now+'deg)');
    }
  });

}


$('.top-banner-btn').addClass('bounce');

$('.top-banner-btn').click(function() {

  var target = $(this.hash);

  if (target.length) {
    $('html,body').animate({
      scrollTop: target.offset().top - ($(window).height()/2 - target.height()/2)
    }, 1000);
    return false;
  }
});


$('.order-info-links').find('a[href*="#"]').click(function() {

  var target = $(this.hash);

  if (target.length) {
    $('html,body').animate({
      scrollTop: target.offset().top
    }, 1000);
    return false;
  }
});


/**
** Order Forms
**/

var orderForms = $('.order-form');
var orderForms1 = $('.order1 .order-form');
var orderForms2 = $('.order2 .order-form');

orderForms1.each(function(){

  var orderForm = $(this);

  orderForm.find('input[name=phone]').closest('.form-group')
  .after(
    '<div class="order-info-sizes form-group size-group">' +
      '<div class="sizes-title">Выберите размер:</div>' +
      '<div class="sizes">' +
        '<div data-size="36/23.5 см" class="size">36/23,5 см</div>' +
        '<div data-size="37/24 см" class="size">37/24 см</div>' +
        '<div data-size="38/24.5 см" class="size">38/24.5 см</div>' +
        '<div data-size="39/25 см" class="size">39/25 см</div>' +
        '<div data-size="40/25.5 см" class="size">40/25.5 см</div>' +
      '</div>' +
    '</div>'
  );

  // orderForm.find('input[name=name_first]').closest('.form-group')
  // .before(
  //   '<div class="order-info-colors form-group color-group">' +
  //     '<div class="colors-title">Выберите цвет:</div>' +
  //     '<div class="colors">' +
  //       '<div data-color="Розовый" class="color color-pink active">' +
  //         '<i class="color-icon"></i>' +
  //         'Розовый</div>' +
  //       '<div data-color="Белый" class="color color-white">' +
  //       '<i class="color-icon"></i>' +
  //       'Белый</div>' +
  //     '</div>' +
  //   '</div>'
  // );

  orderForm.find('input[name=name_last]').parent().css({
    'visibility': 'hidden',
    'position': 'absolute'
  });

  orderForm.find('button').addClass('btn btn-order').closest('.form-group').addClass('btn-group');
  orderForm.find('input').addClass('input').closest('.form-group').addClass('input-group');

});

orderForms2.each(function(){

  var orderForm = $(this);

  orderForm.find('input[name=phone]').closest('.form-group')
  .after(
    '<div class="order-info-sizes form-group size-group">' +
      '<div class="sizes-title">Выберите размер:</div>' +
      '<div class="sizes">' +
        '<div data-size="40/26.5 см" class="size">40/26.5 см</div>' +
        '<div data-size="41/27.5 см" class="size">41/27.5 см</div>' +
        '<div data-size="42/28 см" class="size">42/28 см</div>' +
        '<div data-size="43/28.5 см" class="size">43/28.5 см</div>' +
        '<div data-size="44/29 см" class="size">44/29 см</div>' +
        '<div data-size="45/29.5 см" class="size">45/29.5 см</div>' +
      '</div>' +
    '</div>'
  );

  // orderForm.find('input[name=name_first]').closest('.form-group')
  // .before(
  //   '<div class="order-info-colors form-group color-group">' +
  //     '<div class="colors-title">Выберите цвет:</div>' +
  //     '<div class="colors">' +
  //       '<div data-color="Розовый" class="color color-pink active">' +
  //         '<i class="color-icon"></i>' +
  //         'Розовый</div>' +
  //       '<div data-color="Белый" class="color color-white">' +
  //       '<i class="color-icon"></i>' +
  //       'Белый</div>' +
  //     '</div>' +
  //   '</div>'
  // );

  orderForm.find('input[name=name_last]').parent().css({
    'visibility': 'hidden',
    'position': 'absolute'
  });

  orderForm.find('button').addClass('btn btn-order').closest('.form-group').addClass('btn-group');
  orderForm.find('input').addClass('input').closest('.form-group').addClass('input-group');

});


/***
  ** Size Handler
  **/

var sizes = $('.sizes').find('.size');

$('.sizes').on('click', '.size', function() {
  sizes.removeClass('active');
  $(this).addClass('active');
});

/***
  ** Color Handler
  **/

var colors = $('.colors').find('.color');

colors.on('click', function() {
  $(this).closest('.color-group').find('.color').removeClass('active');
 // colors.removeClass('active');
  $(this).addClass('active');
});

$('.color-pink').on('click', function() {
  $('.js-order-slider').slick('slickGoTo', 0, true)
});

$('.color-white').on('click', function() {
  $('.js-order-slider').slick('slickGoTo', 6, true)
});

$('.colorPink').on('click', function() {
  $('.js-order-slider-2').slick('slickGoTo', 0, true)
});

$('.colorWhite').on('click', function() {
  $('.js-order-slider-2').slick('slickGoTo', 6, true)
});

/**
** Order Sliders
**/

var orders = $('.order');

orders.each(function(){

  var _this = $(this);

  _this.find('.js-order-slider').on('init', function(event, slick) {
    objectFitImages($(this).find('img'));
  });
  _this.find('.js-order-slider-2').on('init', function(event, slick) {
    objectFitImages($(this).find('img'));
  });

  _this.find('.js-order-slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    rows: 0,
    speed: 300,
    arrows: false,
    asNavFor: _this.find('.order-slider-nav')
  });

  _this.find('.js-order-slider-2').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    rows: 0,
    speed: 300,
    arrows: false,
    asNavFor: _this.find('.order-slider-nav-2')
  });

  _this.find('.order-slider-nav').on('init', function(event, slick) {
    objectFitImages($(this).find('img'));
  });
  _this.find('.order-slider-nav-2').on('init', function(event, slick) {
    objectFitImages($(this).find('img'));
  });

  _this.find('.order-slider-nav').slick({
    slidesToShow: 12,
    slidesToScroll: 1,
    rows: 0,
    speed: 300,
    dots: false,
    asNavFor: _this.find('.js-order-slider'),
    focusOnSelect: true
  });

  _this.find('.order-slider-nav-2').slick({
    slidesToShow: 12,
    slidesToScroll: 1,
    rows: 0,
    speed: 300,
    dots: false,
    asNavFor: _this.find('.js-order-slider-2'),
    focusOnSelect: true
  });

});


/***
  ** Reviews Slider
  **/

$('.reviews-slider').slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  rows: 0,
  speed: 300,
  arrows: true,
  dots: true,
  nextArrow: '.reviews-slider-next',
  prevArrow: '.reviews-slider-prev',
  asNavFor: '.reviews-slider-nav'
});

$('.reviews-slider-nav').slick({
  slidesToShow: 5,
  slidesToScroll: 1,
  rows: 0,
  speed: 300,
  dots: false,
  arrows: false,
  asNavFor: '.reviews-slider',
  focusOnSelect: true
});

$('.reviews-slider-nav').on('beforeChange', function(event, slick, currentSlide, nextSlide){
  var $currentSlide = $(slick.$slides.get(currentSlide));
  var $nextSlide = $(slick.$slides.get(nextSlide));

  var $currentSlideTop = $currentSlide.position().top;
  var $currentSlideLeft = $currentSlide.position().left;
  var $nextSlideTop = $nextSlide.position().top;
  var $nextSlideLeft = $nextSlide.position().left;

  var $nWidth = $nextSlide.width();
  var $nHeight = $nextSlide.height();
  var $cWidth = $currentSlide[0].getBoundingClientRect().width;
  var $cHeight = $currentSlide[0].getBoundingClientRect().height;

  if (currentSlide !== nextSlide) {

    $nextSlide.animate({
        top: ($currentSlideTop + $cHeight/2 - $nHeight/2) / $(this).height() * 100 + '%',
        left: ($currentSlideLeft + $cWidth/2 - $nWidth/2) / $(this).width() * 100 + '%'
      },
      400,
      function() {

      }
    );
    $currentSlide.animate({
        top: $nextSlideTop / $(this).height() * 100 + '%',
        left: $nextSlideLeft / $(this).width() * 100 + '%'
      },
      400,
      function() {

      }
    );

  }

});


/**
** Magnific Popup Gallery
**/

$('.gallery').magnificPopup({
  delegate: 'a',
  type: 'image',
  gallery: {
    enabled: true,
    navigateByImgClick: true,
  },
  mainClass: 'mfp-fade'
});


/**
** Magnific Product Gallery
**/

orders.each(function(){

  $(this).find('.js-order-slider').magnificPopup({
    delegate: 'a',
    type: 'image',
    gallery: {
      enabled: true,
      navigateByImgClick: true,
    },
    mainClass: 'mfp-fade'
  });

});


/**
** Magnific Popup Policy
**/

$('.policy-link').magnificPopup({
  type: 'inline',
  closeBtnInside: true,
  fixedContentPos: true
});



/**
** Media Query Events via JavaScript
**/

//
// 1200px
//
// on document.ready
if(matchMedia("(max-width: 1199px)").matches) {

  } else {

}
//
// on window.resize
matchMedia("(max-width: 1199px)").addListener(function(mql) {

  if(mql.matches) {

  } else {

  }

});


//
// 992px
//
// on document.ready
if(matchMedia("(max-width: 991px)").matches) {

} else {

}
//
// on window.resize
matchMedia("(max-width: 991px)").addListener(function(mql) {

  if(mql.matches) {

  } else {

  }

});

var reviewsSlider = $('.reviews-slider');
var reviewsSliderNav = $('.reviews-slider-nav');

//
// 768px
//
// on document.ready
if(matchMedia("(max-width: 767px)").matches) {

  if (reviewsSliderNav.hasClass('slick-initialized')) {
    reviewsSliderNav.slick('unslick');
  }

} else {

  if (!reviewsSliderNav.hasClass('slick-initialized')) {
    reviewsSliderNav.slick({
      slidesToShow: 5,
      slidesToScroll: 1,
      rows: 0,
      speed: 300,
      dots: false,
      arrows: false,
      asNavFor: '.reviews-slider',
      focusOnSelect: true
    });

    reviewsSliderNav.slick('slickGoTo', reviewsSlider.slick('slickCurrentSlide'));
  }

}
//
// on window.resize
matchMedia("(max-width: 767px)").addListener(function(mql) {

  if(mql.matches) {

    if (reviewsSliderNav.hasClass('slick-initialized')) {
      reviewsSliderNav.slick('unslick');
    }

  } else {

    if (!reviewsSliderNav.hasClass('slick-initialized')) {
      reviewsSliderNav.slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        rows: 0,
        speed: 300,
        dots: false,
        arrows: false,
        asNavFor: '.reviews-slider',
        focusOnSelect: true
      });

      reviewsSliderNav.slick('slickGoTo', reviewsSlider.slick('slickCurrentSlide'));
    }

  }

});

//
// 576px
//
// on document.ready
if(matchMedia("(max-width: 575px)").matches) {

} else {



}
//
// on window.resize
matchMedia("(max-width: 575px)").addListener(function(mql) {

  if(mql.matches) {

  } else {

  }

});


});
 