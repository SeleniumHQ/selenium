using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using OpenQA.Selenium.Environment;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi;

class BiDiFixture : DriverTestFixture
{
    protected BiDi bidi;
    protected BrowsingContext context;

    protected UrlBuilder UrlBuilder { get; } = EnvironmentManager.Instance.UrlBuilder;

    [SetUp]
    public async Task BiDiSetUp()
    {
        context = await driver.AsBiDiContextAsync();
        bidi = context.BiDi;
    }

    [TearDown]
    public async Task BiDiTearDown()
    {
        if (bidi is not null)
        {
            await bidi.DisposeAsync();
        }
    }
}
