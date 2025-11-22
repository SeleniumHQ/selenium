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

using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Browser;

public sealed class BrowserModule : Module
{
    public async Task<CloseResult> CloseAsync(CloseOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync(new CloseCommand(), options, JsonContext.Browser_CloseCommand, JsonContext.Browser_CloseResult).ConfigureAwait(false);
    }

    public async Task<CreateUserContextResult> CreateUserContextAsync(CreateUserContextOptions? options = null)
    {
        var @params = new CreateUserContextParameters(options?.AcceptInsecureCerts, options?.Proxy, options?.UnhandledPromptBehavior);

        return await Broker.ExecuteCommandAsync(new CreateUserContextCommand(@params), options, JsonContext.CreateUserContextCommand, JsonContext.CreateUserContextResult).ConfigureAwait(false);
    }

    public async Task<GetUserContextsResult> GetUserContextsAsync(GetUserContextsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync(new GetUserContextsCommand(), options, JsonContext.GetUserContextsCommand, JsonContext.GetUserContextsResult).ConfigureAwait(false);
    }

    public async Task<RemoveUserContextResult> RemoveUserContextAsync(UserContext userContext, RemoveUserContextOptions? options = null)
    {
        var @params = new RemoveUserContextParameters(userContext);

        return await Broker.ExecuteCommandAsync(new RemoveUserContextCommand(@params), options, JsonContext.RemoveUserContextCommand, JsonContext.RemoveUserContextResult).ConfigureAwait(false);
    }

    public async Task<GetClientWindowsResult> GetClientWindowsAsync(GetClientWindowsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync(new(), options, JsonContext.GetClientWindowsCommand, JsonContext.GetClientWindowsResult
            ).ConfigureAwait(false);
    }

    public async Task<SetDownloadBehaviorResult> SetDownloadBehaviorAllowedAsync(string destinationFolder, SetDownloadBehaviorOptions? options = null)
    {
        var @params = new SetDownloadBehaviorParameters(new DownloadBehaviorAllowed(destinationFolder), options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetDownloadBehaviorCommand(@params), options, JsonContext.SetDownloadBehaviorCommand, JsonContext.SetDownloadBehaviorResult).ConfigureAwait(false);
    }

    public async Task<SetDownloadBehaviorResult> SetDownloadBehaviorAllowedAsync(SetDownloadBehaviorOptions? options = null)
    {
        var @params = new SetDownloadBehaviorParameters(null, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetDownloadBehaviorCommand(@params), options, JsonContext.SetDownloadBehaviorCommand, JsonContext.SetDownloadBehaviorResult).ConfigureAwait(false);
    }

    public async Task<SetDownloadBehaviorResult> SetDownloadBehaviorDeniedAsync(SetDownloadBehaviorOptions? options = null)
    {
        var @params = new SetDownloadBehaviorParameters(new DownloadBehaviorDenied(), options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetDownloadBehaviorCommand(@params), options, JsonContext.SetDownloadBehaviorCommand, JsonContext.SetDownloadBehaviorResult).ConfigureAwait(false);
    }
}
