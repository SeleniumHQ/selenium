// <copyright file="EmulationModule.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Emulation;

public sealed class EmulationModule(Broker broker) : Module(broker)
{
    public async Task<EmptyResult> SetTimezoneOverrideAsync(string? timezone, SetTimezoneOverrideOptions? options = null)
    {
        var @params = new SetTimezoneOverrideParameters(timezone, options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync<SetTimezoneOverrideCommand, EmptyResult>(new SetTimezoneOverrideCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> SetUserAgentOverrideAsync(string? userAgent, SetUserAgentOverrideOptions? options = null)
    {
        var @params = new SetUserAgentOverrideParameters(userAgent, options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync<SetUserAgentOverrideCommand, EmptyResult>(new SetUserAgentOverrideCommand(@params), options).ConfigureAwait(false);
    }
}
