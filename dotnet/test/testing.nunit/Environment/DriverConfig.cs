// <copyright file="DriverConfig.cs" company="Selenium Committers">
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

using Microsoft.Extensions.Configuration;

namespace OpenQA.Selenium.Testing.NUnit.Environment;

public class DriverConfig
{
    [ConfigurationKeyName("Browser")]
    public Browser BrowserValue { get; set; }

    public DriverConfigOptions Options { get; set; } = new();

    public string RemoteCapabilities { get; set; }

    public bool AutoStartRemoteServer { get; set; }

    public bool Logging { get; set; }

    public void ValidateOptions()
    {
        this.Options ??= new DriverConfigOptions();

        string expectedOptionsName = this.BrowserValue switch
        {
            Browser.Chrome => "Chrome",
            Browser.Edge => "Edge",
            Browser.IE => "InternetExplorer",
            Browser.Firefox => "Firefox",
            Browser.Safari => "Safari",
            Browser.Remote => null,
                _ => throw new InvalidOperationException($"Unsupported browser value '{this.BrowserValue}' in driver config."),
        };

        foreach (string configuredOptionsName in this.Options.GetConfiguredOptionNames())
        {
            if (configuredOptionsName != expectedOptionsName)
            {
                throw new InvalidOperationException($"Options for browser '{this.BrowserValue}' cannot contain '{configuredOptionsName}' options.");
            }
        }
    }
}

public sealed class DriverConfigOptions
{
    public ChromeDriverConfigOptions Chrome { get; set; }

    public EdgeDriverConfigOptions Edge { get; set; }

    public InternetExplorerDriverConfigOptions InternetExplorer { get; set; }

    public FirefoxDriverConfigOptions Firefox { get; set; }

    public SafariDriverConfigOptions Safari { get; set; }

    public IEnumerable<string> GetConfiguredOptionNames()
    {
        if (this.Chrome != null)
        {
            yield return "Chrome";
        }
        if (this.Edge != null)
        {
            yield return "Edge";
        }
        if (this.InternetExplorer != null)
        {
            yield return "InternetExplorer";
        }
        if (this.Firefox != null)
        {
            yield return "Firefox";
        }
        if (this.Safari != null)
        {
            yield return "Safari";
        }
    }
}

public sealed class ChromeDriverConfigOptions
{
    public string BrowserVersion { get; set; }
}

public sealed class EdgeDriverConfigOptions
{
    public string BrowserVersion { get; set; }
}

public sealed class InternetExplorerDriverConfigOptions
{
    public bool RequireWindowFocus { get; set; }

    public bool UsePerProcessProxy { get; set; }

    public bool AttachToEdgeChrome { get; set; }
}

public sealed class FirefoxDriverConfigOptions
{
    public string BrowserVersion { get; set; }

    public bool AcceptInsecureCertificates { get; set; }

    public bool EnableDevToolsProtocol { get; set; }
}

public sealed class SafariDriverConfigOptions
{
    public bool UseTechnologyPreview { get; set; }
}
