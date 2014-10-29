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
			thecontext.drawImage(video,video.width * -1,0,video.width,video.height);
			
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
			giftest = document.getElementById("gif_box_img");
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
			frequencies = new Uint8Array(analyser.frequencyBinCount/32);
			console.log(frequencies.length);
			analyser.getByteFrequencyData(frequencies);
			window.requestAnimationFrame(animate);
			// setInterval(clampEvaluation,150);
			setInterval(clampEvaluation,250);
			

		};
	// <=================Audio Animation===================>
		var threshold = 80;
		// var threshold = 110;
		var voice_test = false;
		var voiceCount =0;
		var animate = function() {
			
			audiograph = document.getElementById('audiograph');
			thecontext_audio = audiograph.getContext('2d');
			analyser.getByteFrequencyData(frequencies);
			thecontext_audio.clearRect(0,0,audiograph.width, audiograph.height);
			thecontext_audio.fillStyle="rgb(24,24,24)";
			thecontext_audio.fillRect(0,0,audiograph.width,audiograph.height);
			//Indentify clamps with frequencies of Input
			
			var countThreshold = null;
			
			for (var i = 0; i < frequencies.length; i++)
			{	
				thecontext_audio.fillStyle = "rgb(200,124,255);"
				thecontext_audio.fillRect(i*15,audiograph.height-frequencies[i]/2, 12 , audiograph.height);	
				
				if(frequencies[i] >threshold) {
					countThreshold ++;
				}
			}

			filterVoice();
				
			if(countThreshold > 27 && clamp_eval >110){
				document.getElementById("clamp").innerHTML = "YOU ROCK!!";
				setTimeout(function(){
					document.getElementById("clamp").innerHTML = " ";
				}, 1000);
				takePicture();
			}

			if(clamp_eval > 40){
				// filterVoice();
				// document.getElementById("clamp").innerHTML = "Am I hearing something?";
				setTimeout(function(){
					document.getElementById("clamp").innerHTML = " ";
				}, 1000);
			}else if(clamp_eval > 80){
				document.getElementById("clamp").innerHTML = "Almost!!";
				setTimeout(function(){
					document.getElementById("clamp").innerHTML = " ";
				}, 1000);

			}
			window.requestAnimationFrame(animate);		
		};

		var cur_val;
		var last_val;
		var clamp_eval;

		var clampEvaluation = function() {
			
			analyser.getByteFrequencyData(frequencies);
			cur_val = 0;
			for (var i = 0; i < frequencies.length; i++)
			{	
				cur_val += frequencies[i];			
			}
			clamp_eval= Math.floor(Math.abs((cur_val-last_val)/32));
			last_val = cur_val;
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
					createGif();
					getScore();
					$("#gif_container").css("display","block");
					$("#gif_container").animate({top:"1500px"},"1000");
					$("#video_container").hide();
					$("#gif_display").hide();
					$("#audio_container").hide();

			}
				// else{
				// 	endTime = new Date().getTime();
				// 	//if 1 seconds is passed, enable retake picture
				// 	if(Math.abs(startTime-endTime || isPictureTaken ===true) > 1000) {
				// 		//console.log(startTime-endTime);
				// 		isPictureTaken = false;
				// 	}
				// }
			}

		var getScore = function(){
			var total = null;
			var score = null;
			for(var i = 0; i< frequencies.length; i++){
				total += frequencies[i];
			}
			score = Math.floor(total/frequencies.length);
		}
		$(document).ready(function(){
			$("#gif_display").load("/mainpage_gifs #import_gif");
			$("#audioBtn").click(function(){
			$("#audiograph").toggle();
			});
			$("#retake").click(function(){
				console.log("retake");
				isPictureTaken = false;
				$("#gif_container").animate({top:"-1100px"},"slow",function(){
					$("#video_container").show('fast');
					$("#gif_display").show('fast');
					$("#audio_container").show('fast');
				});
			});
			$("#sendtext").click(function(){
				load("/sendSms/ilwonyoon/7732512040");
			});

		});


		var filterVoice = function(){
			analyser.getByteFrequencyData(frequencies);
			for (var i = frequencies.length; i > 1; i--){	
				if(Math.abs(frequencies[i] - frequencies[i-1]) > 20)
				{
					voiceCount++;
				}
			}
			// if(voiceCount > 10){
			// 	voice_test = true;
			// }else{
			// 	voice_test = false;
			// }
			console.log("voice : " + voiceCount);

		}

		window.addEventListener('load', initWebRTC, false);


















