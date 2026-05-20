// <copyright file="DownloadEndEvent.cs" company="Selenium Committers">
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

using System.Text.Json;
using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi.Json;
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public abstract record DownloadEndEventArgs(
    IBiDi BiDi,
    BrowsingContext Context)
    : EventArgs(BiDi);

public sealed record DownloadCanceledEventArgs(
    IBiDi BiDi,
    Download Download,
    BrowsingContext Context,
    Navigation? Navigation,
    DateTimeOffset Timestamp,
    string Url)
    : DownloadEndEventArgs(BiDi, Context), IBaseNavigationInfo;

public sealed record DownloadCompleteEventArgs(
    IBiDi BiDi,
    Download Download,
    string? Filepath,
    BrowsingContext Context,
    Navigation? Navigation,
    DateTimeOffset Timestamp,
    string Url)
    : DownloadEndEventArgs(BiDi, Context), IBaseNavigationInfo;

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "status")]
//[JsonDerivedType(typeof(DownloadCanceledParams), "canceled")]
//[JsonDerivedType(typeof(DownloadCompleteParams), "complete")]
[JsonConverter(typeof(DownloadEndParamsConverter))]
internal abstract record DownloadEndParams(BrowsingContext Context);

internal sealed record DownloadCanceledParams(
    Download Download,
    BrowsingContext Context,
    Navigation? Navigation,
    [property: JsonConverter(typeof(DateTimeOffsetConverter))] DateTimeOffset Timestamp,
    string Url)
    : DownloadEndParams(Context), IBaseNavigationInfo;

internal sealed record DownloadCompleteParams(
    Download Download,
    string? Filepath,
    BrowsingContext Context,
    Navigation? Navigation,
    [property: JsonConverter(typeof(DateTimeOffsetConverter))] DateTimeOffset Timestamp,
    string Url)
    : DownloadEndParams(Context), IBaseNavigationInfo;

// https://github.com/dotnet/runtime/issues/72604
internal class DownloadEndParamsConverter : JsonConverter<DownloadEndParams>
{
    public override DownloadEndParams? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.GetDiscriminator("status") switch
        {
            "canceled" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<DownloadCanceledParams>()),
            "complete" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<DownloadCompleteParams>()),
            _ => null,
        };
    }

    public override void Write(Utf8JsonWriter writer, DownloadEndParams value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
