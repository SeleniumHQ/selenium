using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi;

[Parallelizable(ParallelScope.All)]
[FixtureLifeCycle(LifeCycle.InstancePerTestCase)]
public class BiDiTestFixture
{
    protected IWebDriver driver;
    protected BiDi bidi;
    protected Modules.BrowsingContext.BrowsingContext context;

    protected UrlBuilder UrlBuilder { get; } = EnvironmentManager.Instance.UrlBuilder;

    [SetUp]
    public async Task BiDiSetUp()
    {
        var options = new BiDiEnabledDriverOptions()
        {
            UseWebSocketUrl = true,
            UnhandledPromptBehavior = UnhandledPromptBehavior.Ignore,
        };

        driver = EnvironmentManager.Instance.CreateDriverInstance(options);

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

        driver?.Dispose();
    }

    public class BiDiEnabledDriverOptions : DriverOptions
    {
        public override void AddAdditionalOption(string capabilityName, object capabilityValue)
        {
        }

        public override ICapabilities ToCapabilities()
        {
            return null;
        }
    }
}
