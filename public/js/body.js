//Canvas Element
			var thecanvas = null;
			var thecontext = null;
			var audiograph =null;
			var thecontext_audio = null;

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

					thecanvas = document.getElementById('thecanvas');
					thecontext = thecanvas.getContext('2d');
					thecontext.drawImage(video,0,0,video.width,video.height);
					window.requestAnimationFrame(draw);
					
				};
				draw();
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
				frequencies = new Uint8Array(analyser.frequencyBinCount/32);
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
				
				//Indentify clamps with frequencies of Input
				var threshold = null;

				for (var i = 0; i < frequencies.length; i++)
				{	

					// thecontext_audio.moveTo(0,i*10);
					// thecontext_audio.lineTo(audiograph.width,i*10);
					// thecontext_audio.lineWidth=0.1;
					// thecontext_audio.stroke();

					thecontext_audio.fillStyle = "rgb(0,0,255);"
					thecontext_audio.fillRect(i*10,audiograph.height-frequencies[i]/5, 10, audiograph.height);	


					if(frequencies[i] >50) {
						threshold ++;
					}
					
				}
				if(threshold > 27){
						takePicture();
					}
				
				 window.requestAnimationFrame(animate);		
			};

			var isPictureTaken = false;
			var startTime;
			var endTime;


			var takePicture = function(){
				if(isPictureTaken === false){
					//start measure time
					startTime = new Date().getTime();
					isPictureTaken = true;

					var dataUrl = thecanvas.toDataURL('image/webp', 1);

					var picture = document.createElement('img');

					picture.src = dataUrl;

					document.body.appendChild(picture);
					console.log("add image element to document");
					console.log("Picture taken");
					getScore();

					//document.getElementById("thecanvas").style.display="none";
			}
				else{
					endTime = new Date().getTime();
					//if 3 seconds is passed, enable retake picture
					if(Math.abs(startTime-endTime || isPictureTaken ===true) > 3000) {
						console.log(startTime-endTime);
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
				console.log("get score :" + score);
				document.getElementById('display_score').innerHTML= score;
				
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