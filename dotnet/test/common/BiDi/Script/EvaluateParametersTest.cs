// <copyright file="EvaluateParametersTest.cs" company="Selenium Committers">
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

class EvaluateParametersTest : BiDiTestFixture
{
    [Test]
    public async Task CanEvaluateScript()
    {
        var res = await context.Script.EvaluateAsync("1 + 2", false);

        Assert.That(res, Is.Not.Null);
        Assert.That(((EvaluateResultSuccess)res).Realm, Is.Not.Null);
        Assert.That((res.AsSuccessResult() as NumberRemoteValue).Value, Is.EqualTo(3));
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
        await context.Script.EvaluateAsync("window.open();", true);

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
    public async Task CanCallFunctionThatThrowsException()
    {
        var errorResult = await context.Script.EvaluateAsync("))) !!@@## some invalid JS script (((", false);

        Assert.That(errorResult, Is.TypeOf<EvaluateResultException>());
        Assert.That(((EvaluateResultException)errorResult).ExceptionDetails.Text, Does.Contain("SyntaxError:"));
    }

    [Test]
    public async Task CanEvaluateScriptWithResulWithOwnership()
    {
        var res = await context.Script.EvaluateAsync("Promise.resolve({a:1})", true, new()
        {
            ResultOwnership = ResultOwnership.Root
        });

        Assert.That(res, Is.Not.Null);
        Assert.That((res.AsSuccessResult() as ObjectRemoteValue).Handle, Is.Not.Null);
        Assert.That((string)(res.AsSuccessResult() as ObjectRemoteValue).Value[0][0], Is.EqualTo("a"));
        Assert.That((int)(res.AsSuccessResult() as ObjectRemoteValue).Value[0][1], Is.EqualTo(1));
    }

    [Test]
    public async Task CanEvaluateInASandBox()
    {
        // Make changes without sandbox
        await context.Script.EvaluateAsync("window.foo = 1", true);

        var res = await context.Script.EvaluateAsync("window.foo", true, targetOptions: new() { Sandbox = "sandbox" });

        Assert.That(res.AsSuccessResult(), Is.AssignableFrom<UndefinedRemoteValue>());

        // Make changes in the sandbox
        await context.Script.EvaluateAsync("window.foo = 2", true, targetOptions: new() { Sandbox = "sandbox" });

        // Check if the changes are present in the sandbox
        res = await context.Script.EvaluateAsync("window.foo", true, targetOptions: new() { Sandbox = "sandbox" });

        Assert.That(res.AsSuccessResult(), Is.AssignableFrom<NumberRemoteValue>());
        Assert.That((res.AsSuccessResult() as NumberRemoteValue).Value, Is.EqualTo(2));
    }

    [Test]
    public async Task CanEvaluateInARealm()
    {
        await bidi.BrowsingContext.CreateAsync(BrowsingContext.ContextType.Tab);

        var realms = await bidi.Script.GetRealmsAsync();

        await bidi.Script.EvaluateAsync("window.foo = 3", true, new RealmTarget(realms[0].Realm));
        await bidi.Script.EvaluateAsync("window.foo = 5", true, new RealmTarget(realms[1].Realm));

        var res1 = await bidi.Script.EvaluateAsync<int>("window.foo", true, new RealmTarget(realms[0].Realm));
        var res2 = await bidi.Script.EvaluateAsync<int>("window.foo", true, new RealmTarget(realms[1].Realm));

        Assert.That(res1, Is.EqualTo(3));
        Assert.That(res2, Is.EqualTo(5));
    }
}
