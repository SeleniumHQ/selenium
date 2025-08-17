// <copyright file="CallFunctionParameterTest.cs" company="Selenium Committers">
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
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Script;

class CallFunctionParameterTest : BiDiTestFixture
{
    [Test]
    public async Task CanCallFunctionWithDeclaration()
    {
        var res = await context.Script.CallFunctionAsync("() => { return 1 + 2; }", false);

        Assert.That(res, Is.Not.Null);
        Assert.That(((EvaluateResultSuccess)res).Realm, Is.Not.Null);
        Assert.That((res.AsSuccessResult() as NumberRemoteValue).Value, Is.EqualTo(3));
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
        await context.Script.EvaluateAsync("window.open();", true);

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

        Assert.That(res.AsSuccessResult(), Is.AssignableFrom<ArrayRemoteValue>());
        Assert.That((string)(res.AsSuccessResult() as ArrayRemoteValue).Value[0], Is.EqualTo("abc"));
        Assert.That((int)(res.AsSuccessResult() as ArrayRemoteValue).Value[1], Is.EqualTo(42));
    }

    [Test]
    public async Task CanCallFunctionToGetIFrameBrowsingContext()
    {
        driver.Url = UrlBuilder.WhereIs("click_too_big_in_frame.html");

        var res = await context.Script.CallFunctionAsync("""
            () => document.querySelector('iframe[id="iframe1"]').contentWindow
            """, false);

        Assert.That(res, Is.Not.Null);
        Assert.That(res.AsSuccessResult(), Is.AssignableFrom<WindowProxyRemoteValue>());
        Assert.That((res.AsSuccessResult() as WindowProxyRemoteValue).Value, Is.Not.Null);
    }

    [Test]
    public async Task CanCallFunctionToGetElement()
    {
        driver.Url = UrlBuilder.WhereIs("bidi/logEntryAdded.html");

        var res = await context.Script.CallFunctionAsync("""
            () => document.getElementById("consoleLog")
            """, false);

        Assert.That(res, Is.Not.Null);
        Assert.That(res.AsSuccessResult(), Is.AssignableFrom<NodeRemoteValue>());
        Assert.That((res.AsSuccessResult() as NodeRemoteValue).Value, Is.Not.Null);
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
        Assert.That(res.AsSuccessResult(), Is.AssignableFrom<PromiseRemoteValue>());
    }

    [Test]
    public async Task CanCallFunctionWithThisParameter()
    {
        var thisParameter = new ObjectLocalValue([["some_property", 42]]);

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
        Assert.That((res.AsSuccessResult() as ObjectRemoteValue).Handle, Is.Not.Null);
        Assert.That((string)(res.AsSuccessResult() as ObjectRemoteValue).Value[0][0], Is.EqualTo("a"));
        Assert.That((int)(res.AsSuccessResult() as ObjectRemoteValue).Value[0][1], Is.EqualTo(1));
    }

    [Test]
    public async Task CanCallFunctionWithOwnershipNone()
    {
        var res = await context.Script.CallFunctionAsync("async function(){return {a:1}}", true, new()
        {
            ResultOwnership = ResultOwnership.None
        });

        Assert.That(res, Is.Not.Null);
        Assert.That((res.AsSuccessResult() as ObjectRemoteValue).Handle, Is.Null);
        Assert.That((string)(res.AsSuccessResult() as ObjectRemoteValue).Value[0][0], Is.EqualTo("a"));
        Assert.That((int)(res.AsSuccessResult() as ObjectRemoteValue).Value[0][1], Is.EqualTo(1));
    }

    [Test]
    public async Task CanCallFunctionThatThrowsExceptionAsync()
    {
        var action = await context.Script.CallFunctionAsync("))) !!@@## some invalid JS script (((", false);

        Assert.That(action, Is.TypeOf<EvaluateResultException>());
        Assert.That(((EvaluateResultException)action).ExceptionDetails.Text, Does.Contain("SyntaxError:"));
    }

    [Test]
    public async Task CanCallFunctionInASandBox()
    {
        // Make changes without sandbox
        await context.Script.CallFunctionAsync("() => { window.foo = 1; }", true);

        var res = await context.Script.CallFunctionAsync("() => window.foo", true, targetOptions: new() { Sandbox = "sandbox" });

        Assert.That(res.AsSuccessResult(), Is.AssignableFrom<UndefinedRemoteValue>());

        // Make changes in the sandbox
        await context.Script.CallFunctionAsync("() => { window.foo = 2; }", true, targetOptions: new() { Sandbox = "sandbox" });

        // Check if the changes are present in the sandbox
        res = await context.Script.CallFunctionAsync("() => window.foo", true, targetOptions: new() { Sandbox = "sandbox" });

        Assert.That(res.AsSuccessResult(), Is.AssignableFrom<NumberRemoteValue>());
        Assert.That((res.AsSuccessResult() as NumberRemoteValue).Value, Is.EqualTo(2));
    }

    [Test]
    public async Task CanCallFunctionInARealm()
    {
        await bidi.BrowsingContext.CreateAsync(BrowsingContext.ContextType.Tab);

        var realms = await bidi.Script.GetRealmsAsync();

        await bidi.Script.CallFunctionAsync("() => { window.foo = 3; }", true, new RealmTarget(realms[0].Realm));
        await bidi.Script.CallFunctionAsync("() => { window.foo = 5; }", true, new RealmTarget(realms[1].Realm));

        var res1 = await bidi.Script.CallFunctionAsync<int>("() => window.foo", true, new RealmTarget(realms[0].Realm));
        var res2 = await bidi.Script.CallFunctionAsync<int>("() => window.foo", true, new RealmTarget(realms[1].Realm));

        Assert.That(res1, Is.EqualTo(3));
        Assert.That(res2, Is.EqualTo(5));
    }
}
