using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Script;

class ScriptEventsTest : BiDiTestFixture
{
    [Test]
    public async Task CanListenToChannelMessage()
    {
        TaskCompletionSource<MessageEventArgs> tcs = new();

        await bidi.Script.OnMessageAsync(tcs.SetResult);

        await context.Script.CallFunctionAsync("(channel) => channel('foo')", false, new()
        {
            Arguments = [new LocalValue.Channel(new(new("channel_name")))]
        });

        var message = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(message, Is.Not.Null);
        Assert.That(message.Channel.Id, Is.EqualTo("channel_name"));
        Assert.That((string)message.Data, Is.EqualTo("foo"));
        Assert.That(message.Source, Is.Not.Null);
        Assert.That(message.Source.Realm, Is.Not.Null);
        Assert.That(message.Source.Context, Is.EqualTo(context));
    }

    [Test]
    public async Task CanListenToRealmCreatedEvent()
    {
        TaskCompletionSource<RealmInfo> tcs = new();

        await bidi.Script.OnRealmCreatedAsync(tcs.SetResult);

        await bidi.BrowsingContext.CreateAsync(Modules.BrowsingContext.ContextType.Window);

        var realmInfo = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(realmInfo, Is.Not.Null);
        Assert.That(realmInfo, Is.AssignableFrom<RealmInfo.Window>());
        Assert.That(realmInfo.Realm, Is.Not.Null);
    }

    [Test]
    public async Task CanListenToRealmDestroyedEvent()
    {
        TaskCompletionSource<RealmDestroyedEventArgs> tcs = new();

        await bidi.Script.OnRealmDestroyedAsync(tcs.SetResult);

        var ctx = await bidi.BrowsingContext.CreateAsync(Modules.BrowsingContext.ContextType.Window);
        await ctx.CloseAsync();

        var args = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(args, Is.Not.Null);
        Assert.That(args.Realm, Is.Not.Null);
    }
}
