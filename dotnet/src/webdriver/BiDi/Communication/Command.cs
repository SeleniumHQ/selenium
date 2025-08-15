// <copyright file="Command.cs" company="Selenium Committers">
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

using System;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication;

public abstract class Command
{
    protected Command(string method, Type resultType)
    {
        Method = method;
        ResultType = resultType;
    }

    [JsonPropertyOrder(1)]
    public string Method { get; }

    [JsonPropertyOrder(0)]
    public long Id { get; internal set; }

    [JsonIgnore]
    public Type ResultType { get; }
}

internal abstract class Command<TParameters, TResult>(TParameters @params, string method) : Command(method, typeof(TResult))
    where TParameters : Parameters
    where TResult : EmptyResult
{
    [JsonPropertyOrder(2)]
    public TParameters Params { get; } = @params;
}

internal record Parameters
{
    public static Parameters Empty { get; } = new Parameters();
}

public record EmptyResult;
