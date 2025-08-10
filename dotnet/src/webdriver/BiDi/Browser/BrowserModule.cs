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
using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Browser;

public sealed class BrowserModule(Broker broker) : Module(broker)
{
    public async Task<EmptyResult> CloseAsync(CloseOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync<CloseCommand, EmptyResult>(new CloseCommand(), options).ConfigureAwait(false);
    }

    public async Task<UserContextInfo> CreateUserContextAsync(CreateUserContextOptions? options = null)
    {
        var @params = new CreateUserContextCommandParameters(options?.AcceptInsecureCerts, options?.Proxy, options?.UnhandledPromptBehavior);

        return await Broker.ExecuteCommandAsync<CreateUserContextCommand, UserContextInfo>(new CreateUserContextCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<GetUserContextsResult> GetUserContextsAsync(GetUserContextsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync<GetUserContextsCommand, GetUserContextsResult>(new GetUserContextsCommand(), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> RemoveUserContextAsync(UserContext userContext, RemoveUserContextOptions? options = null)
    {
        var @params = new RemoveUserContextCommandParameters(userContext);

        return await Broker.ExecuteCommandAsync<RemoveUserContextCommand, EmptyResult>(new RemoveUserContextCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<GetClientWindowsResult> GetClientWindowsAsync(GetClientWindowsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync<GetClientWindowsCommand, GetClientWindowsResult>(new(), options).ConfigureAwait(false);
    }
}
