// collapse nav button on click
$(document).ready(function () { 
  $(document).click(function (event) {
    if(!Object.values(event.target.classList).includes("dropdown-toggle"))
       $('.navbar-collapse').collapse('hide');
      
  });
});

var raidSize;
(function (global) {

var dc = {};

var homeHtml = "snippets/homepage-snip.html";
var newModalHtml = "snippets/importRaidModal-snip.html"
var historyModalHtml = "snippets/importHistoryModal-snip.html"
var historyItemHtml = "snippets/historyItem-snip.html"
var raidHtml = "snippets/raidbuilder-snip.html";
var raidLiHtml = "snippets/playerList-snip.html";
var raidHistoryLink="raidHistory/RHO-Raid_History.json"
var selectedRaidLink="raidHistory/"
var raidObj,raidInfoObj,numOfRaids,editable=false,isReimport=false;
var selectedHistoryButtonId;
var deleteThis=[];
var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};
// function for inserting innerHTML for 'select'
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};
//function for replacing {{propName}} with propValue
var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string
    .replace(new RegExp(propToReplace, "g"), propValue);
  return string;
};
//function to hide/unhide given selector (true is hide, false is unhide)
function hide(hideSelector, willHide) { 
      document.querySelectorAll(hideSelector).forEach(({ classList }) => classList.replace(unOrNo(willHide)+"hideThis", unOrNo(!willHide)+"hideThis"));
      function unOrNo(willHide){
        if (willHide) {
          return "un";
        }
        else{
          return "";
        }
      }
    };
//function to enable/disable dragging of given selector (true is enable, false is disable)
function dragEnable(dragSelector, willDrag) { 
  document.querySelectorAll(dragSelector).forEach(({ classList }) => classList.replace(unOrNo(willDrag)+"draggable", unOrNo(!willDrag)+"draggable"));
  function unOrNo(willDrag){
    if (willDrag) {
      return "un";
    }
    else{
      return "";
    }
  }
};
    //function for deleting nodes based on the given selector
function deleteNodes(delSelector){
  var len=document.querySelectorAll(delSelector).length;
  for (i = len-1; i >= 0; i--){
    document.querySelectorAll(delSelector)[i].parentNode.removeChild(document.querySelectorAll(delSelector)[i]);
  }
};


document.addEventListener("DOMContentLoaded", function (event) {

// On first load, show home view
$ajaxUtils.sendGetRequest(
  homeHtml,
  function (responseText) {
    document.querySelector("#main-content")
      .innerHTML = responseText;

      deleteNodes(".connectedSortable>li");
  },
  false);   
});

dc.reimportCSV=function(){
  $ajaxUtils.sendGetRequest(
  newModalHtml,
  function (responseText) {
    document.querySelector("#modal-here").innerHTML = responseText;
    hide("#modalSubmitButton",true)
  },
  false);
};
dc.modalNewRaid=function(){
  $ajaxUtils.sendGetRequest(
  newModalHtml,
  function (responseText) {
    document.querySelector("#modal-here").innerHTML = responseText;
    hide("#modalReSubmitButton",true);
  },
  false);
};
dc.modalRaidHistory=function(){
  showLoading("#modal-here");
  $ajaxUtils.sendGetRequest(
    raidHistoryLink,
    buildHistoryView)
};
function buildHistoryView(history) {
   $ajaxUtils.sendGetRequest(
       historyModalHtml,
       function (historyModalHtml) {
         $ajaxUtils.sendGetRequest(
         historyItemHtml,
         function (historyItemHtml) {
           var builtHistoryHtml = buildHistoryList(historyItemHtml,historyModalHtml,history);
         document.querySelector("#modal-here").innerHTML = builtHistoryHtml;
       },
       false);
       },
      false)
}
function buildHistoryList(historyItemHtml,historyModalHtml,history){
  historyViewHtml=historyModalHtml;
  for(i=0; i<Object.keys(history).length; i++){
      var html = historyItemHtml;
      html =
        insertProperty(html, "ID", history[i].ID);
      html =
        insertProperty(html, "Name", history[i].Name);
      html =
        insertProperty(html, "Date", history[i].Date);
      html =
        insertProperty(html, "Number", i);  
      historyViewHtml =
        insertProperty(historyViewHtml,"ListItems",html+"{{ListItems}}");

  }
  historyViewHtml = 
    insertProperty(historyViewHtml,"ListItems","");
  return historyViewHtml;

};

dc.selectRadio=function(clicked){
  document.getElementById("modalHistorySubmitButton").disabled=false;
  selectedHistoryButtonId=clicked.id;
}
//read uploaded CSV file
dc.readFileInput = function(){ 
readFile(document.getElementById('csvFileInputArea'));
function readFile(input) {
  let file = input.files[0];
  let reader = new FileReader();

  reader.readAsText(file);

  reader.onload = function() {
    document.getElementById("csvTextInputArea").value = reader.result;
    document.getElementById("csvTextInputArea").disabled=true;
    document.getElementById("modalSubmitButton").disabled=false;
    document.getElementById("modalReSubmitButton").disabled=false;
  };

  reader.onerror = function() {
    console.log(reader.error);
  };
   
};
};
//load selected raid from history
dc.openOldRaid=function(){
   $ajaxUtils.sendGetRequest(
    selectedRaidLink+document.getElementById("oldRaid"+selectedHistoryButtonId.replace("radioButton","")).innerHTML+".json",
    loadOldRaid);
    
};
function loadOldRaid(raidJSON){
  deleteNodes(".connectedSortable>li");
  editable=false;
  var raidInfo={},raid={};
  for(i=0; i<Object.keys(raidJSON).length; i++){
    if(Object.keys(raidJSON)[i]==="SortedRaids")
      raid[Object.keys(raidJSON)[i]]=raidJSON[Object.keys(raidJSON)[i]];
    else
      raidInfo[Object.keys(raidJSON)[i]] =raidJSON[Object.keys(raidJSON)[i]]; 
  }  
  hide(".hideThis", false)    
  hide("#saveRaidButton",true);
  hide("#reimportCSVButton",true);
  let roleView = {"Tank":document.getElementById("Tank").innerHTML,
                    "Healer":document.getElementById("Healer").innerHTML,
                    "Melee-DPS":document.getElementById("Melee-DPS").innerHTML,
                      "Ranged-DPS":document.getElementById("Ranged-DPS").innerHTML};

    buildAndShowRaidItemsHTML(raid.SortedRaids[Object.keys(raid.SortedRaids).length-1].TeamComp, raidInfo, roleView,false);
    for(var i=0; i<Object.keys(raid.SortedRaids).length-1; i++){
    roleView= {}
    roleView["Raid"+(i+1)]=document.getElementById("Raid"+(i+1)).innerHTML;
    buildAndShowRaidItemsHTML(raid.SortedRaids[i].TeamComp,raidInfo, roleView,true)
    };
    for(var i=10; i>Object.keys(raid.SortedRaids).length-1;i--)
    hide("#raidTeams>div:nth-child("+i+")",true);

};

//opening raid view once submit was clicked on Raid Builder
dc.openRaid = function () {
  hide(".hideThis", false)
  hide("#editRaidButton",true);
  hide("#reimportCSVButton",true);
  editable=true;
  deleteNodes(".connectedSortable>li");
  populateFromCSV(false);
};
dc.reOpenRaid=function(){
  populateFromCSV(true);
};

function populateFromCSV(reimport){
  isReimport=reimport;
  numOfRaids=document.getElementById("numberOfRaids").value;   
  for(var i=10; i>numOfRaids;i--)
  hide("#raidTeams>div:nth-child("+i+")",true);
  
  const roleView = {"Tank":document.getElementById("Tank").innerHTML,
                    "Healer":document.getElementById("Healer").innerHTML,
                    "Melee-DPS":document.getElementById("Melee-DPS").innerHTML,
                    "Ranged-DPS":document.getElementById("Ranged-DPS").innerHTML};
  var importedCSV= document.getElementById("csvTextInputArea").value;
  raidSize= document.getElementById("numberOfRaiders").value;
  numOfRaids= document.getElementById("numberOfRaids").value;
  if (importedCSV!=undefined && importedCSV!="") {
    var arrCSV= importedCSV.split('"');
    arrCSV[1]=arrCSV[1].replace(",","");
    importedCSV=arrCSV.join('"');
    arrCSV=importedCSV.split("\n\n");
    showLoading("#main-content");
    raidInfoObj=JSON.parse(csvJSON(arrCSV[0]))[0];
    raidObj=JSON.parse(csvJSON(arrCSV[1]));
    for(var i=0; i<raidObj.length; i++){
      formatRaidKeyVals(i, raidObj);
    };
    for (var i = deleteThis.length-1; i>=0 ; i--) {
      raidObj.splice(deleteThis[i],1);
    }
    raidObj.sort((c1, c2) => (c1.Spec < c2.Spec) ? 1 : (c1.Spec > c2.Spec) ? -1 : 0);
    raidObj.sort((c1, c2) => (c1.Class < c2.Class) ? 1 : (c1.Class > c2.Class) ? -1 : 0);
    buildAndShowRaidItemsHTML(raidObj, raidInfoObj, roleView, false);
}
}
function deleteAfterReimport(){
var sortedPlayers={};
var unsortedPlayers={};
var deletedUnsorted=[];
  sortedPlayers=document.querySelectorAll("#raidTeams li");
  unsortedPlayers=document.querySelectorAll("#classPicker li");
  for(var i=0; i<Object.keys(sortedPlayers).length; i++){
    var deleteSorted=true;
      for(var j=0; j<Object.keys(unsortedPlayers).length; j++){
        if(sortedPlayers[i].id==unsortedPlayers[j].id){
          deleteNodes("#classPicker #"+unsortedPlayers[j].id);
          deleteSorted=false;
        }        
      }
      if(deleteSorted)
      deleteNodes("#raidTeams #"+sortedPlayers[i].id);
  }
  for(var j=0; j<Object.keys(unsortedPlayers).length; j++){
  for(var k=0; k<Object.keys(unsortedPlayers).length; k++){
    if(j!=k && unsortedPlayers[j].id==unsortedPlayers[k].id){
      if(deletedUnsorted.indexOf(unsortedPlayers[k].id)==-1){
      deletedUnsorted.push(unsortedPlayers[k].id);
      document.querySelectorAll("#classPicker #"+unsortedPlayers[k].id)[0].parentNode.removeChild(document.querySelectorAll("#classPicker #"+unsortedPlayers[k].id)[0]);
      }
   }
  }
 }

};
function buildAndShowRaidItemsHTML (raid, raidInfo,roleView,isSorted) {
  // Load raid title snippet
  $ajaxUtils.sendGetRequest(
    raidHtml,
    function (raidHtml) {      

          var raidsViewHtml =
            buildRaidsTitleHtml(raidInfo,raidHtml);
          insertHtml("#main-content", raidsViewHtml);
        },
        false);
  //Load raid line item  
   $ajaxUtils.sendGetRequest(
    raidLiHtml,
    function (raidLiHtml) {
          roleView=buildRolePickerleHtml(roleView,raid,raidLiHtml,isSorted);
          for (var i = 0; i < Object.keys(roleView).length; i++) {
            insertHtml("#"+Object.keys(roleView)[i], roleView[Object.keys(roleView)[i]]);
          }       
          dragEnable(".draggable",editable);
          var uls=document.querySelectorAll("#raidTeams ul");
          for (var i = 0; i<uls.length;  i++) 
            uls[i].querySelector("span").innerHTML=uls[i].getElementsByClassName("list-group-item").length;
            if(isReimport)
              deleteAfterReimport();
        },
        false);
};

function buildRaidsTitleHtml(raidInfo,raidHtml) {
  raidHtml = insertProperty(raidHtml, "Title", raidInfo.Name);
  if(raidInfo.Link===undefined){
    raidHtml = insertProperty(raidHtml, "ID", "n"+raidInfo.ID);
    raidHtml = insertProperty(raidHtml, "Description", raidInfo.Description);
  }
  else{
    raidHtml = insertProperty(raidHtml, "ID", raidInfo.Link.split("/")[6]);
    raidHtml = insertProperty(raidHtml, "Description", linkify(raidInfo.Description));
  }
  raidHtml = insertProperty(raidHtml, "Date", raidInfo.Date);
  raidHtml = insertProperty(raidHtml, "Time", raidInfo.Time);

   
     return raidHtml;
};
function buildRolePickerleHtml(role,raid,liHtml,isSorted){
  // Loop over players
  for (var i = 0; i < Object.keys(raid).length; i++) {
    // Insert item values
    var html = liHtml;
    html =
      insertProperty(html, "Class", raid[i].Class);
    html =
      insertProperty(html, "Spec", raid[i].Spec);
    html =
      insertProperty(html, "Role", raid[i].Role);
    html =
      insertProperty(html, "ID", "n"+raid[i].ID);
    html =
      insertProperty(html, "Tooltip", "Benched placeholder");
    html =
      insertProperty(html, "PlayerName", raid[i].Name);
      
    if(isSorted==true){
      role[Object.keys(role)[0]]= role[Object.keys(role)[0]]+html;
    }
    else
      role[raid[i].Role.charAt(0).toUpperCase()+raid[i].Role.slice(1)]= role[raid[i].Role.charAt(0).toUpperCase()+raid[i].Role.slice(1)]+html;

  }
  
  return role;
};

//changes any links in the string to actual links
function linkify(text) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a target="_blank" id="description-link" href="' + url + '">' + url + '</a>';
    });
};



//formats inputed CSV to required standard
function formatRaidKeyVals(i,raid) {
  if (raid[i] === ""||raid[i] === undefined) {
    deleteThis.push(i);
  }
  else{
    if (raid[i].Spec === "Protection") {
        raid[i].Role = "Warrior";
    }
    else if (raid[i].Spec === "Protection1") {
        raid[i].Spec = "Protection";
        raid[i].Role = "Paladin";
    }
    else if (raid[i].Spec === "Guardian") {
        raid[i].Role = "Druid";
    }
    else if (raid[i].Spec === "Holy") {
        raid[i].Spec = "Holy";
    }
    else if (raid[i].Spec === "Holy1") {
        raid[i].Spec = "Holy";
    }
    else if (raid[i].Spec === "Restoration") {
        raid[i].Spec = "Restoration";
    }
    else if (raid[i].Spec === "Restoration1") {
        raid[i].Spec = "Restoration";
    }
    else if (raid[i].Role === "Absence"||raid[i].Role === "") {
        deleteThis.push(i);
    }
    switch (raid[i].Spec){
      case "Protection":
      case "Guardian":
      raid[i].Class=raid[i].Role;
      raid[i].Role="Tank";

      break;

      case "Restoration":
      case "Holy":
      case "Discipline":
      raid[i].Class=raid[i].Role;
      raid[i].Role="Healer";

      break;

      case "Arms":
      case "Fury":
      case "Feral":
      case "Retribution":
      case "Combat":
      case "Assassination":
      case "Subtlety":
      case "Enhancement":
      raid[i].Class=raid[i].Role;
      raid[i].Role="Melee-DPS";

      break;

      case "Balance":
      case "Beastmastery":
      case "Marksmanship":
      case "Survival":
      case "Shadow":
      case "Fire":
      case "Arcane":
      case "Frost":
      case "Destruction":
      case "Demonology":
      case "Affliction":
      case "Elemental":
      raid[i].Class=raid[i].Role;
      raid[i].Role="Ranged-DPS";

      break;
    }
    
}
};

//var csv is the CSV file with headers
function csvJSON(csv){
  var lines=csv.split("\n");
  var result = [];
  var headers=lines[0].split(",");
  for(var i=1;i<lines.length;i++){
      var obj = {};
      var currentline=lines[i].split(",");
      for(var j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
      }
      result.push(obj);
  }
  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}
dc.editRaid=function(){
  dragEnable(".undraggable",true)
  hide("#editRaidButton",true);
  hide("#reimportCSVButton",false);
  hide("#saveRaidButton",false);
}
//Get all needed data and save in JSON
dc.saveRaid=function(){
 var finalJson={}, raidTeams={},bench={};
  for(var i=0; i<document.querySelectorAll("#raidTeams>div.unhideThis>ul").length;i++){
    var idForSel=document.querySelectorAll("#raidTeams>div.unhideThis>ul")[i].id;
    var comp={};
    for(var j=0; j<document.querySelectorAll("#"+idForSel+">li").length;j++){
        comp[j]={"Role": document.querySelectorAll("#"+idForSel+">li")[j].classList[1],
                 "Class":document.querySelectorAll("#"+idForSel+">li")[j].classList[2],
                 "Spec":document.querySelectorAll("#"+idForSel+">li")[j].classList[3],
                 "Name":document.querySelectorAll("#"+idForSel+">li")[j].innerText,
                 "ID":document.querySelectorAll("#"+idForSel+">li")[j].id.slice(1)
        }
    }
    raidTeams[i]={"TeamName":document.querySelectorAll("#raidTeams>div.unhideThis")[i].children[0].children[0].children[0].innerHTML,
              "TeamComp":comp};
       
  };
   for(var i=0; i<document.querySelectorAll("#classPicker>div.unhideThis>ul").length;i++){
    var idForSel=document.querySelectorAll("#classPicker>div.unhideThis>ul")[i].id;
    for(var j=0; j<document.querySelectorAll("#"+idForSel+">li").length;j++){
        bench[Object.keys(bench).length]={"Role": document.querySelectorAll("#"+idForSel+">li")[j].classList[1],
                 "Class":document.querySelectorAll("#"+idForSel+">li")[j].classList[2],
                 "Spec":document.querySelectorAll("#"+idForSel+">li")[j].classList[3],
                 "Name":document.querySelectorAll("#"+idForSel+">li")[j].innerText,
                 "ID":document.querySelectorAll("#"+idForSel+">li")[j].id.slice(1)};
    }
  };
  raidTeams[Object.keys(raidTeams).length]={"TeamName":"Benched",
              "TeamComp":bench};
    finalJson={"Name": document.querySelector("#raidTitle>h3").innerHTML,
              "ID":document.querySelector("#raidTitle>h3").id.slice(1),
              "Description":document.querySelector("#raidTitle>p:nth-of-type(1n)").innerHTML,
              "Date":document.querySelector("#raidTitle>p:nth-of-type(2n)").innerHTML.split("&nbsp;")[1],
              "Time":document.querySelector("#raidTitle>p:nth-of-type(2n)").innerHTML.split("&nbsp;")[3],
              "SortedRaids":raidTeams};
    saveToFile(finalJson,finalJson.ID+".json");


$ajaxUtils.sendGetRequest(
  "raidHistory/RHO-Raid_History.json",
  function (responseText) {
    var history={}
    var newRaidData={"Name":finalJson.Name,
                   "Date":finalJson.Date,
                   "ID":finalJson.ID}
  if (responseText!==undefined){
        history=responseText;  
        for(i=0; i<Object.keys(history).length; i++){
          if (history[i].ID==finalJson.ID){
               newRaidData={};
        }}
          
  }
  if(Object.keys(newRaidData).length!==0){
  history[Object.keys(history).length]=newRaidData;                     
  saveToFile(history,"RHO-Raid_History.json")
  }
  window.location = '/guild-manager/';
  },
  true);

};

function saveToFile(data,name){
  var jsonString = JSON.stringify(data);
  $.post("php/save.php", {
     jsonString: jsonString,
     jsonName: name
  });
}

global.$dc = dc;
})(window);

//clears Modals on close
$("#importModal").on("hidden.bs.modal", function () {
    if (document.getElementById("csvTextInputArea")===undefined) {
    document.getElementById("csvTextInputArea").value="";
    document.getElementById("csvTextInputArea").disabled=false;
    document.getElementById("csvFileInputArea").value="";
    document.getElementById("modalSubmitButton").disabled=true;
    }
});

//disables Submit button on Modal until its ok to submit
(function () {       
    $('#csvTextInputArea').bind('DOMAttrModified textInput input change keypress paste focus', function () {
            if (this.value.length>=100) {
              document.getElementById("modalSubmitButton").disabled=false;
        }
    });
}());


/*!
 * jQuery UI Touch Punch 0.2.3
 *
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
!function(a){
  function f(a,b){
    if(!(a.originalEvent.touches.length>1)){
      a.preventDefault();
      var c=a.originalEvent.changedTouches[0],d=document.createEvent("MouseEvents");
      d.initMouseEvent(b,!0,!0,window,1,c.screenX,c.screenY,c.clientX,c.clientY,!1,!1,!1,!1,0,null),a.target.dispatchEvent(d)}}
      if(a.support.touch="ontouchend"in document,a.support.touch)
        {var e,b=a.ui.mouse.prototype,c=b._mouseInit,d=b._mouseDestroy;b._touchStart=function(a)
          {var b=this;
            !e&&b._mouseCapture(a.originalEvent.changedTouches[0])&&(e=!0,b._touchMoved=!1,f(a,"mouseover"),f(a,"mousemove"),f(a,"mousedown"))},b._touchMove=function(a)
            {e&&(this._touchMoved=!0,f(a,"mousemove"))},b._touchEnd=function(a){
              e&&(f(a,"mouseup"),f(a,"mouseout"),this._touchMoved||f(a,"click"),e=!1)},b._mouseInit=function(){
                var b=this;
                b.element.bind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),c.call(b)},b._mouseDestroy=function(){
                  var b=this;
                  b.element.unbind({
                    touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),d.call(b)
                }
              }
            }(jQuery);

$(".sortable-list-import, .sortable-list-export").sortable({
  items: "li.draggable",
  connectWith: ".connectedSortable",
  placeholder: "sortable-placeholder",
  receive: function(event, ui) {
           var uls=document.querySelectorAll("#raidTeams ul");
           if ( event.target.childElementCount-1 > raidSize ) {
            $(ui.sender).sortable('cancel');
        }else{
          for (var i = 0; i<uls.length;  i++) 
            uls[i].querySelector("span").innerHTML=uls[i].getElementsByClassName("list-group-item").length;
}},
  start: function(event, ui) {
        ui.placeholder.html(ui.item.html());
      }
    }).disableSelection();
    

