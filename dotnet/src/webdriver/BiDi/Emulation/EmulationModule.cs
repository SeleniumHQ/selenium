// <copyright file="EmulationModule.cs" company="Selenium Committers">
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
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Emulation;

public sealed class EmulationModule : Module
{
    private EmulationJsonSerializerContext _jsonContext = null!;

    public async Task<SetTimezoneOverrideResult> SetTimezoneOverrideAsync(string? timezone, SetTimezoneOverrideOptions? options = null)
    {
        var @params = new SetTimezoneOverrideParameters(timezone, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetTimezoneOverrideCommand(@params), options, _jsonContext.SetTimezoneOverrideCommand, _jsonContext.SetTimezoneOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetUserAgentOverrideResult> SetUserAgentOverrideAsync(string? userAgent, SetUserAgentOverrideOptions? options = null)
    {
        var @params = new SetUserAgentOverrideParameters(userAgent, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetUserAgentOverrideCommand(@params), options, _jsonContext.SetUserAgentOverrideCommand, _jsonContext.SetUserAgentOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetLocaleOverrideResult> SetLocaleOverrideAsync(string? locale, SetLocaleOverrideOptions? options = null)
    {
        var @params = new SetLocaleOverrideParameters(locale, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetLocaleOverrideCommand(@params), options, _jsonContext.SetLocaleOverrideCommand, _jsonContext.SetLocaleOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetForcedColorsModeThemeOverrideResult> SetForcedColorsModeThemeOverrideAsync(ForcedColorsModeTheme? theme, SetForcedColorsModeThemeOverrideOptions? options = null)
    {
        var @params = new SetForcedColorsModeThemeOverrideParameters(theme, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetForcedColorsModeThemeOverrideCommand(@params), options, _jsonContext.SetForcedColorsModeThemeOverrideCommand, _jsonContext.SetForcedColorsModeThemeOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetScriptingEnabledResult> SetScriptingEnabledAsync(bool? enabled, SetScriptingEnabledOptions? options = null)
    {
        var @params = new SetScriptingEnabledParameters(enabled, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetScriptingEnabledCommand(@params), options, _jsonContext.SetScriptingEnabledCommand, _jsonContext.SetScriptingEnabledResult).ConfigureAwait(false);
    }

    public async Task<SetScreenOrientationOverrideResult> SetScreenOrientationOverrideAsync(ScreenOrientation? screenOrientation, SetScreenOrientationOverrideOptions? options = null)
    {
        var @params = new SetScreenOrientationOverrideParameters(screenOrientation, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetScreenOrientationOverrideCommand(@params), options, _jsonContext.SetScreenOrientationOverrideCommand, _jsonContext.SetScreenOrientationOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetScreenSettingsOverrideResult> SetScreenSettingsOverrideAsync(ScreenArea? screenArea, SetScreenSettingsOverrideOptions? options = null)
    {
        var @params = new SetScreenSettingsOverrideParameters(screenArea, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetScreenSettingsOverrideCommand(@params), options, _jsonContext.SetScreenSettingsOverrideCommand, _jsonContext.SetScreenSettingsOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationCoordinatesOverrideAsync(double latitude, double longitude, SetGeolocationCoordinatesOverrideOptions? options = null)
    {
        var coordinates = new GeolocationCoordinates(latitude, longitude, options?.Accuracy, options?.Altitude, options?.AltitudeAccuracy, options?.Heading, options?.Speed);

        var @params = new SetGeolocationOverrideCoordinatesParameters(coordinates, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetGeolocationOverrideCommand(@params), options, _jsonContext.SetGeolocationOverrideCommand, _jsonContext.SetGeolocationOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationCoordinatesOverrideAsync(SetGeolocationOverrideOptions? options = null)
    {
        var @params = new SetGeolocationOverrideCoordinatesParameters(null, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetGeolocationOverrideCommand(@params), options, _jsonContext.SetGeolocationOverrideCommand, _jsonContext.SetGeolocationOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationPositionErrorOverrideAsync(SetGeolocationPositionErrorOverrideOptions? options = null)
    {
        var @params = new SetGeolocationOverridePositionErrorParameters(new GeolocationPositionError(), options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetGeolocationOverrideCommand(@params), options, _jsonContext.SetGeolocationOverrideCommand, _jsonContext.SetGeolocationOverrideResult).ConfigureAwait(false);
    }

    protected override void Initialize(JsonSerializerOptions jsonSerializerOptions)
    {
        jsonSerializerOptions.Converters.Add(new BrowsingContextConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new BrowserUserContextConverter(BiDi));

        _jsonContext = new EmulationJsonSerializerContext(jsonSerializerOptions);
    }
}

[JsonSerializable(typeof(SetTimezoneOverrideCommand))]
[JsonSerializable(typeof(SetTimezoneOverrideResult))]
[JsonSerializable(typeof(SetUserAgentOverrideCommand))]
[JsonSerializable(typeof(SetUserAgentOverrideResult))]
[JsonSerializable(typeof(SetLocaleOverrideCommand))]
[JsonSerializable(typeof(SetLocaleOverrideResult))]
[JsonSerializable(typeof(SetForcedColorsModeThemeOverrideCommand))]
[JsonSerializable(typeof(SetForcedColorsModeThemeOverrideResult))]
[JsonSerializable(typeof(SetScriptingEnabledCommand))]
[JsonSerializable(typeof(SetScriptingEnabledResult))]
[JsonSerializable(typeof(SetScreenOrientationOverrideCommand))]
[JsonSerializable(typeof(SetScreenOrientationOverrideResult))]
[JsonSerializable(typeof(SetScreenSettingsOverrideCommand))]
[JsonSerializable(typeof(SetScreenSettingsOverrideResult))]
[JsonSerializable(typeof(SetGeolocationOverrideCommand))]
[JsonSerializable(typeof(SetGeolocationOverrideResult))]

internal partial class EmulationJsonSerializerContext : JsonSerializerContext;
