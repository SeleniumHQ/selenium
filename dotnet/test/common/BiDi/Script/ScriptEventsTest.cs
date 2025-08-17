// <copyright file="ScriptEventsTest.cs" company="Selenium Committers">
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

using NUnit.Framework;
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
            Arguments = [new ChannelLocalValue(new(new("channel_name")))]
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

        await bidi.BrowsingContext.CreateAsync(BrowsingContext.ContextType.Window);

        var realmInfo = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(realmInfo, Is.Not.Null);
        Assert.That(realmInfo, Is.AssignableFrom<WindowRealmInfo>());
        Assert.That(realmInfo.Realm, Is.Not.Null);
    }

    [Test]
    public async Task CanListenToRealmDestroyedEvent()
    {
        TaskCompletionSource<RealmDestroyedEventArgs> tcs = new();

        await bidi.Script.OnRealmDestroyedAsync(tcs.SetResult);

        var ctx = await bidi.BrowsingContext.CreateAsync(BrowsingContext.ContextType.Window);
        await ctx.CloseAsync();

        var args = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(args, Is.Not.Null);
        Assert.That(args.Realm, Is.Not.Null);
    }
}
