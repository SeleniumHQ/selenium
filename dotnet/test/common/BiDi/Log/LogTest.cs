using NUnit.Framework;
using OpenQA.Selenium.BiDi.Modules.Log;
using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Log;

class LogTest : BiDiTestFixture
{
    [Test]
    public async Task CanListenToConsoleLog()
    {
        TaskCompletionSource<Entry> tcs = new();

        await using var subscription = await context.Log.OnEntryAddedAsync(tcs.SetResult);

        driver.Url = UrlBuilder.WhereIs("bidi/logEntryAdded.html");
        driver.FindElement(By.Id("consoleLog")).Click();

        var logEntry = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(logEntry, Is.Not.Null);
        Assert.That(logEntry.Source, Is.Not.Null);
        Assert.That(logEntry.Source.Context, Is.EqualTo(context));
        Assert.That(logEntry.Source.Realm, Is.Not.Null);
        Assert.That(logEntry.Text, Is.EqualTo("Hello, world!"));
        Assert.That(logEntry.Level, Is.EqualTo(Level.Info));
        Assert.That(logEntry, Is.AssignableFrom<Entry.Console>());

        var consoleLogEntry = logEntry as Entry.Console;

        Assert.That(consoleLogEntry.Method, Is.EqualTo("log"));

        Assert.That(consoleLogEntry.Args, Is.Not.Null);
        Assert.That(consoleLogEntry.Args, Has.Count.EqualTo(1));
        Assert.That(consoleLogEntry.Args[0], Is.AssignableFrom<Modules.Script.RemoteValue.String>());
    }

    [Test]
    public async Task CanListenToJavascriptLog()
    {
        TaskCompletionSource<Entry> tcs = new();

        await using var subscription = await context.Log.OnEntryAddedAsync(tcs.SetResult);

        driver.Url = UrlBuilder.WhereIs("bidi/logEntryAdded.html");
        driver.FindElement(By.Id("jsException")).Click();

        var logEntry = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(logEntry, Is.Not.Null);
        Assert.That(logEntry.Source, Is.Not.Null);
        Assert.That(logEntry.Source.Context, Is.EqualTo(context));
        Assert.That(logEntry.Source.Realm, Is.Not.Null);
        Assert.That(logEntry.Text, Is.EqualTo("Error: Not working"));
        Assert.That(logEntry.Level, Is.EqualTo(Level.Error));
        Assert.That(logEntry, Is.AssignableFrom<Entry.Javascript>());
    }

    [Test]
    public async Task CanRetrieveStacktrace()
    {
        TaskCompletionSource<Entry> tcs = new();

        await using var subscription = await bidi.Log.OnEntryAddedAsync(tcs.SetResult);

        driver.Url = UrlBuilder.WhereIs("bidi/logEntryAdded.html");
        driver.FindElement(By.Id("logWithStacktrace")).Click();

        var logEntry = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(logEntry, Is.Not.Null);
        Assert.That(logEntry.StackTrace, Is.Not.Null);
    }
}
