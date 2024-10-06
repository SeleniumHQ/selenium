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
                    new Key.Down("A")
                }
            }
            ]);

        await context.Input.PerformActionsAsync([new SourceActions.Keys
        {
            new Key.Down("A"),
            new Key.Down("B"),
            new Key.Pause()
        }]);

        await context.Input.PerformActionsAsync([new SourceActions.Pointers
        {
            new Pointer.Down(0),
            new Pointer.Up(0),
        }]);
    }
}
