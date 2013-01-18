<?
    // Contributed to the Sandcastle Help File Builder project by Thomas Levesque

    $ki = new DOMDocument();
    $ki->load("WebKI.xml");
    $xpath = new DOMXPath($ki);
    $nodes = $xpath->query("/HelpKI/*");
    $startIndexParam = $_GET["StartIndex"];
    $startIndex = 0;
    if (!empty($startIndexParam))
        $startIndex = intval($startIndexParam) * 128;
    $endIndex = $startIndex + 128;

    if ($endIndex > $nodes->length)
        $endIndex = $nodes->length;

    if($startIndex > 0)
    {
    ?>
        <div class="IndexItem">
        <span>&nbsp;</span><a class="UnselectedNode" onclick="javascript: return ChangeIndexPage(-1);" href="#"><b><< Previous page</b></a>
        </div>
    <?
    }

    while($startIndex < $endIndex)
    {
        $node = $nodes->item($startIndex);
        $url = $node->getAttribute("Url");
        $title = $node->getAttribute("Title");
        $target = " target=\"TopicContent\"";

        if (empty($url))
        {
            $url = "#";
            $target = "";
        }
?>
<div class="IndexItem">
    <span>&nbsp;</span><a class="UnselectedNode" onclick="javascript: return SelectIndexNode(this);" href="<?= $url ?>"<?= $target ?>><?= $title ?></a>
    <?
        $subNodes = $xpath->query("./HelpKINode", $node);
        foreach($subNodes as $subNode)
        {
            $subUrl = $subNode->getAttribute("Url");
            $subTitle = $subNode->getAttribute("Title");
    ?>
        <div class="IndexSubItem">
            <img src="Item.gif"/><a class="UnselectedNode" onclick="javascript: return SelectIndexNode(this);" href="<?= $subUrl ?>" target="TopicContent"><?= $subTitle ?></a>
        </div>

    <?
        }
    ?>
</div>
<?
        $startIndex++;
    }

    if($startIndex < $nodes->length)
    {
    ?>
        <div class="IndexItem">
        <span>&nbsp;</span><a class="UnselectedNode" onclick="javascript: return ChangeIndexPage(1);" href="#"><b>Next page >></b></a>
        </div>
    <?
    }
?>