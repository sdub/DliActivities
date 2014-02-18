$(document).ready(function() {	
	$('#feedback').hide();

	//Default values (for testing)
	mediaPath = "sampleData/";
	cssFilename = "styles/Enabling_10_default.css";
	xmlFilename = mediaPath + "english_enabling10_noNamespaces.xml";
	jsonFilename = mediaPath + "english_enabling10.js";
	
	testVideoSupport();
	
	loadActivity(parseXml);
}); 


var selectIndex = -1; 

function onChange(index){
	var select = $("#dropTarget_" + index + " select");
	
	var correctValue = $(select).data("correctValue");
	
	var options = $("#dropTarget_" + index + " select option");
	
	var selectValue = $(select).attr("value");
	
	////var optionId = $($(options)[selectValue]).attr("value");
	var itemIndex = (numItemsPerSet * currentSet) + correctValue - 1;
	
	var correctItem = $(select).find("option[value=" + 
											correctValue + "]");
	var correctValueText = correctItem.text();
	var selectValueText = $(select).find("option[value=" + 
											selectValue + "]").text();
	
	logStudentAnswer(
		currentSet + ":" + index,	
		correctValueText,
		selectValueText
	);
 	
 	var jItem = $($(xml).find("item")[correctItem.attr("index")])
	
	if(jItem.attr("timesTried") == undefined){
		jItem.attr("timesTried", 1);
	}else{
		jItem.attr("timesTried",
			parseInt(jItem.attr("timesTried")) + 1
		);	
	}
	
	logStudentAnswerAttempts(
		currentSet + ":" + index,
		jItem.attr("timesTried"));
	
	
	if(selectValue == correctValue){
		$(select).addClass("itemCompleted");
		
		var optionsHtml = "<option value='" + correctValue + "'>" +
			$($(xml).find("lang_en")[itemIndex]).text()
			 + "</option>";
		$(select).html(optionsHtml);
		
		showFeedback("correct", $($(xml).find("feedback_l1")[itemIndex]).text());
	}else{
		$(select).attr("value", 0);
		selectIndex = index;
		showFeedback("incorrect", $($(xml).find("hint_l1")[itemIndex]).text());
	}
	
	
}

var numItems;
var numItemsPerSet = 5;
function parseXml(t_xml){
	numItems = $(xml).find("item").length;
	numSets = Math.ceil(numItems/5);
	
	//Tag items (for logging)
	/*$(xml).find("item").each(function(i){
		$(this).attr("origIndex", i);
	})*/
	
	//Randomize sets
	$(xml).find("item").shuffle()
	
	loadSet(0);
}

var numberItemsInSet;

function loadSet(value){
	currentSet = value;
	
	setCompletedShown = false;
	
	updateSetText();

	clearVideo("videoContainer");

	var lastIndexInSet = (currentSet + 1) * numItemsPerSet;
	numberItemsInSet = numItemsPerSet;
	if(lastIndexInSet > numItems){
		numberItemsInSet = lastIndexInSet - 1 - numItems;
	}

	//Reset vars
	for(var i = 0; i < numItemsPerSet; i++){
		//Set visibility on select tags
		if(i >= numberItemsInSet){
			$("#dropTarget_" + (i + 1) + " select").prop('disabled','true');
		}else{
			$("#dropTarget_" + (i + 1) + " select").prop('disabled','');
		}
				
		//Remove itemCompleted class
		$("#dropTarget_" + (i + 1) + " select").removeClass("itemCompleted");
		
		$("#dropTarget_" + (i + 1) + " select").html("");
	}
	

	//Build options
	var optionsHtml = "";
	for(var i = 0; i < numberItemsInSet; i++){
		var jItem = $($(xml).find("item")[(currentSet*numItemsPerSet) + i]);
		optionsHtml += "<option index='" + [(currentSet*numItemsPerSet) + i] + 
				"' value='" + (i + 1) + "'>" + 
				jItem.find("lang_en").text() + "</option>";
	}

	//Set options
	for(var i = 0; i < numberItemsInSet; i++){
		$("#dropTarget_" + (i + 1) + " select").data("correctValue", (i + 1));
		
		$("#dropTarget_" + (i + 1) + " select").html(optionsHtml);
		
		$("#dropTarget_" + (i + 1) + " select option").shuffle()
		$("#dropTarget_" + (i + 1) + " select").attr("value", 0);
		
		var blankOption = "<option value='0'></option>";
		$("#dropTarget_" + (i + 1) + " select").html(blankOption + 
					$("#dropTarget_" + (i + 1) + " select").html());
	}	
}

function playVideo(index){
	var file_video = $($(xml).find("file_video")[
					(currentSet*numItemsPerSet) + index - 1]).text();
	file_video = file_video.substring(0, file_video.lastIndexOf("."));
	loadVideo("../Enabling_10_html/" + mediaPath, file_video);
	
}



function showFeedback(value, text){
	//Clear the dialog box
	$("#feedbackHeader").html("");
	$("#feedbackText").html("");
	
	switch(value){
		case "incorrect":
			$("#feedbackHeader").html("Incorrect");
			$("#feedbackText").html(text);
			break;
		case "correct":
			$("#feedbackHeader").html("Correct");
			$("#feedbackText").html(text);
			break;
		case "set_completed":
			$("#feedbackHeader").html("Set Completed");
			break;
		case "activity_completed":
			$("#feedbackHeader").html("Activity Completed");
			break;
	}
	
	$('#feedback').show();
}

function closeFeedback(){
	$('#feedback').hide();
	
	checkCompleted();
	
	if(selectIndex > 0){
		playVideo(selectIndex);
		selectIndex = -1;
	}
	
	/*$('#feedback').css( {
	left: '580px',
	top: '250px',
	width: 0,
	height: 0
	} );*/
}

var setCompletedShown = false;
var activityCompletedShown = false;

function checkCompleted(){
	if(setCompletedShown && !activityCompletedShown){
		//Check for activity completed
		loadNextSet();
	}else if(!setCompletedShown){
		//Check for set completed
		if($(".itemCompleted").length == numberItemsInSet){
			setCompletedShown = true;
			showFeedback("set_completed");
		}
	}	
}

function loadNextSet(){
	if(currentSet + 1 == numSets){
		activityCompletedShown = true;
	
		if(parent.activityCompleted){
			parent.activityCompleted(1,0);
		}else{
			showFeedback("activity_completed");
		}
	}else{
		loadSet(currentSet + 1);
	}
}

function getPassedParameters()
{
	mediaPath = getURL_Parameter("mediaPath");
	xmlPath   = getURL_Parameter("xmlPath");
	return mediaPath != 'undefined';
}
function getURL_Parameter(param) {
    var urlQuery = location.href.split("?")
    if (typeof urlQuery == 'undefined')
        return 'undefined';

    if (urlQuery.length < 2)
        return 'undefined';

    var urlItems = urlQuery[1].split("&")
    var paramCount = urlItems.length;
    for (i = 0; i < paramCount; i++) {
        paramItem = urlItems[i].split("=");
        paramName = paramItem[0];
        paramValue = paramItem[1];

        if (param == paramName) {
            return paramValue;
        }
    }
    return 'undefined';
}

// For homework
function checkAnswers(){
	var questionID = "";
	var answer = "";
	var context = "";
	var answerAttempts = "";

	answerAttemptsNum++;

	questionID = parseInt(currentSet.toString());
	answer = "--";
	context = "--";
	answerAttempts = answerAttemptsNum.toString();
	
	// To see attempts - temp
	//$("#feedbackText").html("Homework//answerAttempts: " + answerAttempts + " - " + questionID);
		
	// To pass logs
	logStudentAnswer(questionID, answer, context);
	logStudentAnswerAttempts(questionID, answerAttempts);
	
	//$('#feedbackText').show();
	
	if ($("#feedbackHeader").html() == "Set Completed") {
		answerAttemptsNum--;
	}
}
