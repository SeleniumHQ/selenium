using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi;

public static class WebDriverExtensions
{
    public static async Task<BiDi> AsBiDiAsync(this IWebDriver webDriver)
    {
        var webSocketUrl = ((IHasCapabilities)webDriver).Capabilities.GetCapability("webSocketUrl");

        if (webSocketUrl is null) throw new System.Exception("The driver is not compatible with bidirectional protocol or it is not enabled in driver options.");

        var bidi = await BiDi.ConnectAsync(webSocketUrl.ToString()!).ConfigureAwait(false);

        return bidi;
    }

    public static async Task<BrowsingContext> AsBiDiContextAsync(this IWebDriver webDriver)
    {
        var bidi = await webDriver.AsBiDiAsync();

        var currentBrowsingContext = new BrowsingContext(bidi, webDriver.CurrentWindowHandle);

        return currentBrowsingContext;
    }
}
