// The Onload method
// this is an array that holds the devLangs of language specific text control, they might are:
// vb, cs, cpp, nu
var allLanguageTagSets = new Array();
// we stored the ids of code snippets of same pages so that we can do interaction between them when tab are selected
var snippetIdSets = new Array();

function onLoad()
{
    // This is a hack to fix the URLs for the background images on certain styles.  Help Viewer 1.0 doesn't
    // mind if you put the relative URL in the styles for fix up later in script.  However, Help Viewer 2.0 will
    // abort all processing and won't run any startup script if it sees an invalid URL in the style.  As such, we
    // put a dummy attribute in the style to specify the image filename and use this code to get the URL from the
    // Favorites icon and then substitute the background image icons in the URL and set it in each affected style.
    // This works in either version of the help viewer.
    var iconPath = undefined;

    try
    {
        var linkEnum = document.getElementsByTagName("link");
        var link;

        for(var idx = 0; idx < linkEnum.length; idx++)
        {
            link = linkEnum[idx];

            if(link.rel.toLowerCase() == "shortcut icon")
                iconPath = link.href.toString();
        }
    }
    catch (e) { }
    finally {}

    if(iconPath)
    {
        try
        {
            var styleSheetEnum = document.styleSheets;
            var styleSheet;
            var ruleNdx;
            var rule;

            for(var idx = 0; idx < styleSheetEnum.length; idx++)
            {
                styleSheet = styleSheetEnum[idx];

                // Ignore sheets at ms-help URLs
                if(styleSheet.href != null && styleSheet.href.substr(0,8) == "ms-help:")
                    continue;

                // Ignore errors (Help Viewer 2).  styleSheet.rules is inaccessible due to security restrictions
                // for all style sheets not defined within the page.
                try
                {
                    // Get sheet rules
                    var rules = styleSheet.rules;

                    if(rules == null)
                        rules = styleSheet.cssRules;

                    if(rules != null)
                        if(rules.length != 0)
                            for(ruleNdx = 0; ruleNdx != rules.length; ruleNdx++)
                            {
                                rule = rules.item(ruleNdx);

                                var selectorText = rule.selectorText.toLowerCase();

                                // The selector text may show up grouped or individually for these
                                if(selectorText == ".oh_codesnippetcontainertableftactive, .oh_codesnippetcontainertableft, .oh_codesnippetcontainertableftdisabled" ||
                                  selectorText == ".oh_codesnippetcontainertableftactive" ||
                                  selectorText == ".oh_codesnippetcontainertableft" ||
                                  selectorText == ".oh_codesnippetcontainertableftdisabled")
                                {
                                    rule.style.backgroundImage = "url(" + iconPath.replace("favicon.ico", "tabLeftBG.gif") + ")";
                                }

                                if(selectorText == ".oh_codesnippetcontainertabrightactive, .oh_codesnippetcontainertabright, .oh_codesnippetcontainertabrightdisabled" ||
                                  selectorText == ".oh_codesnippetcontainertabrightactive" ||
                                  selectorText == ".oh_codesnippetcontainertabright" ||
                                  selectorText == ".oh_codesnippetcontainertabrightdisabled")
                                {
                                    rule.style.backgroundImage = "url(" + iconPath.replace("favicon.ico", "tabRightBG.gif") + ")";
                                }

                                if(selectorText == ".oh_footer")
                                {
                                    rule.style.backgroundImage = "url(" + iconPath.replace("favicon.ico", "footer_slice.gif") + ")";
                                }
                            }
                }
                catch (e) { }
                finally {}
            }
        }
        catch (e) { }
        finally {}
    }

    // In MS Help Viewer, the transform the topic is ran through can move the footer.  Move it back where it
    // belongs if necessary.
    try
    {
        var footer = document.getElementById("OH_footer")

        if(footer)
        {
            var footerParent = document.body;

            if(footer.parentElement != footerParent)
            {
                footer.parentElement.removeChild(footer);
                footerParent.appendChild(footer);
            }
        }
    }
    catch(e) { }
    finally { }

  var lang = GetCookie("CodeSnippetContainerLang", "C#");
  var currentLang = getDevLangFromCodeSnippet(lang);

  // if LST exists on the page, then set the LST to show the user selected programming language.
  updateLST(currentLang);

  // if code snippet exists
  if (snippetIdSets.length > 0)
  {
    var i = 0;
    while (i < snippetIdSets.length)
    {
      var _tempSnippetCount = 5;
      if (document.getElementById(snippetIdSets[i] + "_tab4") == null)
        _tempSnippetCount = 1;

      if (_tempSnippetCount < 2)
      { // Tabs not grouped - skip

        // Disable 'Copy to clipboard' link if in Chrome
        if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1)
        {
          document.getElementById(snippetIdSets[i] + "_copycode").style.display = 'none';
        }

        i++;
        continue;
      }
      if (lang != null && lang.length > 0)
      {
        var index = 1, j = 1;
        while (j < 6)
        {
          var tabTemp = document.getElementById(snippetIdSets[i] + "_tab" + j);
          if (tabTemp == null) { j++; continue; }
          if (tabTemp.innerHTML.indexOf(lang) != -1)
          {
              index = j;
              break;
          }
          j++;
      }
      if (j == 6) {
          if (document.getElementById(snippetIdSets[i] + "_tab1").className.indexOf("OH_CodeSnippetContainerTabDisabled") != -1) {
              // Select the first non-disabled tab
              var j = 2;
              while (j < 6) {
                  var tab = document.getElementById(snippetIdSets[i] + "_tab" + j);
                  if (tab.className.indexOf("OH_CodeSnippetContainerTabDisabled") == -1) {
                      tab.className = "OH_CodeSnippetContainerTabActiveNotFirst";
                      document.getElementById(snippetIdSets[i] + '_code_Div' + j).style.display = 'block';
                      break;
                  }
                  j++;
              }

              // disable left most img if first tab disabled
              document.getElementById(snippetIdSets[i] + "_tabimgleft").className = "OH_CodeSnippetContainerTabLeftDisabled";
          }
      }
      else {
          setCurrentLang(snippetIdSets[i], lang, index, _tempSnippetCount, false);
      }
     
      }
      if (document.getElementById(snippetIdSets[i] + "_tab4").className.indexOf("OH_CodeSnippetContainerTabDisabled") != -1)
      {
        // disable right most img if last tab disabled
        document.getElementById(snippetIdSets[i] + "_tabimgright").className = "OH_CodeSnippetContainerTabRightDisabled";
      }

      i++;
    }
  }
}

// The function executes on OnLoad event and Changetab action on Code snippets.
// The function parameter changeLang is the user choosen programming language, VB is used as default language if the app runs for the fist time.
// this function iterates through the 'lanSpecTextIdSet' dictionary object to update the node value of the LST span tag per user's choosen programming language.
function updateLST(currentLang) 
{
    for (var lstMember in lanSpecTextIdSet) 
    {
        var devLangSpan = document.getElementById(lstMember);
        if (devLangSpan != null) 
        {
            // There is a carriage return before the LST control in the content, so the replace function below is used to trim the white space(s) at the end of the previous node of the current LST node.
            if (devLangSpan.previousSibling != null && devLangSpan.previousSibling.nodeValue != null) devLangSpan.previousSibling.nodeValue = devLangSpan.previousSibling.nodeValue.replace(/\s+$/, "");
            var langs = lanSpecTextIdSet[lstMember].split("|");
            var k = 0;
            while (k < langs.length) 
            {
                if (currentLang == langs[k].split("=")[0]) 
                {
                    devLangSpan.innerHTML = langs[k].split("=")[1];
                    break;
                }
                k++;
            }
        }
    }
}

function getDevLangFromCodeSnippet(lang)
{
  var tagSet = "nu";
  if (lang != null)
  {
    var temp = lang.toLowerCase().replace(" ", "");
    if (temp.indexOf("visualbasic") != -1)
      tagSet = "vb";
    if ((temp.indexOf("csharp") != -1) || (temp.indexOf("c#") != -1))
      tagSet = "cs";
    if ((temp.indexOf("cplusplus") != -1) || (temp.indexOf("visualc++") != -1))
      tagSet = "cpp";
    if((temp.indexOf("fsharp") != -1) || (temp.indexOf("f#") != -1))
        tagSet = "fs";
}
  return tagSet;
}
// Cookie functionality
function GetCookie(sName, defaultValue)
{
  var aCookie = document.cookie.split("; ");
  for (var i = 0; i < aCookie.length; i++)
  {
    var aCrumb = aCookie[i].split("=");

    if (sName == aCrumb[0])
      return unescape(aCrumb[1])
  }
  return defaultValue;
}
function SetCookie(name, value, expires, path, domain, secure)
{
  // set time, it's in milliseconds
  var today = new Date();
  today.setTime(today.getTime());

  if (expires)
  {
    expires = expires * 1000 * 60 * 60 * 24;
  }
  var expires_date = new Date(today.getTime() + (expires));

  document.cookie = name + "=" + escape(value) +
    ((expires) ? ";expires=" + expires_date.toGMTString() : "") +
    ((path) ? ";path=" + path : "") +
    ((domain) ? ";domain=" + domain : "") +
    ((secure) ? ";secure" : "");
}

function SetCodeSnippetContainerLangCookie(lang)
{
  SetCookie("CodeSnippetContainerLang", lang, 60, "/", "", "");
  return;
}

// we store the ids of LST control as dictionary object key values, so that we can get access to them and update when user changes to a different programming language. 
// The values of this dictionary objects are ';' separated languagespecific attributes of the mtps:languagespecific control in the content.
// This function is called from LanguageSpecificText.xslt
var lanSpecTextIdSet = new Object();
function addToLanSpecTextIdSet(id)
{
    var key = id.split("?")[0];
    var value =id.split("?")[1];
    lanSpecTextIdSet[key] = value;
}

// Functions called from codesnippet.xslt
function ChangeTab(objid, lang, index, snippetCount)
{
  setCurrentLang(objid, lang, index, snippetCount, true);
  SetCodeSnippetContainerLangCookie(lang);

  // switch tab for all of other code snippets
  i = 0;
  while (i < snippetIdSets.length)
  {
    // we just care about other snippets
    if (snippetIdSets[i] != objid)
    {

      var _tempSnippetCount = 5;
      if (document.getElementById(snippetIdSets[i] + "_tab4") == null)
        _tempSnippetCount = 1;
      if (_tempSnippetCount < 2)
      { // Tabs are not grouped - skip
        i++;
        continue;
      }


      var index = 1, j = 1;
      while (j < 6)
      {
        var tabTemp = document.getElementById(snippetIdSets[i] + "_tab" + j);
        if (tabTemp == null) { j++; continue; }
        if (tabTemp.innerHTML.indexOf(lang) != -1)
        {
          index = j;
        }
        j++;
      }

      if (index > 5) index = 1;
      setCurrentLang(snippetIdSets[i], lang, index, _tempSnippetCount, false);
    }
    i++;
  }
}
var viewPlain = false;
function setCurrentLang(objid, lang, index, snippetCount, setLangSpecText)
{
  var _tab = document.getElementById(objid + "_tab" + index);
  if (_tab != null)
  {
    if (document.getElementById(objid + "_tab" + index).innerHTML.match("javascript") == null)
    {
      //Select left most tab as fallback
      var i = 1;
      while (i < 6)
      {
        if (!document.getElementById(objid + "_tab" + i).disabled)
        {
          setCurrentLang(objid, document.getElementById(objid + "_tab" + i).firstChild.innerHTML, i, snippetCount, false);
          return;
        }
        i++;
      }
      return;
    }
    var langText = _tab.innerHTML;
    if (langText.indexOf(lang) != -1)
    {
      i = 1;
      while (i < 6)
      {
        var tabtemp = document.getElementById(objid + "_tab" + i);
        if (tabtemp != null)
        {
          if (tabtemp.className == "OH_CodeSnippetContainerTabActive")
            tabtemp.className = "OH_CodeSnippetContainerTabFirst";
          if (tabtemp.className == "OH_CodeSnippetContainerTabActiveNotFirst")
            tabtemp.className = "OH_CodeSnippetContainerTab";
        }
        var codetemp = document.getElementById(objid + "_code_Div" + i);
        if (codetemp != null)
        {
          if (codetemp.style.display != 'none')
            codetemp.style.display = 'none';
        }
        i++;
      }
      document.getElementById(objid + "_tab" + index).className = "OH_CodeSnippetContainerTabActive";
      if (index != 1)
        document.getElementById(objid + "_tab" + index).className = "OH_CodeSnippetContainerTabActiveNotFirst";

      if (viewPlain == false) document.getElementById(objid + '_code_Div' + index).style.display = 'block';
      else document.getElementById(objid + '_code_Plain_Div' + index).style.display = 'block';

      // change the css of the first/last image div according the current selected tab
      // if the first tab is selected
      if (index == 1)
        document.getElementById(objid + "_tabs").firstChild.className = "OH_CodeSnippetContainerTabLeftActive";
      else
      {
        if (document.getElementById(objid + "_tabs").firstChild.className != "OH_CodeSnippetContainerTabLeftDisabled")
          document.getElementById(objid + "_tabs").firstChild.className = "OH_CodeSnippetContainerTabLeft";
      }
      // if the last tab is selected
      if (index == snippetCount)
        document.getElementById(objid + "_tabs").lastChild.className = "OH_CodeSnippetContainerTabRightActive";
      else
      {
        if (document.getElementById(objid + "_tabs").lastChild.className != "OH_CodeSnippetContainerTabRightDisabled")
          document.getElementById(objid + "_tabs").lastChild.className = "OH_CodeSnippetContainerTabRight";
      }

      // show copy code button if EnableCopyCode is set to true (and not in Chrome)
      if (document.getElementById(objid + "_tab" + index).getAttribute("EnableCopyCode") == "true"
      && navigator.userAgent.toLowerCase().indexOf('chrome') == -1)
      {
        document.getElementById(objid + "_copycode").style.display = 'inline';
      }
      else
      {
        document.getElementById(objid + "_copycode").style.display = 'none';
      }

    // if LST exists on the page, then set the LST to show the user selected programming language.
    if (setLangSpecText) 
    {
      var currentLang = getDevLangFromCodeSnippet(lang);
      updateLST(currentLang);
    }
  }
 }
}
function addSpecificTextLanguageTagSet(codesnippetid)
{
  var i = 1;
  while (i < 6)
  {
    var snippetObj = document.getElementById(codesnippetid + "_tab" + i);
    if (snippetObj == null) break;

    var tagSet = getDevLangFromCodeSnippet(snippetObj.innerHTML);
    var insert = true;
    var j = 0;
    while (j < allLanguageTagSets.length)
    {
      if (allLanguageTagSets[j] == tagSet)
      {
        insert = false;
      }
      j++;
    }
    if (insert) allLanguageTagSets.push(tagSet);
    i++;
  }
  snippetIdSets.push(codesnippetid);
}

function CopyToClipboard(objid, snippetCount)
{
  var contentid;
  var i = 1;
  while (i <= snippetCount)
  {
    var obj = document.getElementById(objid + '_code_Div' + i);
    if ((obj != null) && (obj.style.display != 'none') && (document.getElementById(objid + '_code_Plain_Div' + i).innerText != ''))
    {
      contentid = objid + '_code_Plain_Div' + i;
      break;
    }

    obj = document.getElementById(objid + '_code_Plain_Div' + i);
    if ((obj != null) && (obj.style.display != 'none') && (document.getElementById(objid + '_code_Plain_Div' + i).innerText != ''))
    {
      contentid = objid + '_code_Plain_Div' + i;
      break;
    }
    i++;
  }
  if (contentid == null) return;
  if (window.clipboardData)
  {
      try { window.clipboardData.setData("Text", document.getElementById(contentid).innerText); } 
      catch (e) {
          alert("Permission denied. Enable copying to the clipboard.");
      }
  }
  else if (window.netscape)
  {
    try
    {
      netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');

      var clip = Components.classes['@mozilla.org/widget/clipboard;1']
                          .createInstance(Components.interfaces.nsIClipboard);
      if (!clip) return;
      var trans = Components.classes['@mozilla.org/widget/transferable;1']
                          .createInstance(Components.interfaces.nsITransferable);
      if (!trans) return;
      trans.addDataFlavor('text/unicode');

      var str = new Object();
      var len = new Object();
      var str = Components.classes["@mozilla.org/supports-string;1"]
                          .createInstance(Components.interfaces.nsISupportsString);
      var copytext = document.getElementById(contentid).textContent;
      str.data = copytext;
      trans.setTransferData("text/unicode", str, copytext.length * 2);
      var clipid = Components.interfaces.nsIClipboard;
      clip.setData(trans, null, clipid.kGlobalClipboard);
    }
    catch (e)
    {
      alert("Permission denied. Enter \"about:config\" in the address bar and double-click the \"signed.applets.codebase_principal_support\" setting to enable copying to the clipboard.");
    }
  }
  else
  {
    return;
  }
}

function Print(objid, snippetCount)
{
  var contentid;
  var i = 1;
  while (i <= snippetCount)
  {
    var obj = document.getElementById(objid + '_code_Div' + i);
    if ((obj != null) && (obj.style.display != 'none'))
    {
      contentid = objid + '_code_Plain_Div' + i;
      break;
    }

    obj = document.getElementById(objid + '_code_Plain_Div' + i);
    if ((obj != null) && (obj.style.display != 'none'))
    {
      contentid = objid + '_code_Plain_Div' + i;
      break;
    }
    i++;
  }
  if (contentid == null) return;
  var obj = document.getElementById(contentid);
  if (obj)
  {
      var tempwin = window.open('', '', 'top=900000, left=900000, dependent=yes');
      if (tempwin && tempwin.document) {
          try {
              tempwin.document.title = "Printer Dialog";
              tempwin.document.body.innerText = obj.innerText;
              tempwin.print();
              tempwin.close();
          } catch (e) { if (tempwin) tempwin.close(); };
      }
  }
}
