// <copyright file="AddPreloadScriptCommand.cs" company="Selenium Committers">
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
using System.Diagnostics.CodeAnalysis;

namespace OpenQA.Selenium.BiDi.Script;

internal sealed class AddPreloadScriptCommand(AddPreloadScriptParameters @params)
    : Command<AddPreloadScriptParameters, AddPreloadScriptResult>(@params, "script.addPreloadScript");

internal sealed record AddPreloadScriptParameters([StringSyntax(StringSyntaxConstants.JavaScript)] string FunctionDeclaration, IEnumerable<ChannelLocalValue>? Arguments, IEnumerable<BrowsingContext.BrowsingContext>? Contexts, IEnumerable<Browser.UserContext>? UserContexts, string? Sandbox) : Parameters;

public sealed class AddPreloadScriptOptions : CommandOptions
{
    public IEnumerable<ChannelLocalValue>? Arguments { get; set; }

    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; set; }

    public IEnumerable<Browser.UserContext>? UserContexts { get; set; }

    public string? Sandbox { get; set; }
}

public sealed class ContextAddPreloadScriptOptions : CommandOptions
{
    public IEnumerable<ChannelLocalValue>? Arguments { get; set; }

    public string? Sandbox { get; set; }

    internal static AddPreloadScriptOptions WithContext(ContextAddPreloadScriptOptions? options, BrowsingContext.BrowsingContext context) => new()
    {
        Contexts = [context],
        Arguments = options?.Arguments,
        Sandbox = options?.Sandbox,
        Timeout = options?.Timeout
    };
}

public sealed record AddPreloadScriptResult(PreloadScript Script) : EmptyResult;
