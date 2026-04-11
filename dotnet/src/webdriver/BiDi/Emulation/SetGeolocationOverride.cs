// <copyright file="SetGeolocationOverride.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Emulation;

public abstract record GeolocationOverride;

public sealed record GeolocationCoordinatesOverride(double Latitude, double Longitude) : GeolocationOverride
{
    public double? Accuracy { get; init; }
    public double? Altitude { get; init; }
    public double? AltitudeAccuracy { get; init; }
    public double? Heading { get; init; }
    public double? Speed { get; init; }
}

public sealed record GeolocationPositionErrorOverride : GeolocationOverride;

[JsonDerivedType(typeof(SetGeolocationOverrideCoordinatesParameters))]
[JsonDerivedType(typeof(SetGeolocationOverridePositionErrorParameters))]
internal abstract record SetGeolocationOverrideParameters(IEnumerable<BrowsingContext.BrowsingContext>? Contexts, IEnumerable<Browser.UserContext>? UserContexts) : Parameters;

internal sealed record SetGeolocationOverrideCoordinatesParameters([property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] GeolocationCoordinates? Coordinates, IEnumerable<BrowsingContext.BrowsingContext>? Contexts, IEnumerable<Browser.UserContext>? UserContexts) : SetGeolocationOverrideParameters(Contexts, UserContexts);

internal sealed record SetGeolocationOverridePositionErrorParameters(GeolocationPositionError Error, IEnumerable<BrowsingContext.BrowsingContext>? Contexts, IEnumerable<Browser.UserContext>? UserContexts) : SetGeolocationOverrideParameters(Contexts, UserContexts);

internal sealed record GeolocationCoordinates(double Latitude, double Longitude, double? Accuracy, double? Altitude, double? AltitudeAccuracy, double? Heading, double? Speed);

internal sealed record GeolocationPositionError
{
    [JsonInclude]
    internal string Type { get; } = "positionUnavailable";
}

public sealed record SetGeolocationOverrideOptions : CommandOptions
{
    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; init; }

    public IEnumerable<Browser.UserContext>? UserContexts { get; init; }
}

public sealed record SetGeolocationOverrideResult : EmptyResult;
