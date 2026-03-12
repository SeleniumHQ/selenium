// <copyright file="SetScrollbarTypeOverrideCommand.cs" company="Selenium Committers">
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
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.Emulation;

internal sealed class SetScrollbarTypeOverrideCommand(SetScrollbarTypeOverrideParameters @params)
    : Command<SetScrollbarTypeOverrideParameters, SetScrollbarTypeOverrideResult>(@params, "emulation.setScrollbarTypeOverride");

internal sealed record SetScrollbarTypeOverrideParameters([property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] ScrollbarType? ScrollbarType, IEnumerable<BrowsingContext.BrowsingContext>? Contexts, IEnumerable<Browser.UserContext>? UserContexts) : Parameters;

public sealed record SetScrollbarTypeOverrideOptions : CommandOptions
{
    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; init; }

    public IEnumerable<Browser.UserContext>? UserContexts { get; init; }
}

[JsonConverter(typeof(CamelCaseEnumConverter<ScrollbarType>))]
public enum ScrollbarType
{
    Classic,
    Overlay
}

public sealed record SetScrollbarTypeOverrideResult : EmptyResult;
