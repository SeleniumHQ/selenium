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
    public async Task<CloseResult> CloseAsync(CloseOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync("browser.close", Parameters.Empty, Default.Parameters, Default.CloseResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<CreateUserContextResult> CreateUserContextAsync(CreateUserContextOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CreateUserContextParameters(options?.AcceptInsecureCerts, options?.Proxy, options?.UnhandledPromptBehavior);

        return await ExecuteAsync("browser.createUserContext", @params, Default.CreateUserContextParameters, Default.CreateUserContextResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<GetUserContextsResult> GetUserContextsAsync(GetUserContextsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync("browser.getUserContexts", Parameters.Empty, Default.Parameters, Default.GetUserContextsResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<RemoveUserContextResult> RemoveUserContextAsync(UserContext userContext, RemoveUserContextOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new RemoveUserContextParameters(userContext);

        return await ExecuteAsync("browser.removeUserContext", @params, Default.RemoveUserContextParameters, Default.RemoveUserContextResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<GetClientWindowsResult> GetClientWindowsAsync(GetClientWindowsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync("browser.getClientWindows", Parameters.Empty, Default.Parameters, Default.GetClientWindowsResult, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetDownloadBehaviorResult> SetDownloadBehaviorAsync(DownloadBehavior? downloadBehavior, SetDownloadBehaviorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetDownloadBehaviorParameters(downloadBehavior, options?.UserContexts);

        return await ExecuteAsync("browser.setDownloadBehavior", @params, Default.SetDownloadBehaviorParameters, Default.SetDownloadBehaviorResult, options, cancellationToken).ConfigureAwait(false);
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
