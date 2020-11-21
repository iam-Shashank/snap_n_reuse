$(document).ready(function() {
  tf = window.tf;

  async function loadMobilenet() {
    const modelWeigths = await tf.loadModel('https://raw.githubusercontent.com/iam-Shashank/reusr/main/model/model.json');
    // const modelWeigths = await tf.loadModel('model/model.json');

    // console.log(modelWeigths);

    // Return a model that outputs an internal activation.
    const layer = modelWeigths.getLayer('dense');
    model = await tf.model({inputs: modelWeigths.inputs, outputs: layer.output});
  };

  canvas = document.createElement('canvas');
  canvas.width  = 224;
  canvas.height = 224;
  ctx = canvas.getContext("2d");
  loadMN = loadMobilenet();

  swiperSide = new Swiper('.product-photos-side .swiper-container', {
    direction: 'horizontal',
    centeredSlides: true,
    spaceBetween: 30,
    slidesPerView: 'auto',
    touchRatio: 0.2,
    slideToClickedSlide: true,
  })
  swiperProduct = new Swiper('.product-photo-main .swiper-container', {
    direction: 'horizontal',
    pagination: '.swiper-pagination',
    paginationClickable: true,
  })

  swiperSide.params.control = swiperProduct;
  swiperProduct.params.control = swiperSide;

  swiperSide.on('transitionEnd', function () {
    if (swiperSide.activeIndex == 12){
      if($("#imageFromUser")[0].src != ""){
        inferImage($("#imageFromUser")[0]);
      }
      else {
        $("#results_title").text("");
        $("#first_place").text("");

      }
    } else {
      inferImage($('.swiper-slide-active img')[0]);
    }
  });

  loadMN.then(function(){
    inferImage($('.swiper-slide-active img')[0]);
  });
});

async function startUserImage(imageFilePath) {
  $("#textInfoSendImage").remove();
  var imgDataURL = window.URL.createObjectURL(document.getElementById('userImageInput').files[0]);
  $("#imageFromUser")[0].src = imgDataURL;
  if(swiperProduct.activeIndex == 12){
    await new Promise(resolve => setTimeout(resolve, 10));
    inferImage($("#imageFromUser")[0]);
  } else{
    swiperProduct.slideTo(12);
  };
};

async function inferImage(image){
  // Set text as "Processing" and erase old results
  $("#results_title").text("Processing...");
  $("#first_place").text("");
  $("#second_place").text("");

  // Deep Learning Inference
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, 224, 224);
  imageData = ctx.getImageData(0, 0, 224, 224);
  imagePixels = tf.fromPixels(imageData).expandDims(0).toFloat().div(tf.scalar(255));
  // console.log(imagePixels);
  predictedArray = await model.predict(imagePixels).as1D().data();

  response = {}

  for (i = 0; i <= 5; i++) {
    if(Number.isFinite(response[labels[i][1]])){
      response[labels[i][1]] += predictedArray[i];
    }
    else {
      response[labels[i][1]] = predictedArray[i];
    }
  };

  response = Object.keys(response).map(item => [item, response[item]]);

  response.sort(function(a, b) {
      return a[1] < b[1] ? 1 : -1;
  });

  // Print top 2 on html elements
  $("#results_title").text("Results");
  $("#first_place").text(buldLabel(response,  0) );

  let url = 'https://raw.githubusercontent.com/iam-Shashank/reusr/main/links.json';
  console.log(url);
  fetch(url)
  .then(res => res.json())
  .then((out) => {
    console.log(response[0][0]);
    console.log(out[response[0][0]][0].title);
    // $("#link1").text(out[response[0][0].toLowerCase()][0].title);
    // $("#link2").text(out[response[0][0].toLowerCase()][1].title);
    // $("#link3").text(out[response[0][0].toLowerCase()][2].title);


    var a = document.createElement('a');    
    // Create the text node for anchor element. 
    var link = document.createTextNode(out[response[0][0].toLowerCase()][0].title); 
    // Append the text node to anchor element. 
    a.appendChild(link); 
    // Set the title. 
    a.title = out[response[0][0].toLowerCase()][0].title;  
    // Set the href property. 
    a.href = out[response[0][0].toLowerCase()][0].url;  
    // Append the anchor element to the body. 
    document.getElementById("link1").appendChild(a); 


    var a = document.createElement('a');    
    // Create the text node for anchor element. 
    var link = document.createTextNode(out[response[0][0].toLowerCase()][1].title); 
    // Append the text node to anchor element. 
    a.appendChild(link); 
    // Set the title. 
    a.title = out[response[0][0].toLowerCase()][1].title;  
    // Set the href property. 
    a.href = out[response[0][0].toLowerCase()][1].url;  
    // Append the anchor element to the body. 
    document.getElementById("link2").appendChild(a); 


    var a = document.createElement('a');    
    // Create the text node for anchor element. 
    var link = document.createTextNode(out[response[0][0].toLowerCase()][2].title); 
    // Append the text node to anchor element. 
    a.appendChild(link); 
    // Set the title. 
    a.title = out[response[0][0].toLowerCase()][2].title;  
    // Set the href property. 
    a.href = out[response[0][0].toLowerCase()][2].url;  
    // Append the anchor element to the body. 
    document.getElementById("link3").appendChild(a); 









  })
  .catch(err => { throw err });

}

//add error handling for other than those 5 tags.

function buldLabel(response, index){
  return response[index][0]+": "+response[index][1].toFixed(4);
}


