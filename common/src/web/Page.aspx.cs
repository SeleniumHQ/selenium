using System;
using System.Threading;

public partial class Page : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        Thread.Sleep(200);

        Response.ContentType = "text/html";

        int lastIndex = Request.PathInfo.LastIndexOf("/");
        string pageNumber = (lastIndex == -1 ? "Unknown" : Request.PathInfo.Substring(lastIndex + 1));

        Response.Output.Write("<html><head><title>Foo " + pageNumber + "</title></head>");
        Response.Output.Write("<body>Page number <span id=\"pageNumber\">");
        Response.Output.Write(pageNumber);
        Response.Output.Write("</span></body></html>");
    }
}
