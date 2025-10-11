using NUnit.Framework;
using OpenQA.Selenium.BiDi.BrowsingContext;
using OpenQA.Selenium.BiDi.Script;
using OpenQA.Selenium.Environment;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Extensions.Permissions;

internal class PermissionsTests : BiDiTestFixture
{
    [Test]
    public async Task SettingPermissionsTest()
    {
        var userContext = await bidi.Browser.CreateUserContextAsync();
        var window = (await bidi.BrowsingContext.CreateAsync(ContextType.Window, new()
        {
            ReferenceContext = context,
            UserContext = userContext.UserContext,
            Background = true
        })).Context;

        var newPage = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
            .WithBody("<div>new page</div>"));

        await window.NavigateAsync(newPage);

        var before = await window.Script.CallFunctionAsync("""
            async () => (await navigator.permissions.query({ name: "geolocation" })).state
            """, awaitPromise: true, new() { UserActivation = true, });

        Assert.That(before.AsSuccessResult(), Is.EqualTo(new StringRemoteValue("prompt")));

        var permissions = bidi.AsPermissions();
        await permissions.SetPermissionAsync("geolocation", PermissionState.Denied, newPage, userContext.UserContext);

        var after = await window.Script.CallFunctionAsync("""
            async () => (await navigator.permissions.query({ name: "geolocation" })).state
            """, awaitPromise: true, new() { UserActivation = true });

        Assert.That(after.AsSuccessResult(), Is.EqualTo(new StringRemoteValue("denied")));
    }
}
