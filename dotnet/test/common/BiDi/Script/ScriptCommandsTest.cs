using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Script;

class ScriptCommandsTest : BiDiTestFixture
{
    [Test]
    public async Task CanGetAllRealms()
    {
        _ = await bidi.BrowsingContext.CreateAsync(Modules.BrowsingContext.ContextType.Window);

        var realms = await bidi.Script.GetRealmsAsync();

        Assert.That(realms, Is.Not.Null);
        Assert.That(realms.Count, Is.EqualTo(2));

        Assert.That(realms[0], Is.AssignableFrom<RealmInfo.Window>());
        Assert.That(realms[0].Realm, Is.Not.Null);

        Assert.That(realms[1], Is.AssignableFrom<RealmInfo.Window>());
        Assert.That(realms[1].Realm, Is.Not.Null);
    }

    [Test]
    public async Task CanGetAllRealmsByType()
    {
        _ = await bidi.BrowsingContext.CreateAsync(Modules.BrowsingContext.ContextType.Window);

        var realms = await bidi.Script.GetRealmsAsync(new() { Type = RealmType.Window });

        Assert.That(realms, Is.Not.Null);
        Assert.That(realms.Count, Is.EqualTo(2));

        Assert.That(realms[0], Is.AssignableFrom<RealmInfo.Window>());
        Assert.That(realms[0].Realm, Is.Not.Null);

        Assert.That(realms[1], Is.AssignableFrom<RealmInfo.Window>());
        Assert.That(realms[1].Realm, Is.Not.Null);
    }

    [Test]
    public async Task CanGetRealmInBrowsingContext()
    {
        var tab = await bidi.BrowsingContext.CreateAsync(Modules.BrowsingContext.ContextType.Tab);

        var realms = await tab.Script.GetRealmsAsync();

        var tabRealm = realms[0] as RealmInfo.Window;

        Assert.That(tabRealm, Is.Not.Null);
        Assert.That(tabRealm.Context, Is.EqualTo(tab));
    }

    [Test]
    public async Task CanGetRealmInBrowsingContextByType()
    {
        var tab = await bidi.BrowsingContext.CreateAsync(Modules.BrowsingContext.ContextType.Tab);

        var realms = await tab.Script.GetRealmsAsync(new() { Type = RealmType.Window });

        var tabRealm = realms[0] as RealmInfo.Window;

        Assert.That(tabRealm, Is.Not.Null);
        Assert.That(tabRealm.Context, Is.EqualTo(tab));
    }

    [Test]
    public async Task CanAddPreloadScript()
    {
        var preloadScript = await bidi.Script.AddPreloadScriptAsync("() => { console.log('preload_script_console_text') }");

        Assert.That(preloadScript, Is.Not.Null);

        TaskCompletionSource<Modules.Log.Entry> tcs = new();

        await context.Log.OnEntryAddedAsync(tcs.SetResult);

        await context.ReloadAsync(new() { Wait = Modules.BrowsingContext.ReadinessState.Interactive });

        var entry = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(entry.Level, Is.EqualTo(Modules.Log.Level.Info));
        Assert.That(entry.Text, Is.EqualTo("preload_script_console_text"));
    }

    [Test]
    public async Task CanAddPreloadScriptWithArguments()
    {
        var preloadScript = await bidi.Script.AddPreloadScriptAsync("(channel) => channel('will_be_send', 'will_be_ignored')", new()
        {
            Arguments = [new LocalValue.Channel(new(new("channel_name")))]
        });

        Assert.That(preloadScript, Is.Not.Null);
    }


    [Test]
    public async Task CanAddPreloadScriptWithChannelOptions()
    {
        var preloadScript = await bidi.Script.AddPreloadScriptAsync("(channel) => channel('will_be_send', 'will_be_ignored')", new()
        {
            Arguments = [new LocalValue.Channel(new(new("channel_name"))
            {
                SerializationOptions = new()
                {
                    MaxDomDepth = 0
                },
                Ownership = ResultOwnership.Root
            })]
        });

        Assert.That(preloadScript, Is.Not.Null);
    }

    [Test]
    public async Task CanAddPreloadScriptInASandbox()
    {
        var preloadScript = await bidi.Script.AddPreloadScriptAsync("() => { window.bar = 2; }", new() { Sandbox = "sandbox" });

        Assert.That(preloadScript, Is.Not.Null);

        await context.ReloadAsync(new() { Wait = Modules.BrowsingContext.ReadinessState.Interactive });

        var bar = await context.Script.EvaluateAsync<int>("window.bar", true, targetOptions: new() { Sandbox = "sandbox" });

        Assert.That(bar, Is.EqualTo(2));
    }

    [Test]
    public async Task CanRemovePreloadedScript()
    {
        var preloadScript = await context.Script.AddPreloadScriptAsync("() => { window.bar = 2; }");

        await context.ReloadAsync(new() { Wait = Modules.BrowsingContext.ReadinessState.Interactive });

        var bar = await context.Script.EvaluateAsync<int>("window.bar", true);

        Assert.That(bar, Is.EqualTo(2));

        await preloadScript.RemoveAsync();

        var resultAfterRemoval = await context.Script.EvaluateAsync("window.bar", true, targetOptions: new() { Sandbox = "sandbox" });

        Assert.That(resultAfterRemoval.Result, Is.AssignableFrom<RemoteValue.Undefined>());
    }
}
