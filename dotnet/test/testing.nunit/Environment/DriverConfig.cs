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
}

public sealed class DriverConfigOptions
{
    public ChromeDriverConfigOptions Chrome { get; set; }

    public EdgeDriverConfigOptions Edge { get; set; }

    public InternetExplorerDriverConfigOptions InternetExplorer { get; set; }

    public FirefoxDriverConfigOptions Firefox { get; set; }

    public SafariDriverConfigOptions Safari { get; set; }
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
