// <copyright file="CallFunctionCommand.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Script;

internal sealed class CallFunctionCommand(CallFunctionCommandParameters @params)
    : Command<CallFunctionCommandParameters, EvaluateResult>(@params, "script.callFunction");

internal sealed record CallFunctionCommandParameters(string FunctionDeclaration, bool AwaitPromise, Target Target, IEnumerable<LocalValue>? Arguments, ResultOwnership? ResultOwnership, SerializationOptions? SerializationOptions, LocalValue? This, bool? UserActivation) : CommandParameters;

public sealed class CallFunctionOptions : CommandOptions
{
    public IEnumerable<LocalValue>? Arguments { get; set; }

    public ResultOwnership? ResultOwnership { get; set; }

    public SerializationOptions? SerializationOptions { get; set; }

    public LocalValue? This { get; set; }

    public bool? UserActivation { get; set; }
}
