// <copyright file="AddDataCollectorCommand.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Json.Converters;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Network;

internal sealed class AddDataCollectorCommand(AddDataCollectorParameters @params)
    : Command<AddDataCollectorParameters, AddDataCollectorResult>(@params, "network.addDataCollector");

internal sealed record AddDataCollectorParameters(IEnumerable<DataType> DataTypes, int MaxEncodedDataSize, CollectorType? CollectorType, IEnumerable<BrowsingContext.BrowsingContext>? Contexts, IEnumerable<Browser.UserContext>? UserContexts) : Parameters;

public class AddDataCollectorOptions : CommandOptions
{
    public CollectorType? CollectorType { get; set; }

    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; set; }

    public IEnumerable<Browser.UserContext>? UserContexts { get; set; }
}

public sealed record AddDataCollectorResult(Collector Collector) : EmptyResult;

[JsonConverter(typeof(CamelCaseEnumConverter<DataType>))]
public enum DataType
{
    Request,
    Response
}

[JsonConverter(typeof(CamelCaseEnumConverter<CollectorType>))]
public enum CollectorType
{
    Blob
}
