// <copyright file="GetTreeCommand.cs" company="Selenium Committers">
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
using System.Collections;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

internal sealed class GetTreeCommand(GetTreeCommandParameters @params)
    : Command<GetTreeCommandParameters, GetTreeResult>(@params, "browsingContext.getTree");

internal sealed record GetTreeCommandParameters(long? MaxDepth, BrowsingContext? Root) : CommandParameters;

public sealed class GetTreeOptions : CommandOptions
{
    public GetTreeOptions() { }

    internal GetTreeOptions(BrowsingContextGetTreeOptions? options)
    {
        MaxDepth = options?.MaxDepth;
    }

    public long? MaxDepth { get; set; }

    public BrowsingContext? Root { get; set; }
}

public sealed record BrowsingContextGetTreeOptions
{
    public long? MaxDepth { get; set; }
}

public sealed record GetTreeResult : EmptyResult, IReadOnlyList<BrowsingContextInfo>
{
    internal GetTreeResult(IReadOnlyList<BrowsingContextInfo> contexts)
    {
        Contexts = contexts;
    }

    public IReadOnlyList<BrowsingContextInfo> Contexts { get; }

    public BrowsingContextInfo this[int index] => Contexts[index];

    public int Count => Contexts.Count;

    public IEnumerator<BrowsingContextInfo> GetEnumerator() => Contexts.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => (Contexts as IEnumerable).GetEnumerator();
}
