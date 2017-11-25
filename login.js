function someInfoFromForm(){
	var nickname = document.getElementById("name").value;
	var bots = document.getElementById("bots").value;
	var complexity = document.getElementsByName('group1');
	for (var i = 0; i < complexity.length; i++) {
		if (complexity[i].type === 'radio' && complexity[i].checked) {
			var resultComplexity = complexity[i].value;
		}
	}
}

document.getElementById("btn").onclick = someInfoFromForm;
