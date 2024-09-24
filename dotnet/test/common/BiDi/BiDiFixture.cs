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

    [OneTimeSetUp]
    public async Task BiDiSetUp()
    {
        context = await driver.AsBiDiContextAsync();
        bidi = context.BiDi;
    }
}
