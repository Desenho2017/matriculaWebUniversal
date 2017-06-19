// This function is responsible for calculate progress bar width and its status.
function updateBarWidth(actual, max){
	var progressBar = document.getElementById("progress_bar");
	var logInfo = document.getElementById("status_info");
	var percentage = getPercentage(actual, max);
	
	var formatedPercentage = (percentage + "%");
 
	if(percentage <= 100 && percentage >= 0)
	{
		if(percentage != 100){
			progressBar.style.width = formatedPercentage;
			logInfo.innerHTML = formatedPercentage;
		} else{
			progressBar.style.width = formatedPercentage;
			logInfo.innerHTML = "All done! =)";
		}
	} else{
		console.log("ERROR: Invalid percentage in updateBarWidth!");
	} 
}
 
// This function is responsible only for calculating the percentage using an actual number and a max number (total)
function getPercentage(actual, total){
	return (actual * 100)/total
}