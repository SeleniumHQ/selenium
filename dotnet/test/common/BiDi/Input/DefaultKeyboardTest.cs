using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using OpenQA.Selenium.BiDi.Modules.Input;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Input;

class DefaultKeyboardTest : BiDiTestFixture
{
    [Test]
    public async Task TestBasicKeyboardInput()
    {
        driver.Url = UrlBuilder.WhereIs("single_text_input.html");

        var input = (await context.LocateNodesAsync(new Locator.Css("#textInput")))[0];

        await context.Input.PerformActionsAsync(new SequentialSourceActions()
            .PointerMove(0, 0, new() { Origin = new Modules.Input.Origin.Element(new Modules.Script.SharedReference(input.SharedId)) })
            .PointerDown(0)
            .PointerUp(0)
            .Type("abc def"));

        Assert.That(driver.FindElement(By.Id("textInput")).GetAttribute("value"), Is.EqualTo("abc def"));
    }

    [Test]
    public async Task TestSendingKeyDownOnly()
    {
        driver.Url = UrlBuilder.WhereIs("key_logger.html");

        var input = (await context.LocateNodesAsync(new Locator.Css("#theworks")))[0];

        await context.Input.PerformActionsAsync(new SequentialSourceActions()
            .PointerMove(0, 0, new() { Origin = new Modules.Input.Origin.Element(new Modules.Script.SharedReference(input.SharedId)) })
            .PointerDown(0)
            .PointerUp(0)
            .KeyDown(Key.Shift));

        Assert.That(driver.FindElement(By.Id("result")).Text, Does.EndWith("keydown"));
    }

    [Test]
    public async Task TestSendingKeyUp()
    {
        driver.Url = UrlBuilder.WhereIs("key_logger.html");

        var input = (await context.LocateNodesAsync(new Locator.Css("#theworks")))[0];

        await context.Input.PerformActionsAsync(new SequentialSourceActions()
            .PointerMove(0, 0, new() { Origin = new Modules.Input.Origin.Element(new Modules.Script.SharedReference(input.SharedId)) })
            .PointerDown(0)
            .PointerUp(0)
            .KeyDown(Key.Shift)
            .KeyUp(Key.Shift));

        Assert.That(driver.FindElement(By.Id("result")).Text, Does.EndWith("keyup"));
    }

    [Test]
    public async Task TestSendingKeysWithShiftPressed()
    {
        driver.Url = UrlBuilder.WhereIs("key_logger.html");

        var input = (await context.LocateNodesAsync(new Locator.Css("#theworks")))[0];

        await context.Input.PerformActionsAsync(new SequentialSourceActions()
            .PointerMove(0, 0, new() { Origin = new Modules.Input.Origin.Element(new Modules.Script.SharedReference(input.SharedId)) })
            .PointerDown(0)
            .PointerUp(0)
            .KeyDown(Key.Shift)
            .Type("ab")
            .KeyUp(Key.Shift));

        Assert.That(driver.FindElement(By.Id("result")).Text, Does.EndWith("keydown keydown keypress keyup keydown keypress keyup keyup"));
        Assert.That(driver.FindElement(By.Id("theworks")).GetAttribute("value"), Is.EqualTo("AB"));
    }

    [Test]
    public async Task TestSendingKeysToActiveElement()
    {
        driver.Url = UrlBuilder.WhereIs("bodyTypingTest.html");

        await context.Input.PerformActionsAsync(new SequentialSourceActions().Type("ab"));

        Assert.That(driver.FindElement(By.Id("body_result")).Text, Does.EndWith("keypress keypress"));
        Assert.That(driver.FindElement(By.Id("result")).Text, Is.EqualTo(" "));
    }
}
