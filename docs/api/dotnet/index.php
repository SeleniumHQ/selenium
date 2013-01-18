<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>

<head>
<title>WebDriver - Table of Content</title>
<link rel="stylesheet" href="TOC.css">
<link rel="shortcut icon" href="favicon.ico"/>
<script type="text/javascript" src="TOC.js"></script>
</head>

<body onload="javascript: Initialize('.php');" onresize="javascript: ResizeTree();">
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
    <img class="TOCLink" onclick="javascript: ExpandOrCollapseAll(true);"
        src="ExpandAll.bmp" height="16" width="16" alt="Expand all "/>
    <img class="TOCLink" onclick="javascript: ExpandOrCollapseAll(false);"
        src="CollapseAll.bmp" height="16" width="16" alt="Collapse all" />
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
<?
$toc = new DOMDocument();
$toc->load('WebTOC.xml');
$xpath = new DOMXPath($toc);
$nodes = $xpath->query("/HelpTOC/*");
foreach($nodes as $node)
{
    $id = $node->getAttribute("Id");
    $url = $node->getAttribute("Url");
    $title = $node->getAttribute("Title");
    if (empty($url))
    {
        $url = "#";
        $target = "";
    }
    else
    {
        $target = " target=\"TopicContent\"";
    }

    if ($node->hasChildNodes())
    {
?>
        <div class="TreeNode">
            <img class="TreeNodeImg" onclick="javascript: Toggle(this);" src="Collapsed.gif"/>
            <a class="UnselectedNode" onclick="javascript: Expand(this);" href="<?= $url ?>"<?= $target ?>><?= $title ?></a>
            <div id="<?= $id ?>" class="Hidden"></div>
        </div>
<?
    }
    else
    {
?>
        <div class="TreeItem">
            <img src="Item.gif"/>
            <a class="UnselectedNode" onclick="javascript: SelectNode(this);" href="<?= $url ?>"<?= $target ?>><?= $title ?></a>
        </div>
<?
    }
}
?>
</div>

</div>

<div id="TOCSizer" class="TOCSizer" onmousedown="OnMouseDown(event)" onselectstart="javascript: return false;"></div>

<iframe id="TopicContent" name="TopicContent" class="TopicContent" src="html/N_OpenQA_Selenium.htm">
This page uses an IFRAME but your browser does not support it.
</iframe>

</form>

</body>

</html>