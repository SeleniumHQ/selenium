// <copyright file="ContinueResponseCommand.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Network;

internal sealed class ContinueResponseCommand(ContinueResponseParameters @params)
    : Command<ContinueResponseParameters, EmptyResult>(@params, "network.continueResponse");

internal sealed record ContinueResponseParameters(Request Request, IEnumerable<SetCookieHeader>? Cookies, IEnumerable<AuthCredentials>? Credentials, IEnumerable<Header>? Headers, string? ReasonPhrase, long? StatusCode) : Parameters;

public sealed class ContinueResponseOptions : CommandOptions
{
    public IEnumerable<SetCookieHeader>? Cookies { get; set; }

    public IEnumerable<AuthCredentials>? Credentials { get; set; }

    public IEnumerable<Header>? Headers { get; set; }

    public string? ReasonPhrase { get; set; }

    public long? StatusCode { get; set; }
}
