// First of all, sry for snake_case + camelCase
const urlMwFga = 'https://matriculaweb.unb.br/graduacao/oferta_dis.aspx?cod=650'; // This URL is linked to "Oferta de disciplinas FGA"
const urlClass = 'https://matriculaweb.unb.br/graduacao/oferta_dados'; // This URL is responsible for acessing a single class
const numberOfGets = 10; // (int)0...N or use "ALL" for get all possible data
var finalOferta = []; // This var contains all final data from all HTTP GETs, including classes and its subsets - From each discipline
					  // This is needed to bypass (0 skill developer) asyncronous HTTP requests - "Gambiarra"
var ofertaData = []; // This var is the one that is "visible" to the user, containing all the data possible - Oferta + Each Discipline

function interate_regex(regex_text, text){
	var match, result = [];
	
	while (match = regex_text.exec(text)){
		result.push(match[1]);
	};
	
	return result;
}

function fix_no_place(text){
	var regex_no_professor = /Local a Designar/ig;
	return text.replace(regex_no_professor, "FGA-SEM-LOCAL");
}

function fix_no_professor(text){
	var regex_no_professor = /A Designar/ig;
	return text.replace(regex_no_professor, "SEM PROFESSOR");
}

function fixFgaLab(text){
	var regexFgaLab = /FGA-LAB /ig;
	return text.replace(regexFgaLab, "FGA-LAB-");
}

function regex_days(data){
	var match, result = [], locals = [];
	var counter = 0;
	var regex_days = /(segunda|terça|quarta|quinta|sexta|sábado|domingo)     ([0-9]{2}:[0-9]{2})    ([0-9]{2}:[0-9]{2})/ig;
	var regex_places = /([a-zà-ú0-9\-]*[^ ])/ig;
	console.log("In days");
	console.log(data);
	
	var clean_match = data.replace(regex_days, "");
	console.log("Clean match: " + clean_match);
	locals = interate_regex(regex_places, clean_match);
	//console.log("Locals: ");
	//console.log(locals);
	
	while (match = regex_days.exec(data)){
		var day = {day: match[1], start_time: match[2], end_time: match[3], local: locals[counter]};
		
		counter++;
		result.push(day);
	};
	
	return result;
}

function regex_class(regex_text, text){
	var match, result = [];
	
	while (match = regex_text.exec(text)){
		//console.log(match);
		var found_days = regex_days(match[3]);
		var class_data = {class_name: match[1], professor: match[4], days: found_days};
		result.push(class_data);
	};
	
	return result;
}

function get_class_data(url, seq_number){
	var classes = [];
	var goto_url = urlClass + url;
	console.log("Acessando: " + goto_url);
	
	$.get(goto_url,
		function (response) {
			var regex_classes = /TurmaVagasTurnoHorário\/LocalProfessorObs ([a-zà-ú]{1,2})(.*?)DOMSEG TER QUA QUI SEX SÁB (.*?) ([a-zà-úà-ú ]*)   turma:/ig;
			
			// MW HTML is kinda messy. The function below cleans all the HTML tags.
			var clean_html = cleanMwHtml(response)
			//console.log(clean_html);
			
			// Ensures no regex fails when exotic cases shows up.
			clean_html = fix_no_place(clean_html);
			clean_html = fix_no_professor(clean_html);
			clean_html = fixFgaLab(clean_html);
			
			classes = regex_class(regex_classes, clean_html);
			classes.sequence_number = seq_number;
			//console.log("Vou retornar isso");
			//console.log(classes);
			
			finalOferta.push(classes);
			
			// UPDATE PROGRESS BAR
			updateBarWidth(finalOferta.length, numberOfGets)
			
			$("#viewer").html(response);
		});
	
	console.log("Fora do escopo:");
	console.log(classes);
	return classes;	
}

// The function below is needed because the developer does not know how to handle asyncronous HTTP requests.
function gambiarra_save_data(){
	var oferta_size = ofertaData.length;
	
	// Sort needed because the requests are asyncronous
	finalOferta.sort(compareSeqNumber);
	
	// Makes a copy of the requested data to the final classes data
	for(var counter = 0; counter < oferta_size; counter++){
		ofertaData[counter].class_data = finalOferta[counter];
	}
	
	console.log("Gambiarra feita!");
}

// This function is needed for the sort comparaton in finalOferta
function compareSeqNumber(a,b) {
  if (a.sequence_number < b.sequence_number)
     return -1;
  if (a.sequence_number > b.sequence_number)
    return 1;
  return 0;
}


// It's easier when the HTML is only "innerText".
function cleanMwHtml(mwHtml)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = mwHtml;
   return (tmp.textContent||tmp.innerText).replace(/ +(?= )/g,'');
}

function organize_class(name, code, url, seq_number){
	var new_class = {};
	var data = [];
	
	// data is a temp variable for better new_class organization.
	data = get_class_data(url, seq_number);
	
	new_class = {class_name: name, class_code: code, class_data: data, class_url: url};
	
	return new_class;
}

// This function is responsible for getting all "Lista de Oferta FGA" data and getting all subClasses data (Such as days, professor, etc)
function handleMainPage(getLimit){
	$.get(
			urlMwFga,
			function (response) {
				//console.log(response);
				
				// This condition cheks if the parser is going to get all data possible or only a few
				if(getLimit == "ALL"){
					var regexCount = /<\/h5>([0-9]*?) disciplinas existentes<br><br>/ig;
					var countOferta = interate_regex(regexCount, response);
					
					console.log("Getting all the data possible... " + countOferta + " found");
					
					getLimit = countOferta;
				} else{
					console.log("Getting " + getLimit + " itens")
				}
				
				// This regex is responsible for getting each class "block"
				var regex_in = /<a href=(.*?)<\/td><td>/ig;
				var result = interate_regex(regex_in, response);
				//console.log(result);
				
				// This regex is responsible for getting each class name
				var regex_names = />(.*?)<\/a>/ig;
				var re_names = interate_regex(regex_names, result);
				//console.log(re_names);
				
				// This regex is responsible for getting each class url to future use (HTTP GET that data)
				var regex_ref = /oferta_dados(.*?)>(.*?)<\/a>/ig;
				var re_ref = interate_regex(regex_ref, result);
				//console.log(re_ref);
				
				//This regex is responsible for getting all class codes
				var regex_code = /cod=([0-9]*)/ig;
				var re_code = interate_regex(regex_code, result);
				//console.log(re_code);
				
				// Then, each class data needs its organized data. The HTTP requests are made and the data organized.
				for(var count=0; count < getLimit; count++){
					ofertaData.push(organize_class(re_names[count], re_code[count], re_ref[count], count));
				}
				
			$("#viewer").html(response);
		});
}

// This function starts the parser and tells user that the process has started
function parserStart(){
	var logInfo = document.getElementById("status_info");
	logInfo.innerHTML = "Getting data...";
	handleMainPage(numberOfGets);
}

// This function prepares the system to make an cross domain HTTP request, when the page has finished loading
$(document).ready(function(){
	// This is needed for handle cross domain HTTP GETs
	$.ajaxPrefilter( function (options) {
		if (options.crossDomain && jQuery.support.cors) {
			var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
			options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
			//options.url = "http://cors.corsproxy.io/url=" + options.url;
		}
	});
	
	console.log("CORS CrossDomain ready!");
});

// This function transforms all the final data into JSON data and then puts it on a proper <div>
function dataToJsonText(){
	var jsonText = JSON.stringify(ofertaData);
	var jsonDiv = document.getElementById('json_text');
	
	jsonDiv.innerHTML = jsonText;
}
