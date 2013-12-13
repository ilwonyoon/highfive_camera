	//Canvas Element
	var thecanvas = null;
	var thecontext = null;
	var audiograph =null;
	var thecontext_audio = null;

	var gifbox = null;
	var gifbox_context = null;

	var video;
	
	var frequencies = null;
	var analyser = null;
	
	var initWebRTC = function() {
			
		// These help with cross-browser functionality
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		
		// The video element on the page to display the webcam
		video = document.getElementById('thevideo');
		 
		// if we have the method
		if (navigator.getUserMedia) {
			navigator.getUserMedia({video: true, audio:true},webRTCInit, function(error) {alert("Failure " + error.code);});
		}

		var draw = function() {

			gifbox = document.getElementById('gif_box');
			gifbox_context = gifbox.getContext('2d');
			thecanvas = document.getElementById('thecanvas');
			thecontext = thecanvas.getContext('2d');
			gifbox_context.fillStyle="rgb(255,255,255)";
			gifbox_context.fillRect(0,0,640,520);
			thecontext.scale(-1,1);
			video.width = 480;
			video.height = 360;
			thecontext.drawImage(video,video.width * -1 -40,40,video.width,video.height);
			
			window.requestAnimationFrame(draw);		
		};

		setInterval(allCapturedImage,150);
		draw();
				
				
	};

	// <=================createGif===================>

	var createGif = function(){
		var base64;
		var gif = new GIF({
			repeat : 0,
			worker:2,
			quality:30,
			width :480,
			height:360
		});
		for (var i = 0; i < 12; i++) {
	        $('#img-' + i).each(function() {
	          //console.log($(this).context);
	          gif.addFrame($(this).context,{delay :100});
	        });
	      }
		gif.on('finished',function(blob){
			giftest = document.getElementById("giftest");
			giftest.src = URL.createObjectURL(blob);
			console.log(giftest.src);
			//convert blob object to base64 in order to upload to
			var reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = function(){
				base64= reader.result;
				$("#image_data").val(base64);
			};
			
		});
		gif.render();
		console.log('gif created');
	};

	// <=================Image Array===================>

		var imgArray =new Array();
			var imgLen = 16;
			var imgCount = 0; 
			var picture = null;

		var allCapturedImage = function(){
			if(imgCount !== null && imgCount < imgLen){
				imgCount += 1;
				if(imgCount >= imgLen){
					imgCount = 0;
				}
			}
			imgArray[imgCount] = thecanvas.toDataURL('image/webp', 1);
			
		    if(video.src !== ""){
				picture = document.getElementById('img-'+imgCount+'');
			    picture.style.width ="120px";
			    picture.style.height ="90px";
			    picture.src = imgArray[imgCount];
			    document.getElementById('gallery').appendChild(picture);
		    }
		};

	// <=================Audio Init===================>
		var binCount = 16;

		var webRTCInit = function(stream){
			console.log("video init");
			video.src = window.URL.createObjectURL(stream) || stream;
			video.play();
			// Fixes prefix issues
			console.log("audio init");
		    window.AudioContext = window.AudioContext||window.webkitAudioContext;
		
			// The context is the base for the API.
			var audioContext = new AudioContext();
			var audioSource = audioContext.createMediaStreamSource(stream);

			
			// FFT
			analyser = (analyser || audioContext.createAnalyser());
			audioSource.connect(analyser);
			// frequencies = new Uint8Array(analyser.frequencyBinCount/128);
			frequencies = new Uint8Array(analyser.frequencyBinCount/16);
			console.log(frequencies.length);
			analyser.getByteFrequencyData(frequencies);
			window.requestAnimationFrame(animate);

		};
	// <=================Audio Animation===================>
		var animate = function() {

			audiograph = document.getElementById('audiograph');
			thecontext_audio = audiograph.getContext('2d');
			
			analyser.getByteFrequencyData(frequencies);
			thecontext_audio.clearRect(0,0,audiograph.width, audiograph.height);
			thecontext_audio.fillStyle="rgb(24,24,24)";
			thecontext_audio.fillRect(0,0,audiograph.width,audiograph.height);
			//Indentify clamps with frequencies of Input
			var threshold = null;
			for (var i = 0; i < frequencies.length; i++)
			{	
				thecontext_audio.fillStyle = "rgb(200,124,255);"
				thecontext_audio.fillRect(i*10,audiograph.height-frequencies[i]/4, 8 , audiograph.height);	
				if(frequencies[i] >160) {
					threshold ++;
				}				
			}

			if(threshold > 60){
					takePicture();
			}
			
			 window.requestAnimationFrame(animate);		
		};

	// <=================Capture Image & Gif===================>
		var isPictureTaken = false;
		var startTime;
		var endTime;
		var numberOfPicture =0;

		var takePicture = function(){
				if(isPictureTaken === false){
					//start measure time
					startTime = new Date().getTime();
					isPictureTaken = true;
					console.log("picture taken");
					var dataUrl = thecanvas.toDataURL('image/webp', 1);
					$("#upload").click(function(){
						$("#upload").submit();
						console.log("submit a picture");
					});
					
					$("#form_container").animate({
						width: "toggle",
						height : "toggle"
					},{duration: 500});
					createGif();
					getScore();
			}
				else{
					endTime = new Date().getTime();
					//if 1 seconds is passed, enable retake picture
					if(Math.abs(startTime-endTime || isPictureTaken ===true) > 1000) {
						//console.log(startTime-endTime);
						isPictureTaken = false;
					}
				}
			}

		var getScore = function(){
			var total = null;
			var score = null;
			for(var i = 0; i< frequencies.length; i++){
				total += frequencies[i];
			}
			score = Math.floor(total/frequencies.length);
		}

		window.addEventListener('load', initWebRTC, false);


















