using System;
using System.Web.UI;

public partial class Redirect : Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        Response.Redirect("resultPage.html");
    }
}
