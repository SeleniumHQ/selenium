// <copyright file="EmulationTests.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Emulation;

namespace OpenQA.Selenium.Tests.BiDi.Emulation;

internal class EmulationTests : BiDiTestFixture
{
    [Test]
    public void CanSetTimezoneOverride()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetTimezoneOverrideAsync("UTC", new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    public void CanSetTimezoneOverrideToDefault()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetTimezoneOverrideAsync(null, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    public void CanSetUserAgentOverride()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetUserAgentOverrideAsync("MyUserAgent/1.0", new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    public void CanSetUserAgentOverrideToDefault()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetUserAgentOverrideAsync(null, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    public void CanSetLocaleOverride()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetLocaleOverrideAsync("en-US", new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    public void CanSetLocaleOverrideToDefault()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetLocaleOverrideAsync(null, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Chrome, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Edge, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "Not supported yet?")]
    public void CanSetForcedColorsModeThemeOverride()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetForcedColorsModeThemeOverrideAsync(ForcedColorsModeTheme.Light, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Chrome, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Edge, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "Not supported yet?")]
    public void CanSetForcedColorsModeThemeOverrideToDefault()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetForcedColorsModeThemeOverrideAsync(null, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "Not supported yet?")]
    public void CanSetScriptingEnabled()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetScriptingEnabledAsync(false, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "Not supported yet?")]
    public void CanSetScriptingEnabledToDefault()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetScriptingEnabledAsync(null, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Chrome, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Edge, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "Not supported yet?")]
    public void CanSetScrollbarTypeOverride()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetScrollbarTypeOverrideAsync(ScrollbarType.Overlay, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Chrome, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Edge, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "Not supported yet?")]
    public void CanSetScrollbarTypeOverrideToDefault()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetScrollbarTypeOverrideAsync(null, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    public void CanSetScreenOrientationOverride()
    {
        var orientation = new OpenQA.Selenium.BiDi.Emulation.ScreenOrientation(ScreenOrientationNatural.Portrait, ScreenOrientationType.PortraitPrimary);

        Assert.That(async () =>
        {
            await bidi.Emulation.SetScreenOrientationOverrideAsync(orientation, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    public void CanSetScreenOrientationOverrideToDefault()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetScreenOrientationOverrideAsync(null, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Chrome, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Edge, "Not supported yet?")]
    public void CanSetScreenSettingsOverride()
    {
        var screenArea = new ScreenArea(300, 200);

        Assert.That(async () =>
        {
            await bidi.Emulation.SetScreenSettingsOverrideAsync(screenArea, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    public void CanSetGeolocationCoordinatesOverride()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetGeolocationCoordinatesOverrideAsync(0, 0, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    public void CanSetGeolocationCoordinatesOverrideToDefault()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetGeolocationCoordinatesOverrideAsync(new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "invalid argument: Expected \"coordinates\" to be an object, got [object Undefined] undefined")]
    public void CanSetGeolocationPositionErrorOverride()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetGeolocationPositionErrorOverrideAsync(new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Chrome, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Edge, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "Not supported yet?")]
    public void CanSetTouchOverride()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetTouchOverrideAsync(5, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Chrome, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Edge, "Not supported yet?")]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "Not supported yet?")]
    public void CanSetTouchOverrideToDefault()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetTouchOverrideAsync(null, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "Not supported yet?")]
    public void CanSetNetworkConditionsOffline()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetNetworkConditionsAsync(new NetworkConditionsOffline(), new() { Contexts = [context] });
        },
        Throws.Nothing);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "Not supported yet?")]
    public void CanSetNetworkConditionsToDefault()
    {
        Assert.That(async () =>
        {
            await bidi.Emulation.SetNetworkConditionsAsync(null, new() { Contexts = [context] });
        },
        Throws.Nothing);
    }
}
