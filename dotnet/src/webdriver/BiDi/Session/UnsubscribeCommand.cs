// <copyright file="UnsubscribeCommand.cs" company="Selenium Committers">
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
using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Session;

internal sealed class UnsubscribeByIdCommand(UnsubscribeByIdParameters @params)
    : Command<UnsubscribeByIdParameters, EmptyResult>(@params, "session.unsubscribe");

internal sealed class UnsubscribeByAttributesCommand(UnsubscribeByAttributesParameters @params)
    : Command<UnsubscribeByAttributesParameters, EmptyResult>(@params, "session.unsubscribe");

internal sealed record UnsubscribeByIdParameters(IEnumerable<Subscription> Subscriptions) : Parameters;

public sealed class UnsubscribeByIdOptions : CommandOptions;

internal sealed record UnsubscribeByAttributesParameters(
    IEnumerable<string> Events,
    [property: Obsolete("Contexts param is deprecated and will be removed in the future versions")]
    // https://w3c.github.io/webdriver-bidi/#type-session-UnsubscribeByAttributesRequest
    IEnumerable<BrowsingContext.BrowsingContext>? Contexts) : Parameters;

public sealed class UnsubscribeByAttributesOptions : CommandOptions
{
    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; set; }
}
