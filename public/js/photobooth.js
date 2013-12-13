		$(document).ready(function(){

			//if Picture is taken, change display to form
				$("#takePicture").click(function(){
				$("#video_container").hide();
				$("#submitForm").show();

			});

			//Change the display back to Photobooth
			$("#retake").click(function(){
				$("#video_container").show();
				$("#submitForm").hide();

			});

			$("#upload").click(function(){
				$("#upload").submit();
				console.log("submit a picture");
			});
		});
			
			var thecanvas = null;
			var thecontext = null;

			var back = null;
			var backContext = null;
			var video;
			
			var initWebRTC = function() {
			
				// These help with cross-browser functionality
				window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
				navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
				
				// The video element on the page to display the webcam
				 video = document.getElementById('thevideo');
				 
				// if we have the method
				if (navigator.getUserMedia) {
					navigator.getUserMedia({video: true},webRTCInit, function(error) {alert("Failure " + error.code);});
				}

				thecanvas = document.getElementById('thecanvas');
				back = document.getElementById('back');
				var draw = function() {

					backContext = back.getContext('2d');
					backContext.fillStyle = "rgb(255,255,255)";
					backContext.fillRect(0,0,640, 480);
					
					thecontext = thecanvas.getContext('2d');
					thecontext.scale(-1,1);
					video.width = 480;
					video.height = 360;
					thecontext.drawImage(video,video.width * -1,0,video.width,video.height);
					console.log(video.width)
					window.requestAnimationFrame(draw);	
				};
				draw();
				
			};

			var webRTCInit = function(stream){
				console.log("video init");
				video.src = window.URL.createObjectURL(stream) || stream;
				video.play();
			};

			var isPictureTaken = false;
			var takePicture = function(){
				if(isPictureTaken === false){
					//start measure time
					startTime = new Date().getTime();
					isPictureTaken = true;

					var dataUrl = thecanvas.toDataURL('image/webp', 1);
					//console.log("dataUrl type : " + typeof(dataUrl));

					$("#image_data").val(dataUrl);
					$("#displayProfile").attr('src', dataUrl);
					console.log("picture taken");

				}else{
					endTime = new Date().getTime();
					//if 3 seconds is passed, enable retake picture
					if(Math.abs(startTime-endTime || isPictureTaken ===true) > 1000) {
						isPictureTaken = false;


					}
				}
			}

			window.addEventListener('load', initWebRTC, false);