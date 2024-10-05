using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.Script;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Script;

class CallFunctionParameterTest : BiDiTestFixture
{
    [Test]
    public async Task CanCallFunctionWithDeclaration()
    {
        var res = await context.Script.CallFunctionAsync("() => { return 1 + 2; }", false);

        Assert.That(res, Is.Not.Null);
        Assert.That(res.Realm, Is.Not.Null);
        Assert.That((res.Result as RemoteValue.Number).Value, Is.EqualTo(3));
    }

    [Test]
    public async Task CanCallFunctionWithDeclarationImplicitCast()
    {
        var res = await context.Script.CallFunctionAsync<int>("() => { return 1 + 2; }", false);

        Assert.That(res, Is.EqualTo(3));
    }

    [Test]
    public async Task CanEvaluateScriptWithUserActivationTrue()
    {
        await context.Script.EvaluateAsync("window.open();", true, new() { UserActivation = true });

        var res = await context.Script.CallFunctionAsync<bool>("""
            () => navigator.userActivation.isActive && navigator.userActivation.hasBeenActive
            """, true, new() { UserActivation = true });

        Assert.That(res, Is.True);
    }

    [Test]
    public async Task CanEvaluateScriptWithUserActivationFalse()
    {
        await context.Script.EvaluateAsync("window.open();", true);

        var res = await context.Script.CallFunctionAsync<bool>("""
            () => navigator.userActivation.isActive && navigator.userActivation.hasBeenActive
            """, true);

        Assert.That(res, Is.False);
    }

    [Test]
    public async Task CanCallFunctionWithArguments()
    {
        var res = await context.Script.CallFunctionAsync("(...args)=>{return args}", false, new()
        {
            Arguments = ["abc", 42]
        });

        Assert.That(res.Result, Is.AssignableFrom<RemoteValue.Array>());
        Assert.That((string)(res.Result as RemoteValue.Array).Value[0], Is.EqualTo("abc"));
        Assert.That((int)(res.Result as RemoteValue.Array).Value[1], Is.EqualTo(42));
    }

    [Test]
    public async Task CanCallFunctionToGetIFrameBrowsingContext()
    {
        driver.Url = UrlBuilder.WhereIs("click_too_big_in_frame.html");

        var res = await context.Script.CallFunctionAsync("""
            () => document.querySelector('iframe[id="iframe1"]').contentWindow
            """, false);

        Assert.That(res, Is.Not.Null);
        Assert.That(res.Result, Is.AssignableFrom<RemoteValue.WindowProxy>());
        Assert.That((res.Result as RemoteValue.WindowProxy).Value, Is.Not.Null);
    }

    [Test]
    public async Task CanCallFunctionToGetElement()
    {
        driver.Url = UrlBuilder.WhereIs("bidi/logEntryAdded.html");

        var res = await context.Script.CallFunctionAsync("""
            () => document.getElementById("consoleLog")
            """, false);

        Assert.That(res, Is.Not.Null);
        Assert.That(res.Result, Is.AssignableFrom<RemoteValue.Node>());
        Assert.That((res.Result as RemoteValue.Node).Value, Is.Not.Null);
    }

    [Test]
    public async Task CanCallFunctionWithAwaitPromise()
    {
        var res = await context.Script.CallFunctionAsync<string>("""
            async function() {
                await new Promise(r => setTimeout(() => r(), 0));
                return "SOME_DELAYED_RESULT";
            }
            """, awaitPromise: true);

        Assert.That(res, Is.EqualTo("SOME_DELAYED_RESULT"));
    }

    [Test]
    public async Task CanCallFunctionWithAwaitPromiseFalse()
    {
        var res = await context.Script.CallFunctionAsync("""
            async function() {
                await new Promise(r => setTimeout(() => r(), 0));
                return "SOME_DELAYED_RESULT";
            }
            """, awaitPromise: false);

        Assert.That(res, Is.Not.Null);
        Assert.That(res.Result, Is.AssignableFrom<RemoteValue.Promise>());
    }

    [Test]
    public async Task CanCallFunctionWithThisParameter()
    {
        var thisParameter = new LocalValue.Object([["some_property", 42]]);

        var res = await context.Script.CallFunctionAsync<int>("""
            function(){return this.some_property}
            """, false, new() { This = thisParameter });

        Assert.That(res, Is.EqualTo(42));
    }

    [Test]
    public async Task CanCallFunctionWithOwnershipRoot()
    {
        var res = await context.Script.CallFunctionAsync("async function(){return {a:1}}", true, new()
        {
            ResultOwnership = ResultOwnership.Root
        });

        Assert.That(res, Is.Not.Null);
        Assert.That((res.Result as RemoteValue.Object).Handle, Is.Not.Null);
        Assert.That((string)(res.Result as RemoteValue.Object).Value[0][0], Is.EqualTo("a"));
        Assert.That((int)(res.Result as RemoteValue.Object).Value[0][1], Is.EqualTo(1));
    }

    [Test]
    public async Task CanCallFunctionWithOwnershipNone()
    {
        var res = await context.Script.CallFunctionAsync("async function(){return {a:1}}", true, new()
        {
            ResultOwnership = ResultOwnership.None
        });

        Assert.That(res, Is.Not.Null);
        Assert.That((res.Result as RemoteValue.Object).Handle, Is.Null);
        Assert.That((string)(res.Result as RemoteValue.Object).Value[0][0], Is.EqualTo("a"));
        Assert.That((int)(res.Result as RemoteValue.Object).Value[0][1], Is.EqualTo(1));
    }

    [Test]
    public void CanCallFunctionThatThrowsException()
    {
        var action = () => context.Script.CallFunctionAsync("))) !!@@## some invalid JS script (((", false);

        Assert.That(action, Throws.InstanceOf<ScriptEvaluateException>().And.Message.Contain("SyntaxError:"));
    }

    [Test]
    public async Task CanCallFunctionInASandBox()
    {
        // Make changes without sandbox
        await context.Script.CallFunctionAsync("() => { window.foo = 1; }", true);

        var res = await context.Script.CallFunctionAsync("() => window.foo", true, targetOptions: new() { Sandbox = "sandbox" });

        Assert.That(res.Result, Is.AssignableFrom<RemoteValue.Undefined>());

        // Make changes in the sandbox
        await context.Script.CallFunctionAsync("() => { window.foo = 2; }", true, targetOptions: new() { Sandbox = "sandbox" });

        // Check if the changes are present in the sandbox
        res = await context.Script.CallFunctionAsync("() => window.foo", true, targetOptions: new() { Sandbox = "sandbox" });

        Assert.That(res.Result, Is.AssignableFrom<RemoteValue.Number>());
        Assert.That((res.Result as RemoteValue.Number).Value, Is.EqualTo(2));
    }

    [Test]
    public async Task CanCallFunctionInARealm()
    {
        await bidi.BrowsingContext.CreateAsync(Modules.BrowsingContext.ContextType.Tab);

        var realms = await bidi.Script.GetRealmsAsync();

        await bidi.Script.CallFunctionAsync("() => { window.foo = 3; }", true, new Target.Realm(realms[0].Realm));
        await bidi.Script.CallFunctionAsync("() => { window.foo = 5; }", true, new Target.Realm(realms[1].Realm));

        var res1 = await bidi.Script.CallFunctionAsync<int>("() => window.foo", true, new Target.Realm(realms[0].Realm));
        var res2 = await bidi.Script.CallFunctionAsync<int>("() => window.foo", true, new Target.Realm(realms[1].Realm));

        Assert.That(res1, Is.EqualTo(3));
        Assert.That(res2, Is.EqualTo(5));
    }
}
