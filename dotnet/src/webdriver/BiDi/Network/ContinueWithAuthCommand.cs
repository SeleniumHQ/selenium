// <copyright file="ContinueWithAuthCommand.cs" company="Selenium Committers">
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
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Network;

internal class ContinueWithAuthCommand(ContinueWithAuthParameters @params)
    : Command<ContinueWithAuthParameters, EmptyResult>(@params, "network.continueWithAuth");

[JsonPolymorphic(TypeDiscriminatorPropertyName = "action")]
[JsonDerivedType(typeof(ContinueWithAuthCredentials), "provideCredentials")]
[JsonDerivedType(typeof(ContinueWithAuthDefaultCredentials), "default")]
[JsonDerivedType(typeof(ContinueWithAuthCancelCredentials), "cancel")]
internal abstract record ContinueWithAuthParameters(Request Request) : Parameters;

internal sealed record ContinueWithAuthCredentials(Request Request, AuthCredentials Credentials) : ContinueWithAuthParameters(Request);

internal abstract record ContinueWithAuthNoCredentials(Request Request) : ContinueWithAuthParameters(Request);

internal sealed record ContinueWithAuthDefaultCredentials(Request Request) : ContinueWithAuthNoCredentials(Request);

internal sealed record ContinueWithAuthCancelCredentials(Request Request) : ContinueWithAuthNoCredentials(Request);

public abstract class ContinueWithAuthOptions : CommandOptions;

public sealed class ContinueWithAuthCredentialsOptions : ContinueWithAuthOptions;

public abstract class ContinueWithAuthNoCredentialsOptions : ContinueWithAuthOptions;

public sealed class ContinueWithAuthDefaultCredentialsOptions : ContinueWithAuthNoCredentialsOptions;

public sealed class ContinueWithAuthCancelCredentialsOptions : ContinueWithAuthNoCredentialsOptions;

