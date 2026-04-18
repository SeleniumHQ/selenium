// <copyright file="ContinueWithAuth.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Network;

public abstract record ContinueWithAuth;

public sealed record ContinueWithAuthCredentials(AuthCredentials Credentials) : ContinueWithAuth;

public sealed record ContinueWithAuthDefault : ContinueWithAuth;

public sealed record ContinueWithAuthCancel : ContinueWithAuth;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "action")]
[JsonDerivedType(typeof(ContinueWithAuthCredentialsParameters), "provideCredentials")]
[JsonDerivedType(typeof(ContinueWithAuthDefaultParameters), "default")]
[JsonDerivedType(typeof(ContinueWithAuthCancelParameters), "cancel")]
internal abstract record ContinueWithAuthParameters(Request Request) : Parameters;

internal sealed record ContinueWithAuthCredentialsParameters(Request Request, AuthCredentials Credentials) : ContinueWithAuthParameters(Request);

internal sealed record ContinueWithAuthDefaultParameters(Request Request) : ContinueWithAuthParameters(Request);

internal sealed record ContinueWithAuthCancelParameters(Request Request) : ContinueWithAuthParameters(Request);

public sealed record ContinueWithAuthOptions : CommandOptions;

public sealed record ContinueWithAuthResult : EmptyResult;
