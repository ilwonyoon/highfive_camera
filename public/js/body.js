//Canvas Element
			var thecanvas = null;
			var thecontext = null;
			var audiograph =null;
			var thecontext_audio = null;

			var newcanvas = null;
			var newcontext = null;

			var video;
			
			var frequencies = null;
			var analyser = null;
			var howmanypeople = null;
			var hmpContext = null; ;
			
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
					
					thecanvas = document.getElementById('thecanvas');
					thecontext = thecanvas.getContext('2d');
					thecontext.scale(-1,1);
					thecontext.drawImage(video,video.width * -1,0,video.width,video.height);
					howmanypeople = document.getElementById('howmanypeople');
					hmpContext = howmanypeople.getContext('2d');
					
					window.requestAnimationFrame(draw);

					
				};
				setInterval(allCapturedImage,150);
				setInterval(timer,1000);
				
				
				draw();
				
				
			};

			// ------------------------------
			// createGif
			
			var giftest = null;
			
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


			}

			// ------------------------------

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
				    	//picture.id  = "img-" + imgCount;
					    picture.style.width ="120px";
					    picture.style.height ="90px";
					    picture.src = imgArray[imgCount];
					    //picture.style.display ="none";
					    document.getElementById('gallery').appendChild(picture);
				    }
					
			};

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

			var animate = function() {

				audiograph = document.getElementById('audiograph');
				thecontext_audio = audiograph.getContext('2d');
				
				analyser.getByteFrequencyData(frequencies);
				// thecontext_audio.fillStyle = "#00ff00";
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

			var isPictureTaken = true;
			var startTime;
			var endTime;
			var numberOfPicture =0;
			

			var takePicture = function(){
				if(isPictureTaken === false){
					//start measure time
					startTime = new Date().getTime();
					isPictureTaken = true;

					var dataUrl = thecanvas.toDataURL('image/webp', 1);
					//console.log("dataUrl type : " + typeof(dataUrl));

					//$("#image_data").val(dataUrl);
					$("#upload").click(function(){
						$("#upload").submit();
						console.log("submit a picture");
					});

					$("#gif_container").show("slow");
					$("#video_container").hide();
					$("#readyBtn").hide("slow");

					
					$("#form_container").animate({
						width: "toggle",
						height : "toggle"
					},{duration: 500});

					numberOfPicture+=1;
					//document.getElementById('numberOfPicture').innerHTML =numberOfPicture;
					createGif();
					getScore();
					howManyPeople();
					

					//document.getElementById("thecanvas").style.display="none";
			}
				// else{
				// 	endTime = new Date().getTime();
				// 	//if 3 seconds is passed, enable retake picture
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
				//console.log("get score :" + score);
				//document.getElementById('display_score').innerHTML= score;
				
			}
			var howManyPeople = function(){

				hmpContext.fillStyle= "green";
				hmpContext.fillRect(0,30,numberOfPicture*5,200);
			}

			var videoOff = function(){
				document.getElementById("audiograph").style.display="none";
				console.log('video off');
			}
			var videoOn = function(){
				document.getElementById("audiograph").style.display="block";
			}
			var retake =function(){
				document.getElementById("thecanvas").style.display="";
				isPictureTaken = false;
			}

			var min = 2;
			var sec = 60;
			var windowRefresh = false;
			var isTimer = false;

			var timer = function(){

				if(!isTimer){
						if(sec%60 == 0){
						min -= 1;
						sec = 60;
					};
					sec-= 1;

					if(min < 0){
						min = 0;
						sec = 0;
						windowRefresh =true;
						location.reload();
					}
					$("#sec").text(sec);
					$("#min").text(min);	
				}
			}
			var page_refresh = function(){
				$("#profile_holder1").load("/profile_display1");
			}
			var page_refresh2 = function(){
				$("#profile_holder2").load("/profile_display2");
			}

			$(document).ready(function(){
				// profile_display part
				$("#profile_holder1").load("/profile_display1");
				$("#profile_holder2").load("/profile_display2");
				console.log("Log pictures");
				$("#video_container").hide();

				$("#start_high_five").click(function(){
					isPictureTaken = false;
					isTimer = true;
					$("#timer_container").animate({
						width: "toggle",
					    height: "toggle"
					},{
						duration: 500
					});
					// $("#video_container").animate({
					// 	width: "toggle",
					//     height: "toggle"
					// },{
					// 	duration: 500
					// });
					$("#imageholder").animate({
						width: "toggle",
					    height: "toggle"
					},{
						duration: 500

					});
					$("#readyBtn").animate({
						width:"toggle",
						height:"toggle"
					},{duration:500});

					$("#guide_lets_container").animate({
						width:"toggle",
						height:"toggle"
					},{duration:500});

				});
				$("#retake").click(function(){
					isPictureTaken = false;
					console.log("let's retake a gif");
					$("#gif_container").hide("slow");
					//$("#video_container").show();
					$("#form_container").hide("slow");

				});
			});



			window.addEventListener('load', initWebRTC, false);