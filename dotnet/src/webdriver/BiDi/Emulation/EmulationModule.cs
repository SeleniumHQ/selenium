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

using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Emulation;

public sealed class EmulationModule : Module
{
    public async Task<SetTimezoneOverrideResult> SetTimezoneOverrideAsync(string? timezone, SetTimezoneOverrideOptions? options = null)
    {
        var @params = new SetTimezoneOverrideParameters(timezone, options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetTimezoneOverrideCommand(@params), options, JsonContext.SetTimezoneOverrideCommand, JsonContext.SetTimezoneOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetUserAgentOverrideResult> SetUserAgentOverrideAsync(string? userAgent, SetUserAgentOverrideOptions? options = null)
    {
        var @params = new SetUserAgentOverrideParameters(userAgent, options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetUserAgentOverrideCommand(@params), options, JsonContext.SetUserAgentOverrideCommand, JsonContext.SetUserAgentOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetLocaleOverrideResult> SetLocaleOverrideAsync(string? locale, SetLocaleOverrideOptions? options = null)
    {
        var @params = new SetLocaleOverrideParameters(locale, options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetLocaleOverrideCommand(@params), options, JsonContext.SetLocaleOverrideCommand, JsonContext.SetLocaleOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetForcedColorsModeThemeOverrideResult> SetForcedColorsModeThemeOverrideAsync(ForcedColorsModeTheme? theme, SetForcedColorsModeThemeOverrideOptions? options = null)
    {
        var @params = new SetForcedColorsModeThemeOverrideParameters(theme, options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetForcedColorsModeThemeOverrideCommand(@params), options, JsonContext.SetForcedColorsModeThemeOverrideCommand, JsonContext.SetForcedColorsModeThemeOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetScriptingEnabledResult> SetScriptingEnabledAsync(bool? enabled, SetScriptingEnabledOptions? options = null)
    {
        var @params = new SetScriptingEnabledParameters(enabled, options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetScriptingEnabledCommand(@params), options, JsonContext.SetScriptingEnabledCommand, JsonContext.SetScriptingEnabledResult).ConfigureAwait(false);
    }

    public async Task<SetScreenOrientationOverrideResult> SetScreenOrientationOverrideAsync(ScreenOrientation? screenOrientation, SetScreenOrientationOverrideOptions? options = null)
    {
        var @params = new SetScreenOrientationOverrideParameters(screenOrientation, options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetScreenOrientationOverrideCommand(@params), options, JsonContext.SetScreenOrientationOverrideCommand, JsonContext.SetScreenOrientationOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationCoordinatesOverrideAsync(double latitude, double longitude, SetGeolocationCoordinatesOverrideOptions? options = null)
    {
        var coordinates = new GeolocationCoordinates(latitude, longitude, options?.Accuracy, options?.Altitude, options?.AltitudeAccuracy, options?.Heading, options?.Speed);

        var @params = new SetGeolocationOverrideCoordinatesParameters(coordinates, options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetGeolocationOverrideCommand(@params), options, JsonContext.SetGeolocationOverrideCommand, JsonContext.SetGeolocationOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationCoordinatesOverrideAsync(SetGeolocationOverrideOptions? options = null)
    {
        var @params = new SetGeolocationOverrideCoordinatesParameters(null, options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetGeolocationOverrideCommand(@params), options, JsonContext.SetGeolocationOverrideCommand, JsonContext.SetGeolocationOverrideResult).ConfigureAwait(false);
    }

    public async Task<SetGeolocationOverrideResult> SetGeolocationPositionErrorOverrideAsync(SetGeolocationPositionErrorOverrideOptions? options = null)
    {
        var @params = new SetGeolocationOverridePositionErrorParameters(new GeolocationPositionError(), options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetGeolocationOverrideCommand(@params), options, JsonContext.SetGeolocationOverrideCommand, JsonContext.SetGeolocationOverrideResult).ConfigureAwait(false);
    }
}
