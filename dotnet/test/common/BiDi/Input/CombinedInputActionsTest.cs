using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using OpenQA.Selenium.BiDi.Modules.Input;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Input;

class CombinedInputActionsTest : BiDiTestFixture
{
    //[Test]
    public async Task Paint()
    {
        driver.Url = "https://kleki.com/";

        await Task.Delay(3000);

        await context.Input.PerformActionsAsync([new PointerActions {
            new Pointer.Move(300, 300),
            new Pointer.Down(0),
            new Pointer.Move(400, 400) { Duration = 2000, Width = 1, Twist = 1 },
            new Pointer.Up(0),
        }]);

        await context.Input.PerformActionsAsync([new KeyActions {
            new Key.Down('U'),
            new Key.Up('U'),
            new Pause { Duration = 3000 }
        }]);

        await context.Input.PerformActionsAsync([new PointerActions {
            new Pointer.Move(300, 300),
            new Pointer.Down(0),
            new Pointer.Move(400, 400) { Duration = 2000 },
            new Pointer.Up(0),
        }]);

        await Task.Delay(3000);
    }

    [Test]
    public async Task TestShiftClickingOnMultiSelectionList()
    {
        driver.Url = UrlBuilder.WhereIs("formSelectionPage.html");

        var options = await context.LocateNodesAsync(new Locator.Css("option"));

        await context.Input.PerformActionsAsync([
            new PointerActions
            {
                new Pointer.Down(1),
                new Pointer.Up(1),
            }
            ]);
    }
}
