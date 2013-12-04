//Canvas Element
			var thecanvas = null;
			var thecontext = null;
			var audiograph =null;
			var thecontext_audio = null;

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
				setInterval(allCapturedImage,200);
				draw();
				
				
			};

			// ------------------------------
			// createGif
			
			
			var createGif = function(){
				var gif = new GIF({
					repeat : 0,
					worker:2,
					quality:30,
					width :640,
					height:480
				});
				for (var i = 0; i < 8; i++) {
			        $('#img-' + i).each(function() {
			          console.log($(this).context);
			          gif.addFrame($(this).context,{delay :150});
			          console.log("add frame");
			        });
			      }
				gif.on('finished',function(blob){
					
					window.open(URL.createObjectURL(blob));

				});
				gif.render();
				console.log('gif created');


			}
				


			// ------------------------------

			var imgArray =new Array();
			var imgLen = 8;
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


					if(frequencies[i] >120) {
						threshold ++;
					}
					
				}
				if(threshold > 60){
						takePicture();
					}
				
				 window.requestAnimationFrame(animate);		
			};

			var isPictureTaken = false;
			var startTime;
			var endTime;
			var numberOfPicture =0;
			

			var takePicture = function(){
				if(isPictureTaken === false){
					//start measure time
					startTime = new Date().getTime();
					isPictureTaken = true;

					var dataUrl = thecanvas.toDataURL('image/webp', 1);
					$("#image_data").val(dataUrl);
					$("#upload").click(function(){
						$("#upload").submit();
						console.log("submit a picture");
					});
	
					numberOfPicture+=1;
					document.getElementById('numberOfPicture').innerHTML =numberOfPicture;
					createGif();
					getScore();
					howManyPeople();
					

					//document.getElementById("thecanvas").style.display="none";
			}
				else{
					endTime = new Date().getTime();
					//if 3 seconds is passed, enable retake picture
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
				//console.log("get score :" + score);
				document.getElementById('display_score').innerHTML= score;
				
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
	
			
			window.addEventListener('load', initWebRTC, false);