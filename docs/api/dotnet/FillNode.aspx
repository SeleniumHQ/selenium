<%@ Page Language="C#" EnableViewState="False" %>

<script runat="server">
//===============================================================================================================
// System  : Sandcastle Help File Builder
// File    : FillNode.aspx
// Author  : Eric Woodruff  (Eric@EWoodruff.us)
// Updated : 04/09/2014
// Note    : Copyright 2007-2014, Eric Woodruff, All rights reserved
// Compiler: Microsoft C#
//
// This file contains the code used to dynamically load a parent node with its child table of content nodes when
// first expanded.
//
// This code is published under the Microsoft Public License (Ms-PL).  A copy of the license should be
// distributed with the code.  It can also be found at the project website: http://SHFB.CodePlex.com.  This
// notice, the author's name, and all copyright notices must remain intact in all applications, documentation,
// and source files.
//
//    Date     Who  Comments
// ==============================================================================================================
// 06/21/2007  EFW  Created the code
// 07/17/2013  EFW  Merged code contributed by Procomp Solutions Oy that improves performance for large TOCs by
//								  using XML serialization and caching.
//===============================================================================================================

private static readonly TocNode[] NoChildNodes = new TocNode[0];
private static readonly object TocLoadSyncObject = new object();

// This is used to contain the serialized table of contents
[XmlRoot("HelpTOC")]
public sealed class TableOfContents
{
	[XmlElement("HelpTOCNode")]
	public TocNode[] ChildNodes;

	[XmlIgnore]
	public IDictionary<string, TocNode> NodesById;

	internal void IndexNodes()
	{
		this.NodesById = new Dictionary<string, TocNode>();
		AddToIndex(this.NodesById, this.ChildNodes);
	}

	private static void AddToIndex(IDictionary<string, TocNode> nodesById, TocNode[] nodes)
	{
		foreach(TocNode node in nodes)
			if(!String.IsNullOrEmpty(node.Id))
			{
				nodesById.Add(node.Id, node);
				AddToIndex(nodesById, node.ChildNodes);
			}
	}
}

// This represents a single node in the table of contents
public sealed class TocNode
{
	[XmlAttribute("Id")]
	public string Id;

	[XmlAttribute("Title")]
	public string Title;

	[XmlAttribute("Url")]
	public string Url;

	[XmlElement("HelpTOCNode")]
	public TocNode[] ChildNodes;
}

// Load the TOC info and store it in the cache on first use
private TableOfContents GetToc()
{
	string tocPath = Server.MapPath("WebTOC.xml");
	string tocCacheKey = tocPath;

	lock(TocLoadSyncObject)
	{
		TableOfContents toc = this.Cache[tocCacheKey] as TableOfContents;

		if(toc == null)
		{
			CacheDependency cacheDependency = new CacheDependency(tocPath);

			using(XmlReader reader = XmlReader.Create(tocPath))
			{
				toc = (TableOfContents)new XmlSerializer(typeof(TableOfContents)).Deserialize(reader);
				toc.IndexNodes();
			}

			this.Cache.Insert(tocCacheKey, toc, cacheDependency);
		}

		return toc;
	}
}

// Load the requested node with its children
protected override void Render(HtmlTextWriter writer)
{
	StringBuilder sb = new StringBuilder(10240);
	TableOfContents toc = this.GetToc();

	// The ID to use should be passed in the query string
	string expandedId = this.Request.QueryString["Id"];
	TocNode expandedNode;

	if(toc.NodesById.TryGetValue(expandedId, out expandedNode))
	{
		foreach(TocNode childNode in expandedNode.ChildNodes ?? NoChildNodes)
		{
			if(childNode.ChildNodes != null && childNode.ChildNodes.Length != 0)
			{
				// Write out a parent TOC entry
				string childUrl = childNode.Url;
				string childTarget;

				if(!String.IsNullOrEmpty(childUrl))
					childTarget = " target=\"TopicContent\"";
				else
				{
					childUrl = "#";
					childTarget = String.Empty;
				}

				sb.AppendFormat("<div class=\"TreeNode\">\r\n" +
					"<img class=\"TreeNodeImg\" onclick=\"javascript: Toggle(this);\" src=\"Collapsed.gif\"/>" +
					"<a class=\"UnselectedNode\" onclick=\"javascript: return Expand(this);\" " +
					"href=\"{0}\"{1}>{2}</a>\r\n" +
					"<div id=\"{3}\" class=\"Hidden\"></div>\r\n" +
					"</div>\r\n", HttpUtility.HtmlEncode(childUrl), childTarget, HttpUtility.HtmlEncode(childNode.Title),
					childNode.Id);
			}
			else
			{
				string childUrl = childNode.Url;

				if(String.IsNullOrEmpty(childUrl))
					childUrl = "about:blank";

				// Write out a TOC entry that has no children
				sb.AppendFormat("<div class=\"TreeItem\">\r\n" +
					"<img src=\"Item.gif\"/><a class=\"UnselectedNode\" " +
					"onclick=\"javascript: return SelectNode(this);\" href=\"{0}\" " +
					"target=\"TopicContent\">{1}</a>\r\n" +
					"</div>\r\n", HttpUtility.HtmlEncode(childUrl), HttpUtility.HtmlEncode(childNode.Title));
			}
		}

		writer.Write(sb.ToString());
	}
	else
		writer.Write("<b>TOC node not found!</b>");
}
</script>
