// <copyright file="GetRealmsCommand.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Script;

internal sealed class GetRealmsCommand(GetRealmsCommandParameters @params)
    : Command<GetRealmsCommandParameters, GetRealmsResult>(@params, "script.getRealms");

internal sealed record GetRealmsCommandParameters(BrowsingContext.BrowsingContext? Context, RealmType? Type) : CommandParameters;

public sealed class GetRealmsOptions : CommandOptions
{
    public BrowsingContext.BrowsingContext? Context { get; set; }

    public RealmType? Type { get; set; }
}

public sealed record GetRealmsResult : EmptyResult, IReadOnlyList<RealmInfo>
{
    private readonly IReadOnlyList<RealmInfo> _realms;

    internal GetRealmsResult(IReadOnlyList<RealmInfo> realms)
    {
        _realms = realms;
    }

    public RealmInfo this[int index] => _realms[index];

    public int Count => _realms.Count;

    public IEnumerator<RealmInfo> GetEnumerator() => _realms.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => (_realms as IEnumerable).GetEnumerator();
}
