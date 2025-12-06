// <copyright file="BrowserModule.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Json.Converters;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Browser;

public sealed class BrowserModule : Module
{
    private BrowserJsonSerializerContext _jsonContext = null!;

    public async Task<CloseResult> CloseAsync(CloseOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync(new CloseCommand(), options, _jsonContext.CloseCommand, _jsonContext.CloseResult).ConfigureAwait(false);
    }

    public async Task<CreateUserContextResult> CreateUserContextAsync(CreateUserContextOptions? options = null)
    {
        var @params = new CreateUserContextParameters(options?.AcceptInsecureCerts, options?.Proxy, options?.UnhandledPromptBehavior);

        return await Broker.ExecuteCommandAsync(new CreateUserContextCommand(@params), options, _jsonContext.CreateUserContextCommand, _jsonContext.CreateUserContextResult).ConfigureAwait(false);
    }

    public async Task<GetUserContextsResult> GetUserContextsAsync(GetUserContextsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync(new GetUserContextsCommand(), options, _jsonContext.GetUserContextsCommand, _jsonContext.GetUserContextsResult).ConfigureAwait(false);
    }

    public async Task<RemoveUserContextResult> RemoveUserContextAsync(UserContext userContext, RemoveUserContextOptions? options = null)
    {
        var @params = new RemoveUserContextParameters(userContext);

        return await Broker.ExecuteCommandAsync(new RemoveUserContextCommand(@params), options, _jsonContext.RemoveUserContextCommand, _jsonContext.RemoveUserContextResult).ConfigureAwait(false);
    }

    public async Task<GetClientWindowsResult> GetClientWindowsAsync(GetClientWindowsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync(new(), options, _jsonContext.GetClientWindowsCommand, _jsonContext.GetClientWindowsResult
            ).ConfigureAwait(false);
    }

    public async Task<SetDownloadBehaviorResult> SetDownloadBehaviorAllowedAsync(string destinationFolder, SetDownloadBehaviorOptions? options = null)
    {
        var @params = new SetDownloadBehaviorParameters(new DownloadBehaviorAllowed(destinationFolder), options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetDownloadBehaviorCommand(@params), options, _jsonContext.SetDownloadBehaviorCommand, _jsonContext.SetDownloadBehaviorResult).ConfigureAwait(false);
    }

    public async Task<SetDownloadBehaviorResult> SetDownloadBehaviorAllowedAsync(SetDownloadBehaviorOptions? options = null)
    {
        var @params = new SetDownloadBehaviorParameters(null, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetDownloadBehaviorCommand(@params), options, _jsonContext.SetDownloadBehaviorCommand, _jsonContext.SetDownloadBehaviorResult).ConfigureAwait(false);
    }

    public async Task<SetDownloadBehaviorResult> SetDownloadBehaviorDeniedAsync(SetDownloadBehaviorOptions? options = null)
    {
        var @params = new SetDownloadBehaviorParameters(new DownloadBehaviorDenied(), options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetDownloadBehaviorCommand(@params), options, _jsonContext.SetDownloadBehaviorCommand, _jsonContext.SetDownloadBehaviorResult).ConfigureAwait(false);
    }

    protected override void Initialize(JsonSerializerOptions jsonSerializerOptions)
    {
        var browserOptions = new JsonSerializerOptions(jsonSerializerOptions)
        {
            Converters =
            {
                new BrowserUserContextConverter(BiDi),
            }
        };

        _jsonContext = new BrowserJsonSerializerContext(browserOptions);
    }
}

[JsonSerializable(typeof(CloseCommand))]
[JsonSerializable(typeof(CloseResult))]
[JsonSerializable(typeof(CreateUserContextCommand))]
[JsonSerializable(typeof(CreateUserContextResult))]
[JsonSerializable(typeof(GetUserContextsCommand))]
[JsonSerializable(typeof(GetUserContextsResult))]
[JsonSerializable(typeof(RemoveUserContextCommand))]
[JsonSerializable(typeof(RemoveUserContextResult))]
[JsonSerializable(typeof(GetClientWindowsCommand))]
[JsonSerializable(typeof(GetClientWindowsResult))]
[JsonSerializable(typeof(SetDownloadBehaviorCommand))]
[JsonSerializable(typeof(SetDownloadBehaviorResult))]

internal partial class BrowserJsonSerializerContext : JsonSerializerContext;
