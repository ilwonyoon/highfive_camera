<html>
<head>
	<title></title>
</head>
<body>
	<script type="text/javascript">
		$.ajaxSetup({
			cache: false
		});
		var ajax_load = "<img src='img/load.gif' alt ='loading...' />";

		//load functions
		var loadUrl = "ajax/load.php";
		$("#load_basic").click(function(){
			$("#result").html(ajax_load).load(loadUrl);
		});

		$("#load_dom").click(function(){
			$("#result")
			.html(ajax_load)
			.load(loadUrl +"#picture");
		});

		$("#load_get").click(function(){
			$("#result")
			.html(ajax_load)
			.load(loadUrl,"language=php&version=5");
		});
		$("#load_post").click(function(){
			$("#result")
			.html(ajax_load)
			.load(loadUrl,{language:"php", version:5});
		});

		$("#load_callback").click(function(){
			$("#result")
			.html(ajax_load)
			.load(loadUrl,null,function(responseText){
				alert("Response:\n " + responseText);
			});
		});

		$("#get").click(function(){
			$("#result").html(ajax_load);
			$.get(
				loadUrl,
				{language:"php",version:5},
				function(responseText){
					$("#result").html(responseText);
				},
				"html"
				);
		});
	</script>

</body>
</html>