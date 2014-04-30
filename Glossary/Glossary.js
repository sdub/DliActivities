$(document).ready(function() {
	testVideoSupport();
	
	$('#feedback').hide();
	$( "#tabs" ).tabs({select: tabSelected});
	$( "#phrase_tabs" ).tabs();
	
	loadjscssfile("../common/css/activityDefault.css", "css");
	
	//Default values (for testing)
	mediaPath = "sampleData/";
	xmlFilename = mediaPath + "glossary.xml";
	jsonFilename = mediaPath + "glossary.js";
	cssFilename = "styles/Glossary.css";
	
	loadActivity(parseXml);
	
	$( "#engSelectable" ).selectable({selected: listItemSelected});
	$( "#transliSelectable" ).selectable({selected: listItemSelected});
	$( "#transSelectable" ).selectable({selected: listItemSelected});
	
	$( "#engPhraseSelectable" ).selectable();
	$( "#transliPhraseSelectable" ).selectable();
	$( "#transPhraseSelectable" ).selectable();
	
	$('#tabs').keydown(function(event) {
	  	if (event.which == 40 && 
	  		gv_tally > 0) {
	     execute_select_item(gv_tally - 1);
	   }
	   if (event.which == 38 &&
	   		gv_tally < numItems) {
	     execute_select_item(gv_tally + 1);
	   }
	});
	
}); 

function disableTranslation(){
	$($("#phrase_tabs ul").find("li")[2]).css("display","none");
	$($("#tabs ul").find("li")[2]).css("display","none");
}

function disableTransliteration(){
	$($("#phrase_tabs ul").find("li")[1]).css("display","none");
	$($("#tabs ul").find("li")[1]).css("display","none");
}

var scrollTopOff = 0;

var tabTimer;

function timeout_trigger(){
	/*$("#engTab").scrollTop(scrollTopOff);
	$("#transliTab").scrollTop(scrollTopOff);
	$("#transTab").scrollTop(scrollTopOff);*/
	
	scrollToItem(gv_tally, 0);
	
	clearTimeout(tabTimer);
}

function tabSelected(event, ui){
	tabTimer = setTimeout('timeout_trigger()', 200);
}	
 
function scrollToItem(value, scrollInertia){
	var options = {};
	
	if(scrollInertia != undefined){
		options['scrollInertia'] = scrollInertia;
	}
	
	$("#engTab").mCustomScrollbar("scrollTo", 
		"#engSelectable li:nth-child(" + (value + 1) + ")",
		 options);
	$("#transliTab").mCustomScrollbar("scrollTo", 
		"#transliSelectable li:nth-child(" + (value + 1) + ")",
		 options);
	$("#transTab").mCustomScrollbar("scrollTo", 
		"#transSelectable li:nth-child(" + (value + 1) + ")",
		 options);
}
 
var gv_tally = 0;
function listItemSelected(event, ui){
	var tally = 0;

//	alert($(ui.selected).html())
	$(ui.selected.parentNode).find("li").each(function(){
	    if($(this).hasClass("ui-selected")){
	        return false;
	    }
	    
	    tally++
	
	});
	gv_tally = tally;
	$('#setText').html((tally+1) + '/' + numItems);
	scrollTopOff = $(ui.selected.parentNode.parentNode).scrollTop();
	execute_select_item(tally);
	scrollToItem(tally);
	playTheVideo();
	
}
function execute_select_item(tally){

	$("#engSelectable li").removeClass("ui-selected");
	$($("#engSelectable li")[tally]).addClass("ui-selected");
	
	$("#transliSelectable li").removeClass("ui-selected");
	$($("#transliSelectable li")[tally]).addClass("ui-selected");
	
	$("#transSelectable li").removeClass("ui-selected");
	$($("#transSelectable li")[tally]).addClass("ui-selected");
	
	jItem = $($(xml).find("phrase")[tally]);
	
	$('#engPhraseSelectable').html(jItem.find("english").text());
	$('#transliPhraseSelectable').html(jItem.find("transliteration").text());
	
	//$('#transPhraseSelectable').html(jItem.find("translation").text());
	if (!isJapanese) {
	$('#transPhraseSelectable').html(jItem.find("translation").text());
	}
	else {
		// To display ruby tag
		$('#transPhraseSelectable').html(displayRubyTag(jItem.find("translation").text()));
	}
	
	// For homework
	if (homeworkStatus) {
		checkAnswers();
	}
}
function playTheVideo(){
	var file_video = jItem.find("file_video").text();
	loadVideo(mediaPath, removeFileExt(file_video), "Mil_01");
}

var jItem;

function activityVideoPlay(){
	if(jItem != undefined){
		var file_video = jItem.find("file_video").text();
		loadVideo(mediaPath, removeFileExt(file_video), "Mil_01");
	}
}
var numItems 

// For homework
var homeworkStatus;
var answerAttemptsNum = 0;

// To display ruby tag
var isJapanese = false;

function parseXml(t_xml){
	var engHtml = "";
	var transliHtml = "";
	var transHtml = "";
	
	// true for homework and undefined for regular
	homeworkStatus = $(xml).find("content").attr("hw");
	
	// To display ruby tag
	isJapanese = $(xml).find("content").attr("target_language") == "Japanese";
	
	$(xml).find("phrase").each(function(){
			engHtml = engHtml + ' <li class="ui-widget-content enw_li">' +
						$(this).find("english").text() + '</li>';
						
			if($(this).find("transliteration").text() == ""){
				disableTransliteration();
			}else{
				transliHtml = transliHtml + ' <li class="ui-widget-content">' +
							$(this).find("transliteration").text() + '</li>';
			}
			
			if($(this).find("translation").text() == ""){
				disableTranslation();
			}else{
				//transHtml = transHtml + ' <li class="ui-widget-content">' +
				//		$(this).find("translation").text() + '</li>';					
				if (!isJapanese) {
				transHtml = transHtml + ' <li class="ui-widget-content">' +
						$(this).find("translation").text() + '</li>';
			}
				else {
					// To display ruby tag
					transHtml = transHtml + ' <li class="ui-widget-content">' +
						displayRubyTag($(this).find("translation").text()) + '</li>';
				}
			}
		});
	
	$('#engSelectable').html(engHtml);
	$('#transliSelectable').html(transliHtml);
	$('#transSelectable').html(transHtml);
	//added the below to activate the mCustomScrollbar on the "engTab" div 
	$('.allTabs>div:first').mCustomScrollbar("update");	
	//alert($($('.enw_li')[0]).html()); 
	var firstSelect= $($('.enw_li')[0]);
	firstSelect.addClass("ui-selected");
	numItems = $(xml).find("phrase").length;
	$('#setText').html('1/' + numItems);
	execute_select_item(0);
}

function prevItemClick(){
	if (gv_tally > 0){
		gv_tally--;
	}
	execute_select_item(gv_tally);
	playTheVideo();
	$('#setText').html((gv_tally+1) + '/' + numItems);	
	scrollToItem(gv_tally);
}
function nextItemClick(){
	if (gv_tally < numItems-1){
		gv_tally++;
	}
	execute_select_item(gv_tally);
	playTheVideo();
	$('#setText').html((gv_tally+1) + '/' + numItems);	
	scrollToItem(gv_tally);
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
}