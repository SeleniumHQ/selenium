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

using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Browser;

public sealed class BrowserModule : Module, IBrowserModule
{
    private static readonly BrowserJsonSerializerContext JsonContext = BrowserJsonSerializerContext.Default;

    public async Task<CloseResult> CloseAsync(CloseOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(new CloseCommand(), options, JsonContext.CloseCommand, JsonContext.CloseResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<CreateUserContextResult> CreateUserContextAsync(CreateUserContextOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CreateUserContextParameters(options?.AcceptInsecureCerts, options?.Proxy, options?.UnhandledPromptBehavior);

        return await ExecuteCommandAsync(new CreateUserContextCommand(@params), options, JsonContext.CreateUserContextCommand, JsonContext.CreateUserContextResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<GetUserContextsResult> GetUserContextsAsync(GetUserContextsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(new GetUserContextsCommand(), options, JsonContext.GetUserContextsCommand, JsonContext.GetUserContextsResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<RemoveUserContextResult> RemoveUserContextAsync(UserContext userContext, RemoveUserContextOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new RemoveUserContextParameters(userContext);

        return await ExecuteCommandAsync(new RemoveUserContextCommand(@params), options, JsonContext.RemoveUserContextCommand, JsonContext.RemoveUserContextResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<GetClientWindowsResult> GetClientWindowsAsync(GetClientWindowsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(new(), options, JsonContext.GetClientWindowsCommand, JsonContext.GetClientWindowsResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetDownloadBehaviorResult> SetDownloadBehaviorAllowedAsync(string destinationFolder, SetDownloadBehaviorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetDownloadBehaviorParameters(new DownloadBehaviorAllowed(destinationFolder), options?.UserContexts);

        return await ExecuteCommandAsync(new SetDownloadBehaviorCommand(@params), options, JsonContext.SetDownloadBehaviorCommand, JsonContext.SetDownloadBehaviorResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetDownloadBehaviorResult> SetDownloadBehaviorAllowedAsync(SetDownloadBehaviorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetDownloadBehaviorParameters(null, options?.UserContexts);

        return await ExecuteCommandAsync(new SetDownloadBehaviorCommand(@params), options, JsonContext.SetDownloadBehaviorCommand, JsonContext.SetDownloadBehaviorResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetDownloadBehaviorResult> SetDownloadBehaviorDeniedAsync(SetDownloadBehaviorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetDownloadBehaviorParameters(new DownloadBehaviorDenied(), options?.UserContexts);

        return await ExecuteCommandAsync(new SetDownloadBehaviorCommand(@params), options, JsonContext.SetDownloadBehaviorCommand, JsonContext.SetDownloadBehaviorResult, cancellationToken).ConfigureAwait(false);
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

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class BrowserJsonSerializerContext : JsonSerializerContext;
