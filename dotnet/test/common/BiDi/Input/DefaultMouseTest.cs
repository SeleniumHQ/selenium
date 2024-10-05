using NUnit.Framework;
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
            new SourceActions.Keys
            {
                Actions =
                {
                    new SourceActions.Key.Down("A")
                }
            }
            ]);

        await context.Input.PerformActionsAsync([new SourceActions.Keys
        {
            new SourceActions.Key.Down("A"),
            new SourceActions.Key.Down("B"),
            new SourceActions.Key.Pause()
        }]);

        await context.Input.PerformActionsAsync([new SourceActions.Pointers
        {
            new SourceActions.Pointer.Down(0),
            new SourceActions.Pointer.Up(0),
        }]);
    }
}
