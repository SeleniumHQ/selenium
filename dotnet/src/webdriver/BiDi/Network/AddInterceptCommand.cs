// <copyright file="AddInterceptCommand.cs" company="Selenium Committers">
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

using System.Collections.Generic;
using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.Network;

internal sealed class AddInterceptCommand(AddInterceptParameters @params)
    : Command<AddInterceptParameters, AddInterceptResult>(@params, "network.addIntercept");

internal sealed record AddInterceptParameters(IEnumerable<InterceptPhase> Phases, IEnumerable<BrowsingContext.BrowsingContext>? Contexts, IEnumerable<UrlPattern>? UrlPatterns) : Parameters;

public record AddInterceptOptions() : CommandOptions
{
    internal AddInterceptOptions(ContextAddInterceptOptions? options) : this()
    {
        UrlPatterns = options?.UrlPatterns;
        Timeout = options?.Timeout;
    }

    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; init; }

    public IEnumerable<UrlPattern>? UrlPatterns { get; init; }
}

public record ContextAddInterceptOptions : CommandOptions
{
    public IEnumerable<UrlPattern>? UrlPatterns { get; init; }
}

public sealed record AddInterceptResult(Intercept Intercept) : EmptyResult;

[JsonConverter(typeof(CamelCaseEnumConverter<InterceptPhase>))]
public enum InterceptPhase
{
    BeforeRequestSent,
    ResponseStarted,
    AuthRequired
}
