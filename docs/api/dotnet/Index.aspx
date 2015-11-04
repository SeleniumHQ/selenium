<%@ Page Language="C#" EnableViewState="False" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>

<head runat="server">
<title>WebDriver - Table of Content</title>
<link rel="stylesheet" href="TOC.css" />
<link rel="shortcut icon" href="favicon.ico"/>
<script type="text/javascript" src="TOC.js"></script>
</head>

<body onload="javascript: Initialize('.aspx');" onresize="javascript: ResizeTree();">
<form id="IndexForm" runat="server">

<div id="TOCDiv" class="TOCDiv">

<div id="divSearchOpts" class="SearchOpts" style="height: 100px; display: none;">
<img class="TOCLink" onclick="javascript: ShowHideSearch(false);"
    src="CloseSearch.png" height="17" width="17" alt="Hide search" style="float: right;"/>
Keyword(s) for which to search:
<input id="txtSearchText" type="text" style="width: 100%;"
  onkeypress="javascript: return OnSearchTextKeyPress(event);" /><br />
<input id="chkSortByTitle" type="checkbox" /><label for="chkSortByTitle">&nbsp;Sort results by title</label><br />
<input type="button" value="Search" onclick="javascript: return PerformSearch();" />
</div>

<div id="divIndexOpts" class="IndexOpts" style="height: 25px; display: none;">
<img class="TOCLink" onclick="javascript: ShowHideIndex(false);"
    src="CloseSearch.png" height="17" width="17" alt="Hide index" style="float: right;"/>
Keyword Index
</div>

<div id="divNavOpts" class="NavOpts" style="height: 20px;">
    <img class="TOCLink" onclick="javascript: SyncTOC();" src="SyncTOC.gif"
        height="16" width="16" alt="Sync to TOC"/>
    <img class="TOCLink" onclick="javascript: ExpandOrCollapseAll(false);"
        src="CollapseAll.png" height="16" width="16" alt="Collapse all" />
    <img class="TOCLink" onclick="javascript: ShowHideIndex(true);"
        src="Index.gif" height="16" width="16" alt="Index" />
    <img class="TOCLink" onclick="javascript: ShowHideSearch(true);"
        src="Search.gif" height="16" width="16" alt="Search" />
    <a href="#" title="Click to obtain a direct link to the displayed topic"
        style="margin-left: 10px; vertical-align: top;"
        onclick="javascript: ShowDirectLink();">Direct Link</a>
</div>

<div class="Tree" id="divSearchResults" style="display: none;"
    onselectstart="javascript: return false;">
</div>

<div class="Tree" id="divIndexResults" style="display: none;"
    onselectstart="javascript: return false;">
</div>

<div class="Tree" id="divTree" onselectstart="javascript: return false;">
<asp:Literal ID="lcTOC" runat="server" />
</div>

</div>

<div id="TOCSizer" class="TOCSizer" onmousedown="OnMouseDown(event)" onselectstart="javascript: return false;"></div>

<iframe id="TopicContent" name="TopicContent" class="TopicContent" src="html/N_OpenQA_Selenium.htm">
This page uses an IFRAME but your browser does not support it.
</iframe>

</form>

</body>

</html>

<script runat="server">
//===============================================================================================================
// System  : Sandcastle Help File Builder
// File    : Index.aspx
// Author  : Eric Woodruff  (Eric@EWoodruff.us)
// Updated : 04/09/2014
// Note    : Copyright 2007-2014, Eric Woodruff, All rights reserved
// Compiler: Microsoft C#
//
// This file contains the code used to display the index page for a website produced by the help file builder.
// The root nodes are loaded for the table of content.  Child nodes are loaded dynamically when first expanded
// using an Ajax call.
//
// This code is published under the Microsoft Public License (Ms-PL).  A copy of the license should be
// distributed with the code.  It can also be found at the project website: https://GitHub.com/EWSoftware/SHFB.  This
// notice, the author's name, and all copyright notices must remain intact in all applications, documentation,
// and source files.
//
//    Date     Who  Comments
// ==============================================================================================================
// 06/21/2007  EFW  Created the code
// 02/18/2012  EFW  Merged code from tom103 to show direct link
//===============================================================================================================

protected void Page_Load(object sender, EventArgs e)
{
    StringBuilder sb = new StringBuilder(10240);
    string id, url, target, title;

    XPathDocument toc = new XPathDocument(Server.MapPath("WebTOC.xml"));
    XPathNavigator navToc = toc.CreateNavigator();
    XPathNodeIterator root = navToc.Select("HelpTOC/*");

    foreach(XPathNavigator node in root)
    {
        if(node.HasChildren)
        {
            // Write out a parent TOC entry
            id = node.GetAttribute("Id", String.Empty);
            title = node.GetAttribute("Title", String.Empty);
            url = node.GetAttribute("Url", String.Empty);

            if(!String.IsNullOrEmpty(url))
                target = " target=\"TopicContent\"";
            else
            {
                url = "#";
                target = String.Empty;
            }

            sb.AppendFormat("<div class=\"TreeNode\">\r\n" +
                "<img class=\"TreeNodeImg\" " +
                "onclick=\"javascript: Toggle(this);\" " +
                "src=\"Collapsed.gif\"/><a class=\"UnselectedNode\" " +
                "onclick=\"javascript: return Expand(this);\" " +
                "href=\"{0}\"{1}>{2}</a>\r\n" +
                "<div id=\"{3}\" class=\"Hidden\"></div>\r\n</div>\r\n",
								HttpUtility.HtmlEncode(url), target, HttpUtility.HtmlEncode(title), id);
        }
        else
        {
            title = node.GetAttribute("Title", String.Empty);
            url = node.GetAttribute("Url", String.Empty);

            if(String.IsNullOrEmpty(url))
                url = "about:blank";

            // Write out a TOC entry that has no children
            sb.AppendFormat("<div class=\"TreeItem\">\r\n" +
                "<img src=\"Item.gif\"/>" +
                "<a class=\"UnselectedNode\" " +
                "onclick=\"javascript: return SelectNode(this);\" " +
                "href=\"{0}\" target=\"TopicContent\">{1}</a>\r\n" +
								"</div>\r\n", HttpUtility.HtmlEncode(url), HttpUtility.HtmlEncode(title));
        }
    }

    lcTOC.Text = sb.ToString();
}
</script>
