// <copyright file="InputModule.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Input;

public sealed class InputModule(Broker broker) : Module(broker)
{
    public async Task<EmptyResult> PerformActionsAsync(BrowsingContext.BrowsingContext context, IEnumerable<SourceActions> actions, PerformActionsOptions? options = null)
    {
        var @params = new PerformActionsCommandParameters(context, actions);

        return await Broker.ExecuteCommandAsync<PerformActionsCommand, EmptyResult>(new PerformActionsCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> ReleaseActionsAsync(BrowsingContext.BrowsingContext context, ReleaseActionsOptions? options = null)
    {
        var @params = new ReleaseActionsCommandParameters(context);

        return await Broker.ExecuteCommandAsync<ReleaseActionsCommand, EmptyResult>(new ReleaseActionsCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> SetFilesAsync(BrowsingContext.BrowsingContext context, Script.ISharedReference element, IEnumerable<string> files, SetFilesOptions? options = null)
    {
        var @params = new SetFilesCommandParameters(context, element, files);

        return await Broker.ExecuteCommandAsync<SetFilesCommand, EmptyResult>(new SetFilesCommand(@params), options).ConfigureAwait(false);
    }
}
