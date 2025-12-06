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

using OpenQA.Selenium.BiDi.Json.Converters;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Input;

public sealed class InputModule : Module
{
    private InputJsonSerializerContext _jsonContext = null!;

    public async Task<PerformActionsResult> PerformActionsAsync(BrowsingContext.BrowsingContext context, IEnumerable<SourceActions> actions, PerformActionsOptions? options = null)
    {
        var @params = new PerformActionsParameters(context, actions);

        return await Broker.ExecuteCommandAsync(new PerformActionsCommand(@params), options, _jsonContext.PerformActionsCommand, _jsonContext.PerformActionsResult).ConfigureAwait(false);
    }

    public async Task<ReleaseActionsResult> ReleaseActionsAsync(BrowsingContext.BrowsingContext context, ReleaseActionsOptions? options = null)
    {
        var @params = new ReleaseActionsParameters(context);

        return await Broker.ExecuteCommandAsync(new ReleaseActionsCommand(@params), options, _jsonContext.ReleaseActionsCommand, _jsonContext.ReleaseActionsResult).ConfigureAwait(false);
    }

    public async Task<SetFilesResult> SetFilesAsync(BrowsingContext.BrowsingContext context, Script.ISharedReference element, IEnumerable<string> files, SetFilesOptions? options = null)
    {
        var @params = new SetFilesParameters(context, element, files);

        return await Broker.ExecuteCommandAsync(new SetFilesCommand(@params), options, _jsonContext.SetFilesCommand, _jsonContext.SetFilesResult).ConfigureAwait(false);
    }

    protected override void Initialize(JsonSerializerOptions jsonSerializerOptions)
    {
        var inputOptions = new JsonSerializerOptions(jsonSerializerOptions)
        {
            Converters =
            {
                new BrowsingContextConverter(BiDi),
                new HandleConverter(BiDi),
            }
        };

        _jsonContext = new InputJsonSerializerContext(inputOptions);
    }
}

[JsonSerializable(typeof(PerformActionsCommand))]
[JsonSerializable(typeof(PerformActionsResult))]
[JsonSerializable(typeof(ReleaseActionsCommand))]
[JsonSerializable(typeof(ReleaseActionsResult))]
[JsonSerializable(typeof(SetFilesCommand))]
[JsonSerializable(typeof(SetFilesResult))]
[JsonSerializable(typeof(IEnumerable<IPointerSourceAction>))]
[JsonSerializable(typeof(IEnumerable<IKeySourceAction>))]
[JsonSerializable(typeof(IEnumerable<INoneSourceAction>))]
[JsonSerializable(typeof(IEnumerable<IWheelSourceAction>))]

internal partial class InputJsonSerializerContext : JsonSerializerContext;
