// <copyright file="ProvideResponseCommand.cs" company="Selenium Committers">
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

internal sealed class ProvideResponseCommand(ProvideResponseParameters @params)
    : Command<ProvideResponseParameters, EmptyResult>(@params, "network.provideResponse");

internal sealed record ProvideResponseParameters(Request Request, BytesValue? Body, IEnumerable<SetCookieHeader>? Cookies, IEnumerable<Header>? Headers, string? ReasonPhrase, long? StatusCode) : Parameters;

public sealed class ProvideResponseOptions : CommandOptions
{
    public BytesValue? Body { get; set; }

    public IEnumerable<SetCookieHeader>? Cookies { get; set; }

    public IEnumerable<Header>? Headers { get; set; }

    public string? ReasonPhrase { get; set; }

    public long? StatusCode { get; set; }
}
