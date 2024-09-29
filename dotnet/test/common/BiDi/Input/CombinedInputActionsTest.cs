using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using OpenQA.Selenium.BiDi.Modules.Input;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Input;

class CombinedInputActionsTest : BiDiFixture
{
    [Test]
    public async Task Paint()
    {
        driver.Url = "https://kleki.com/";

        await Task.Delay(3000);

        await context.Input.PerformActionsAsync([new SourceActions.Pointers {
            new SourceActions.Pointers.Pointer.Move(300, 300),
            new SourceActions.Pointers.Pointer.Down(0),
            new SourceActions.Pointers.Pointer.Move(400, 400) { Duration = 2000 },
            new SourceActions.Pointers.Pointer.Up(0),
        }]);

        await context.Input.PerformActionsAsync([new SourceActions.Keys {
            new SourceActions.Keys.Key.Down("U"),
            new SourceActions.Keys.Key.Up("U")
        }]);

        await context.Input.PerformActionsAsync([new SourceActions.Pointers {
            new SourceActions.Pointers.Pointer.Move(300, 300),
            new SourceActions.Pointers.Pointer.Down(0),
            new SourceActions.Pointers.Pointer.Move(400, 400) { Duration = 2000 },
            new SourceActions.Pointers.Pointer.Up(0),
        }]);

        await Task.Delay(3000);
    }

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
