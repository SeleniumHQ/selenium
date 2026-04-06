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

using System.Text.Json;
using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi;

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
    public async Task CustomModuleShouldExecuteCommand()
    {
        var customModule = bidi.AsModule<CustomModule>();

        var result = await customModule.DoSomethingAsync();

        Assert.That(result, Is.Not.Null);
    }
}

class CustomModule : Module
{
    private CustomModuleJsonSerializerContext _jsonContext = null!;

    public async Task<DoSomethingResult> DoSomethingAsync(DoSomethingOptions options = null)
    {
        return await ExecuteCommandAsync(new DoSomethingCommand(), options, _jsonContext.DoSomethingCommand, _jsonContext.DoSomethingResult, CancellationToken.None);
    }

    protected override void Initialize(IBiDi bidi, JsonSerializerOptions jsonSerializerOptions)
    {
        _jsonContext = new CustomModuleJsonSerializerContext(jsonSerializerOptions);
    }
}

[JsonSerializable(typeof(DoSomethingCommand))]
[JsonSerializable(typeof(DoSomethingResult))]
partial class CustomModuleJsonSerializerContext : JsonSerializerContext;

class DoSomethingCommand()
    : Command<Parameters, DoSomethingResult>(Parameters.Empty, "session.status");

record DoSomethingResult : EmptyResult;

record DoSomethingOptions : CommandOptions;
