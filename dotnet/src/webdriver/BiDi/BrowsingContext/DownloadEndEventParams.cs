// <copyright file="DownloadEndEventParams.cs" company="Selenium Committers">
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
using OpenQA.Selenium.BiDi.Json.Converters.Polymorphic;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "status")]
//[JsonDerivedType(typeof(DownloadCanceledEventParams), "canceled")]
//[JsonDerivedType(typeof(DownloadCompleteEventParams), "complete")]
[JsonConverter(typeof(DownloadEndEventParamsConverter))]
public abstract record DownloadEndEventParams(BrowsingContext Context);

public sealed record DownloadCanceledEventParams(BrowsingContext Context, Navigation? Navigation, DateTimeOffset Timestamp, string Url)
    : DownloadEndEventParams(Context), IBaseNavigationInfo;

public sealed record DownloadCompleteEventParams(string? Filepath, BrowsingContext Context, Navigation? Navigation, DateTimeOffset Timestamp, string Url)
    : DownloadEndEventParams(Context), IBaseNavigationInfo;
