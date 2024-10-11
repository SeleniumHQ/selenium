using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using System.Linq;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

class BrowsingContextTest : BiDiTestFixture
{
    [Test]
    public async Task CanCreateNewTab()
    {
        var tab = await bidi.BrowsingContext.CreateAsync(ContextType.Tab);

        Assert.That(tab, Is.Not.Null);
    }

    [Test]
    public async Task CanCreateNewTabWithReferencedContext()
    {
        var tab = await bidi.BrowsingContext.CreateAsync(ContextType.Tab, new()
        {
            ReferenceContext = context
        });

        Assert.That(tab, Is.Not.Null);
    }

    [Test]
    public async Task CanCreateNewWindow()
    {
        var window = await bidi.BrowsingContext.CreateAsync(ContextType.Window);

        Assert.That(window, Is.Not.Null);
    }

    [Test]
    public async Task CanCreateNewWindowWithReferencedContext()
    {
        var window = await bidi.BrowsingContext.CreateAsync(ContextType.Window, new()
        {
            ReferenceContext = context
        });

        Assert.That(window, Is.Not.Null);
    }

    [Test]
    public async Task CanCreateContextWithAllParameters()
    {
        var userContext = await bidi.Browser.CreateUserContextAsync();

        var window = await bidi.BrowsingContext.CreateAsync(ContextType.Window, new()
        {
            ReferenceContext = context,
            UserContext = userContext.UserContext,
            Background = true
        });

        Assert.That(window, Is.Not.Null);
    }

    [Test]
    public async Task CanNavigateToUrl()
    {
        var info = await context.NavigateAsync(UrlBuilder.WhereIs("/bidi/logEntryAdded.html"));

        Assert.That(info.Url, Does.Contain("/bidi/logEntryAdded.html"));
    }

    [Test]
    public async Task CanNavigateToUrlWithReadinessState()
    {
        var info = await context.NavigateAsync(UrlBuilder.WhereIs("/bidi/logEntryAdded.html"), new()
        {
            Wait = ReadinessState.Complete
        });

        Assert.That(info, Is.Not.Null);
        Assert.That(info.Url, Does.Contain("/bidi/logEntryAdded.html"));
    }

    [Test]
    public async Task CanGetTreeWithChild()
    {
        await context.NavigateAsync(UrlBuilder.WhereIs("iframes.html"), new() { Wait = ReadinessState.Complete });

        var tree = await context.GetTreeAsync();

        Assert.That(tree, Has.Count.EqualTo(1));
        Assert.That(tree[0].Context, Is.EqualTo(context));
        Assert.That(tree[0].Children, Has.Count.EqualTo(1));
        Assert.That(tree[0].Children[0].Url, Does.Contain("formPage.html"));
    }

    [Test]
    public async Task CanGetTreeWithDepth()
    {
        await context.NavigateAsync(UrlBuilder.WhereIs("iframes.html"), new() { Wait = ReadinessState.Complete });

        var tree = await context.GetTreeAsync(new() { MaxDepth = 0 });

        Assert.That(tree, Has.Count.EqualTo(1));
        Assert.That(tree[0].Context, Is.EqualTo(context));
        Assert.That(tree[0].Children, Is.Null);
    }

    [Test]
    public async Task CanGetTreeTopLevel()
    {
        var window1 = await bidi.BrowsingContext.CreateAsync(ContextType.Window);
        var window2 = await bidi.BrowsingContext.CreateAsync(ContextType.Window);

        var tree = await bidi.BrowsingContext.GetTreeAsync();

        Assert.That(tree, Has.Count.GreaterThanOrEqualTo(2));
    }

    [Test]
    public async Task CanCloseWindow()
    {
        var window = await bidi.BrowsingContext.CreateAsync(ContextType.Window);

        await window.CloseAsync();

        var tree = await bidi.BrowsingContext.GetTreeAsync();

        Assert.That(tree.Select(i => i.Context), Does.Not.Contain(window));
    }

    [Test]
    public async Task CanCloseTab()
    {
        var tab = await bidi.BrowsingContext.CreateAsync(ContextType.Tab);

        await tab.CloseAsync();

        var tree = await bidi.BrowsingContext.GetTreeAsync();

        Assert.That(tree.Select(i => i.Context), Does.Not.Contain(tab));
    }

    [Test]
    public async Task CanActivate()
    {
        await context.ActivateAsync();

        // TODO: Add assertion when https://w3c.github.io/webdriver-bidi/#type-browser-ClientWindowInfo is implemented
    }

    [Test]
    public async Task CanReload()
    {
        string url = UrlBuilder.WhereIs("/bidi/logEntryAdded.html");

        await context.NavigateAsync(url, new() { Wait = ReadinessState.Complete });

        var info = await context.ReloadAsync();

        Assert.That(info, Is.Not.Null);
        Assert.That(info.Url, Does.Contain("/bidi/logEntryAdded.html"));
    }

    [Test]
    public async Task CanReloadWithReadinessState()
    {
        string url = UrlBuilder.WhereIs("/bidi/logEntryAdded.html");

        await context.NavigateAsync(url, new() { Wait = ReadinessState.Complete });

        var info = await context.ReloadAsync(new()
        {
            Wait = ReadinessState.Complete
        });

        Assert.That(info, Is.Not.Null);
        Assert.That(info.Url, Does.Contain("/bidi/logEntryAdded.html"));
    }

    [Test]
    public async Task CanHandleUserPrompt()
    {
        await context.NavigateAsync(UrlBuilder.WhereIs("alerts.html"), new() { Wait = ReadinessState.Complete });

        driver.FindElement(By.Id("alert")).Click();

        await context.HandleUserPromptAsync();
    }

    [Test]
    public async Task CanAcceptUserPrompt()
    {
        await context.NavigateAsync(UrlBuilder.WhereIs("alerts.html"), new() { Wait = ReadinessState.Complete });

        driver.FindElement(By.Id("alert")).Click();

        await context.HandleUserPromptAsync(new()
        {
            Accept = true
        });
    }

    [Test]
    public async Task CanDismissUserPrompt()
    {
        await context.NavigateAsync(UrlBuilder.WhereIs("alerts.html"), new() { Wait = ReadinessState.Complete });

        driver.FindElement(By.Id("alert")).Click();

        await context.HandleUserPromptAsync(new()
        {
            Accept = false
        });
    }

    [Test]
    public async Task CanPassUserTextToPrompt()
    {
        await context.NavigateAsync(UrlBuilder.WhereIs("alerts.html"), new() { Wait = ReadinessState.Complete });

        driver.FindElement(By.Id("alert")).Click();

        await context.HandleUserPromptAsync(new()
        {
            UserText = "Selenium automates browsers"
        });
    }

    [Test]
    public async Task CanCaptureScreenshot()
    {
        var screenshot = await context.CaptureScreenshotAsync();

        Assert.That(screenshot, Is.Not.Null);
        Assert.That(screenshot.Data, Is.Not.Empty);
    }

    [Test]
    public async Task CanCaptureScreenshotWithParameters()
    {
        var screenshot = await context.CaptureScreenshotAsync(new()
        {
            Origin = Origin.Document,
            Clip = new ClipRectangle.Box(5, 5, 10, 10)
        });

        Assert.That(screenshot, Is.Not.Null);
        Assert.That(screenshot.Data, Is.Not.Empty);
    }

    [Test]
    public async Task CanCaptureScreenshotOfViewport()
    {
        var screenshot = await context.CaptureScreenshotAsync(new()
        {
            Origin = Origin.Viewport,
            Clip = new ClipRectangle.Box(5, 5, 10, 10)
        });

        Assert.That(screenshot, Is.Not.Null);
        Assert.That(screenshot.Data, Is.Not.Empty);
    }

    [Test]
    public async Task CanCaptureScreenshotOfElement()
    {
        await context.NavigateAsync(UrlBuilder.WhereIs("formPage.html"), new() { Wait = ReadinessState.Complete });

        var nodes = await context.LocateNodesAsync(new Locator.Css("#checky"));

        var screenshot = await context.CaptureScreenshotAsync(new()
        {
            // TODO: Seems Node implements ISharedReference
            Clip = new ClipRectangle.Element(new Modules.Script.SharedReference(nodes[0].SharedId))
        });

        Assert.That(screenshot, Is.Not.Null);
        Assert.That(screenshot.Data, Is.Not.Empty);
    }

    [Test]
    public async Task CanSetViewport()
    {
        await context.SetViewportAsync(new() { Viewport = new(250, 300) });
    }

    [Test]
    public async Task CanSetViewportWithDevicePixelRatio()
    {
        await context.SetViewportAsync(new() { Viewport = new(250, 300), DevicePixelRatio = 5 });
    }

    [Test]
    public async Task CanPrintPage()
    {
        var pdf = await context.PrintAsync();

        Assert.That(pdf, Is.Not.Null);
        Assert.That(pdf.Data, Is.Not.Empty);
    }
}
