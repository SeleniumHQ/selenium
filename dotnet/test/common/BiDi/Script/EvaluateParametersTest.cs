using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.Script;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Script;

class EvaluateParametersTest : BiDiTestFixture
{
    [Test]
    public async Task CanEvaluateScript()
    {
        var res = await context.Script.EvaluateAsync("1 + 2", false);

        Assert.That(res, Is.Not.Null);
        Assert.That(res.Realm, Is.Not.Null);
        Assert.That((res.Result as RemoteValue.Number).Value, Is.EqualTo(3));
    }

    [Test]
    public async Task CanEvaluateScriptImplicitCast()
    {
        var res = await context.Script.EvaluateAsync<int>("1 + 2", false);

        Assert.That(res, Is.EqualTo(3));
    }

    [Test]
    public async Task СanEvaluateScriptWithUserActivationTrue()
    {
        await context.Script.EvaluateAsync("window.open();", true, new() { UserActivation = true });

        var res = await context.Script.EvaluateAsync<bool>("""
            navigator.userActivation.isActive && navigator.userActivation.hasBeenActive
            """, true, new() { UserActivation = true });

        Assert.That(res, Is.True);
    }

    [Test]
    public async Task СanEvaluateScriptWithUserActivationFalse()
    {
        await context.Script.EvaluateAsync("window.open();", true, new() { UserActivation = true });

        var res = await context.Script.EvaluateAsync<bool>("""
            navigator.userActivation.isActive && navigator.userActivation.hasBeenActive
            """, true, new() { UserActivation = false });

        Assert.That(res, Is.False);
    }

    [Test]
    public void CanCallFunctionThatThrowsException()
    {
        var action = () => context.Script.EvaluateAsync("))) !!@@## some invalid JS script (((", false);

        Assert.That(action, Throws.InstanceOf<ScriptEvaluateException>().And.Message.Contain("SyntaxError:"));
    }

    [Test]
    public async Task CanEvaluateScriptWithResulWithOwnership()
    {
        var res = await context.Script.EvaluateAsync("Promise.resolve({a:1})", true, new()
        {
            ResultOwnership = ResultOwnership.Root
        });

        Assert.That(res, Is.Not.Null);
        Assert.That((res.Result as RemoteValue.Object).Handle, Is.Not.Null);
        Assert.That((string)(res.Result as RemoteValue.Object).Value[0][0], Is.EqualTo("a"));
        Assert.That((int)(res.Result as RemoteValue.Object).Value[0][1], Is.EqualTo(1));
    }

    [Test]
    public async Task CanEvaluateInASandBox()
    {
        // Make changes without sandbox
        await context.Script.EvaluateAsync("window.foo = 1", true);

        var res = await context.Script.EvaluateAsync("window.foo", true, targetOptions: new() { Sandbox = "sandbox" });

        Assert.That(res.Result, Is.AssignableFrom<RemoteValue.Undefined>());

        // Make changes in the sandbox
        await context.Script.EvaluateAsync("window.foo = 2", true, targetOptions: new() { Sandbox = "sandbox" });

        // Check if the changes are present in the sandbox
        res = await context.Script.EvaluateAsync("window.foo", true, targetOptions: new() { Sandbox = "sandbox" });

        Assert.That(res.Result, Is.AssignableFrom<RemoteValue.Number>());
        Assert.That((res.Result as RemoteValue.Number).Value, Is.EqualTo(2));
    }

    [Test]
    public async Task CanEvaluateInARealm()
    {
        await bidi.BrowsingContext.CreateAsync(Modules.BrowsingContext.ContextType.Tab);

        var realms = await bidi.Script.GetRealmsAsync();

        await bidi.Script.EvaluateAsync("window.foo = 3", true, new Target.Realm(realms[0].Realm));
        await bidi.Script.EvaluateAsync("window.foo = 5", true, new Target.Realm(realms[1].Realm));

        var res1 = await bidi.Script.EvaluateAsync<int>("window.foo", true, new Target.Realm(realms[0].Realm));
        var res2 = await bidi.Script.EvaluateAsync<int>("window.foo", true, new Target.Realm(realms[1].Realm));

        Assert.That(res1, Is.EqualTo(3));
        Assert.That(res2, Is.EqualTo(5));
    }
}
