using NUnit.Framework;
using System.Linq;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Modules;

class BrowserTest : BiDiFixture
{
    [Test, NeedsFreshDriver(IsCreatedAfterTest = true)]
    public async Task CanCreateUserContext()
    {
        var userContext = await bidi.Browser.CreateUserContextAsync();

        Assert.That(userContext, Is.Not.Null);
    }

    [Test, NeedsFreshDriver(IsCreatedAfterTest = true)]
    public async Task CanGetUserContexts()
    {
        var userContext1 = await bidi.Browser.CreateUserContextAsync();
        var userContext2 = await bidi.Browser.CreateUserContextAsync();

        var userContexts = await bidi.Browser.GetUserContextsAsync();

        Assert.That(userContexts, Is.Not.Null);
        Assert.That(userContexts.Count, Is.GreaterThanOrEqualTo(2));
        Assert.That(userContexts, Does.Contain(userContext1));
        Assert.That(userContexts, Does.Contain(userContext2));
    }

    [Test, NeedsFreshDriver(IsCreatedAfterTest = true)]
    public async Task CanRemoveUserContext()
    {
        var userContext1 = await bidi.Browser.CreateUserContextAsync();
        var userContext2 = await bidi.Browser.CreateUserContextAsync();

        await userContext2.UserContext.RemoveAsync();

        var userContexts = await bidi.Browser.GetUserContextsAsync();

        Assert.That(userContexts, Does.Contain(userContext1));
        Assert.That(userContexts, Does.Not.Contain(userContext2));
    }
}
