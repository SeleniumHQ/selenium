// <copyright file="SessionTests.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi;
using OpenQA.Selenium.BiDi.Log;
using OpenQA.Selenium.BiDi.Network;

namespace OpenQA.Selenium.Tests.BiDi.Session;

internal class SessionTests : BiDiTestFixture
{
    [Test]
    public async Task ShouldHaveIdempotentDisposal()
    {
        await bidi.DisposeAsync();
        await bidi.DisposeAsync();
    }

    [Test]
    public async Task CanGetStatus()
    {
        var status = await bidi.StatusAsync();

        Assert.That(status, Is.Not.Null);
        Assert.That(status.Message, Is.Not.Empty);
    }

    [Test]
    public void ShouldRespectTimeout()
    {
        Assert.That(
            () => bidi.StatusAsync(new() { Timeout = TimeSpan.FromMicroseconds(1) }),
            Throws.InstanceOf<TaskCanceledException>());
    }

    [Test]
    public void ShouldRespectCancellationToken()
    {
        using var cts = new CancellationTokenSource(TimeSpan.FromMicroseconds(1));

        Assert.That(
            () => bidi.StatusAsync(cancellationToken: cts.Token),
            Throws.InstanceOf<TaskCanceledException>());
    }

    [Test]
    public void AsModuleShouldReturnSameInstanceForSameType()
    {
        Assert.That(bidi.AsModule<CustomModule>(), Is.SameAs(bidi.AsModule<CustomModule>()));
    }

    [Test]
    public async Task CanSubscribeToEvent()
    {
        EntryAddedEventArgs log = null;

        var listener = await bidi.SubscribeAsync(LogEvent.EntryAdded, e =>
        {
            log = e;
        });

        await context.Script.EvaluateAsync("console.log('hello event');", true);

        await listener.DisposeAsync();

        Assert.That(log.Text, Is.EqualTo("hello event"));
    }

    [Test]
    public async Task CanSubscribeToMultipleEvents()
    {
        ResponseStartedEventArgs e1 = null;
        ResponseCompletedEventArgs e2 = null;

        var listener = await bidi.SubscribeAsync([NetworkEvent.ResponseStarted, NetworkEvent.ResponseCompleted], (Selenium.BiDi.EventArgs e) =>
        {
            switch (e)
            {
                case ResponseStartedEventArgs started: e1 = started; break;
                case ResponseCompletedEventArgs completed: e2 = completed; break;
            }
        });

        await context.NavigateAsync(UrlBuilder.WhereIs("blank.html"), new() { Wait = Selenium.BiDi.BrowsingContext.ReadinessState.Complete });

        await listener.DisposeAsync();

        Assert.That(e1, Is.Not.Null);
        Assert.That(e2, Is.Not.Null);
    }

    [Test]
    public async Task CanConsumeAsyncEventStream()
    {
        await using var sub = await bidi.Log.EntryAdded.ReadAllAsync();

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        var enumerator = sub.GetAsyncEnumerator(cts.Token);

        await context.Script.EvaluateAsync("console.log('hello stream');", true);

        Assert.That(await enumerator.MoveNextAsync(), Is.True);
        Assert.That(enumerator.Current.Text, Is.EqualTo("hello stream"));
    }

    [Test]
    public async Task CanConsumeAsyncEventStreamViaLinq()
    {
        await using var sub = await bidi.Log.EntryAdded.ReadAllAsync();

        await context.Script.EvaluateAsync("console.log('hello stream');", true);

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        var log = await sub.FirstAsync(cts.Token);

        Assert.That(log.Text, Is.EqualTo("hello stream"));
    }

    [Test]
    public async Task CustomModuleShouldExecuteCommand()
    {
        var customModule = bidi.AsModule<CustomModule>();

        var result = await customModule.DoSomethingAsync();

        Assert.That(result, Is.Not.Null);
    }

    [Test]
    public async Task CustomModuleShouldSubscribeToEvent()
    {
        var customModule = bidi.AsModule<CustomModule>();

        SomethingHappenedEventArgs happened = null;

        var listener = await customModule.SomethingHappened.SubscribeAsync(e =>
        {
            happened = e;
        });

        await context.Script.EvaluateAsync("console.log('custom event');", true);

        await listener.DisposeAsync();

        Assert.That(happened, Is.Not.Null);
        Assert.That(happened.Text, Is.EqualTo("custom event"));
    }
}

class CustomModule : Module
{
    private static readonly CustomModuleJsonSerializerContext JsonContext = CustomModuleJsonSerializerContext.Default;

    private static readonly Command<Parameters, DoSomethingResult> DoSomethingCommand =
        new("session.status", JsonContext.Parameters, JsonContext.DoSomethingResult);

    private static readonly EventDescriptor<SomethingHappenedEventArgs> SomethingHappenedDescriptor =
        EventDescriptor<SomethingHappenedEventArgs>.Create<SomethingHappenedParameters>(
            "log.entryAdded",
            static (bidi, p) => new SomethingHappenedEventArgs(bidi, p.Text),
            JsonContext.SomethingHappenedParameters);

    public EventSource<SomethingHappenedEventArgs> SomethingHappened => CreateEventSource(SomethingHappenedDescriptor);

    public async Task<DoSomethingResult> DoSomethingAsync(DoSomethingOptions options = null)
    {
        return await ExecuteAsync(DoSomethingCommand, Parameters.Empty, options, CancellationToken.None);
    }
}

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
[JsonSerializable(typeof(Parameters))]
[JsonSerializable(typeof(DoSomethingResult))]
[JsonSerializable(typeof(SomethingHappenedParameters))]
partial class CustomModuleJsonSerializerContext : JsonSerializerContext;

record DoSomethingResult : EmptyResult;

record DoSomethingOptions : CommandOptions;

record SomethingHappenedParameters(string Text);

record SomethingHappenedEventArgs(IBiDi BiDi, string Text) : Selenium.BiDi.EventArgs(BiDi);
