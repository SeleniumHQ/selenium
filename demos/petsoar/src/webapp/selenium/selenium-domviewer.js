var HIDDEN="hidden";
var LEVEL = "level";
var PLUS_SRC="dom-images/butplus.gif"
var MIN_SRC="dom-images/butmin.gif"
var newRoot;
var maxColumns=1;

function loadDomViewer(){
	if(window.opener != null){
		//Open in a new window. 
		// Start with specified root object.
		// It should be defined as a "newRoot" variable 
		// in the tested page. Could be any element in 
		// the DOM structure of the page that opened it.
		// Default to document if no object is specified.
		newRoot  = window.opener.newRoot;
	
		if (newRoot==null)
			newRoot = window.opener.document;
	
		document.writeln(displayDOM(newRoot));
		document.close();
	}else{
		newRoot = parent.document.all['myiframe'].contentWindow.document;
		newRoot.writeln(displayDOM(newRoot));
		newRoot.close();
	}
}


function displayDOM(root){
	var str = "<html><head><title>DOM Viewerr</title><script type='text/javascript' src='domviewer.js'><!-- comments --> </script><link href='dom-styles/default.css' rel='stylesheet' type='text/css' /></head><body>";
	str+="<table>";
	str += treeTraversal(root,0);
	// to make table columns work well.
	str += "<tr>";
	for (var i=0; i < maxColumns; i++) {
	    str+= "<td>&nbsp;&nbsp;&nbsp;&nbsp;</td>";
	}
	str += "</tr>";
	str += "</table></body></html>";
	return str;
}

function checkForChildren(element){
	if(!element.hasChildNodes())
		return false;
	
	var nodes = element.childNodes;
	var size = nodes.length;
	var count=0;
	
	for(var i=0; i< size; i++){
		var node = nodes.item(i);
		//if(node.toString()=="[object Text]"){
		//this is equalent to the above
		//but will work with more browsers
		if(node.nodeType!=1){
			count++;
		}
	}
	
	if(count == size)
		return false;
	else
		return true;
}

function treeTraversal(root, level){
	var str = "";
	var nodes= null;
	var size = null;
	//it is supposed to show the last node, 
	//but the last node is always nodeText type
	//and we don't show it
	if(!root.hasChildNodes())
		return "";//displayNode(root,level,false);

	nodes = root.childNodes;
	size = nodes.length;

	for(var i=0; i< size; i++){
		var element = nodes.item(i);
		//if the node is textNode, don't display
		if(element.nodeType==1){
			str+= displayNode(element,level,checkForChildren(element));
			str+=treeTraversal(element, level+1);	
		}
	}
	return str;
}


function displayNode(element, level, isLink){
        nodeContent = getNodeContent(element);
        columns = Math.round((nodeContent.length / 12) + 0.5);
        if (columns + level > maxColumns) {
            maxColumns = columns + level;
        }
		var str ="<tr class='"+LEVEL+level+"'>";
		for (var i=0; i < level; i++)
			str+= "<td> </td>";
		str+="<td colspan='"+ columns +"' class='box"+" boxlevel"+level+"' >";
		if(isLink){
			str+='<a onclick="hide(this);" href="javascript:void(this);">';
			str+='<img src="'+MIN_SRC+'" />';
		}
        str += nodeContent;
		if(isLink)
			str+="</a></td></tr>";
		return str;
}

function getNodeContent(element) {
        str = "";
		id ="";
		if (element.id != null && element.id != "") {
		    id = " ID(" + element.id +")";
		}
		name ="";
		if (element.name != null && element.name != "") {
		    name = " NAME(" + element.name + ")";
		}
		value ="";
		if (element.value != null && element.value != "") {
		    value = " VALUE(" + element.value + ")";
		}
		href ="";
		if (element.href != null && element.href != "") {
		    href = " HREF(" + element.href + ")";
		}
		text ="";
		if (element.text != null && element.text != "" && element.text != "undefined") {
		    text = " #TEXT(" + trim(element.text) +")";
		}
		str+=" <b>"+ element.nodeName + id + name + value + href + text + "</b>";	
		return str;

}

function trim(val) {
        val2 = val.substring(0,20) + "                   ";
        var spaceChr = String.fromCharCode(32);
        var length = val2.length;
        var retVal = "";
        var ix = length -1;

        while(ix > -1){
            if(val2.charAt(ix) == spaceChr) {
            } else {
                retVal = val2.substring(0, ix +1);
                break;
            }
            ix = ix-1;
        }
        if (val.length > 20) {
            retVal += "...";
        }
        return retVal;
}

function hide(hlink){
	var isHidden = false;
	var image = hlink.firstChild;
	if(image.src.toString().indexOf(MIN_SRC)!=-1){
		image.src=PLUS_SRC;
		isHidden=true;
	}else{
		image.src=MIN_SRC;
	}
	var rowObj= hlink.parentNode.parentNode;
	var rowLevel = parseInt(rowObj.className.substring(LEVEL.length));
	
	var sibling = rowObj.nextSibling;
	var siblingLevel = sibling.className.substring(LEVEL.length);
	if(siblingLevel.indexOf(HIDDEN)!=-1){
		siblingLevel = siblingLevel.substring(0,siblingLevel.length - HIDDEN.length-1);
	}
	siblingLevel=parseInt(siblingLevel);
	while(sibling!=null && rowLevel<siblingLevel){
		if(isHidden){
			sibling.className += " "+ HIDDEN;
		}else if(!isHidden && sibling.className.indexOf(HIDDEN)!=-1){
			var str = sibling.className;
			sibling.className=str.substring(0, str.length - HIDDEN.length-1);
		}
		sibling = sibling.nextSibling;
		siblingLevel = parseInt(sibling.className.substring(LEVEL.length));
	}
}



