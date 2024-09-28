using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using OpenQA.Selenium.BiDi.Modules.Input;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Input;

class CombinedInputActionsTest : BiDiFixture
{
    [Test]
    public async Task TestShiftClickingOnMultiSelectionList()
    {
        driver.Url = UrlBuilder.WhereIs("formSelectionPage.html");

        var options = await context.LocateNodesAsync(new Locator.Css("option"));

        await context.Input.PerformActionsAsync([
            new SourceActions.Pointers
            {
                new SourceActions.Pointers.Pointer.Down(1),
                new SourceActions.Pointers.Pointer.Up(1),
            }
            ]);
    }
}
