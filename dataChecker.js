function checkMissingData(){
	var length = ofertaData.length;
	
	for(var counter = 0; counter < length; counter++){
		if(ofertaData[counter].class_data.length == 0){
			console.log("Missing data in: " +  ofertaData[counter].class_name + " - Index: " + counter);
			console.log("Checking if returns any data...");
			var newData = get_class_data(ofertaData[counter].class_url);
			console.log(newData);
		}
	}
}

function print_data(){
	console.log("The data you asked for: ");
	console.log(ofertaData);
}

function checkLongNames(){
	var length = ofertaData.length;
	
	for(var counter = 0; counter < length; counter++){
		if(ofertaData[counter].class_data.length == 0){
			
		}
	}
}

function getSpaceCount(text){
	var regexSpaceCount = /([\s]+)/ig;
	return text.match(regexSpaceCount).length;
}

function checkLongNames(){
	var length = ofertaData.length;
	
	for(var counter = 0; counter < length; counter++){
		var className = ofertaData[counter].class_name;
		var numClasses = ofertaData[counter].class_data.length;
		
		for(var counter2 = 0; counter2 < numClasses; counter2++){
			var professorName = ofertaData[counter].class_data[counter2].professor;
			var subClassName = ofertaData[counter].class_data[counter2].class_name;
			var spaceCount = getSpaceCount(professorName);
			
			if(spaceCount > 4){
				console.log("Found a possible double name! Name: " + professorName);
				console.log("It occurred in: " + className + " - Subclass: " + subClassName);	
			}
		}
	}
}

function mediaNames(){
	var totalChars = 0;
	var length = ofertaData.length;
	var counter = 0;
	
	for(counter = 0; counter < length; counter++){
		var numClasses = ofertaData[counter].class_data.length;
		
		for(var counter2 = 0; counter2 < numClasses; counter2++){
			totalChars += ofertaData[counter].class_data[counter2].professor.length;
		}
	}
	
	var media = totalChars / counter;
	console.log("A média é: " + media);
}