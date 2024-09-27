using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.Input;
using System.Threading.Tasks;

using Key = OpenQA.Selenium.BiDi.Modules.Input.SourceActions.Keys.Key;

namespace OpenQA.Selenium.BiDi.Input;

class DefaultMouseTest : BiDiFixture
{
    [Test]
    public async Task PerformDragAndDropWithMouse()
    {
        driver.Url = UrlBuilder.WhereIs("draggableLists.html");

        await context.Input.PerformActionsAsync([
            new SourceActions.Keys()
            {
                Actions =
                {
                    new Key.Down("A")
                }
            }
            ]);
    }
}
