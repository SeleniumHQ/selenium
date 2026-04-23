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
using static OpenQA.Selenium.BiDi.Browser.BrowserJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.Browser;

internal sealed class BrowserModule : Module, IBrowserModule
{
    private static readonly Command<Parameters, CloseResult> CloseCommand = new(
        "browser.close", Default.Parameters, Default.CloseResult);

    private static readonly Command<CreateUserContextParameters, CreateUserContextResult> CreateUserContextCommand = new(
        "browser.createUserContext", Default.CreateUserContextParameters, Default.CreateUserContextResult);

    private static readonly Command<Parameters, GetUserContextsResult> GetUserContextsCommand = new(
        "browser.getUserContexts", Default.Parameters, Default.GetUserContextsResult);

    private static readonly Command<RemoveUserContextParameters, RemoveUserContextResult> RemoveUserContextCommand = new(
        "browser.removeUserContext", Default.RemoveUserContextParameters, Default.RemoveUserContextResult);

    private static readonly Command<Parameters, GetClientWindowsResult> GetClientWindowsCommand = new(
        "browser.getClientWindows", Default.Parameters, Default.GetClientWindowsResult);

    private static readonly Command<SetDownloadBehaviorParameters, SetDownloadBehaviorResult> SetDownloadBehaviorCommand = new(
        "browser.setDownloadBehavior", Default.SetDownloadBehaviorParameters, Default.SetDownloadBehaviorResult);

    public async Task<CloseResult> CloseAsync(CloseOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync(CloseCommand, Parameters.Empty, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<CreateUserContextResult> CreateUserContextAsync(CreateUserContextOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CreateUserContextParameters(options?.AcceptInsecureCerts, options?.Proxy, options?.UnhandledPromptBehavior);

        return await ExecuteAsync(CreateUserContextCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<GetUserContextsResult> GetUserContextsAsync(GetUserContextsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync(GetUserContextsCommand, Parameters.Empty, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<RemoveUserContextResult> RemoveUserContextAsync(UserContext userContext, RemoveUserContextOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new RemoveUserContextParameters(userContext);

        return await ExecuteAsync(RemoveUserContextCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<GetClientWindowsResult> GetClientWindowsAsync(GetClientWindowsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync(GetClientWindowsCommand, Parameters.Empty, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetDownloadBehaviorResult> SetDownloadBehaviorAsync(DownloadBehavior? downloadBehavior, SetDownloadBehaviorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetDownloadBehaviorParameters(downloadBehavior, options?.UserContexts);

        return await ExecuteAsync(SetDownloadBehaviorCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }
}

[JsonSerializable(typeof(Parameters))]
[JsonSerializable(typeof(CloseResult))]
[JsonSerializable(typeof(CreateUserContextParameters))]
[JsonSerializable(typeof(CreateUserContextResult))]
[JsonSerializable(typeof(GetUserContextsResult))]
[JsonSerializable(typeof(RemoveUserContextParameters))]
[JsonSerializable(typeof(RemoveUserContextResult))]
[JsonSerializable(typeof(GetClientWindowsResult))]
[JsonSerializable(typeof(SetDownloadBehaviorParameters))]
[JsonSerializable(typeof(SetDownloadBehaviorResult))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class BrowserJsonSerializerContext : JsonSerializerContext;
