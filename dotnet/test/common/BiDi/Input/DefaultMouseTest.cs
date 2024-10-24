using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using OpenQA.Selenium.BiDi.Modules.Input;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Input;

class DefaultMouseTest : BiDiTestFixture
{
    [Test]
    public async Task PerformDragAndDropWithMouse()
    {
        driver.Url = UrlBuilder.WhereIs("draggableLists.html");

        await context.Input.PerformActionsAsync([
            new KeyActions
            {
                Actions =
                {
                    new Key.Down('A'),
                    new Key.Up('B')
                }
            }
            ]);

        await context.Input.PerformActionsAsync([new KeyActions
        {
            new Key.Down('A'),
            new Key.Down('B'),
            new Pause()
        }]);

        await context.Input.PerformActionsAsync([new PointerActions
        {
            new Pointer.Down(0),
            new Pointer.Up(0),
        }]);
    }

    //[Test]
    public async Task PerformCombined()
    {
        await context.NavigateAsync("https://nuget.org", new() { Wait = ReadinessState.Complete });
        
        await context.Input.PerformActionsAsync(new SequentialSourceActions().Type("Hello").Pause(2000).KeyDown(Key.Shift).Type("World"));

        await Task.Delay(3000);
    }
}
