<?
// Contributed to the Sandcastle Help File Builder project by Thomas Levesque

header("Content-Type: text/html; charset=utf-8");
$toc = new DOMDocument();
$toc->load('WebTOC.xml');
$xpath = new DOMXPath($toc);
$id = $_GET["Id"];
$nodes = $xpath->query("//HelpTOCNode[@Id='$id']/*");
if ($nodes->length == 0)
{
?>
    <b>TOC node not found!</b>
<?
    die();
}
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