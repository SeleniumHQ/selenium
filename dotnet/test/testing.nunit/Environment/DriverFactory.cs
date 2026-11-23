// <copyright file="DriverFactory.cs" company="Selenium Committers">
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

using System.IO;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Chromium;
using OpenQA.Selenium.Edge;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.IE;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Safari;

namespace OpenQA.Selenium.Testing.NUnit.Environment;

public class DriverFactory
{
    private readonly Browser browser;
    private readonly DriverConfig driverConfig;
    private readonly string driverPath;
    private readonly string browserBinaryLocation;
    private readonly bool headless;

    public DriverFactory(EnvironmentManager environment)
    {
        this.browser = environment.Browser;
        this.driverConfig = environment.Configuration.DriverConfigs[environment.Configuration.ActiveDriverConfig];
        this.driverPath = environment.Configuration.DriverServiceLocation;
        this.browserBinaryLocation = environment.BrowserLocation;
        this.headless = environment.Configuration.Headless;
    }

    public IWebDriver CreateDriver(DriverOptions driverOptions = null, bool logging = false, Action<DriverOptions> configureOptions = null)
    {
        if (this.browser == Browser.Remote)
        {
            var remoteOptions = new ChromeOptions();
            configureOptions?.Invoke(remoteOptions);
            var remoteDriver = new RemoteWebDriver(RemoteSeleniumServer.ServerUri, remoteOptions);
            remoteDriver.FileDetector = new LocalFileDetector();
            return remoteDriver;
        }

        DriverOptions options = this.CreateDriverOptions(driverOptions);
        DriverService service = this.CreateDriverService();

        if (!String.IsNullOrEmpty(this.driverPath))
        {
            service.DriverServicePath = Path.GetDirectoryName(this.driverPath);
            service.DriverServiceExecutableName = Path.GetFileName(this.driverPath);
        }

        if (logging)
        {
            switch (service)
            {
                case ChromiumDriverService chromiumService:
                    chromiumService.EnableVerboseLogging = true;
                    break;
                case InternetExplorerDriverService internetExplorerService:
                    internetExplorerService.LoggingLevel = InternetExplorerDriverLogLevel.Trace;
                    break;
                case FirefoxDriverService firefoxService:
                    firefoxService.LogLevel = FirefoxDriverLogLevel.Trace;
                    break;
            }
        }

        configureOptions?.Invoke(options);

        return this.browser switch
        {
            Browser.Chrome => new ChromeDriver((ChromeDriverService)service, (ChromeOptions)options),
            Browser.Edge => new EdgeDriver((EdgeDriverService)service, (EdgeOptions)options),
            Browser.IE => new InternetExplorerDriver((InternetExplorerDriverService)service, (InternetExplorerOptions)options),
            Browser.Firefox => new FirefoxDriver((FirefoxDriverService)service, (FirefoxOptions)options),
            Browser.Safari => new SafariDriver((SafariDriverService)service, (SafariOptions)options),
            _ => throw new InvalidOperationException($"Unsupported browser: {this.browser}"),
        };
    }

    private DriverOptions CreateDriverOptions(DriverOptions overriddenOptions)
    {
        switch (this.browser)
        {
            case Browser.Chrome:
                ChromeDriverConfigOptions chromeConfig = this.driverConfig.Options.Chrome ?? new ChromeDriverConfigOptions();
                var chromeOptions = new ChromeOptions();
                if (!string.IsNullOrEmpty(chromeConfig.BrowserVersion))
                {
                    chromeOptions.BrowserVersion = chromeConfig.BrowserVersion;
                }
                chromeOptions.AddArguments("--no-sandbox", "--disable-dev-shm-usage");
                if (this.headless)
                {
                    chromeOptions.AddArgument("--headless");
                }
                if (!string.IsNullOrEmpty(this.browserBinaryLocation))
                {
                    chromeOptions.BinaryLocation = this.browserBinaryLocation;
                }
                return ApplyOverriddenOptions(chromeOptions, overriddenOptions);
            case Browser.Edge:
                EdgeDriverConfigOptions edgeConfig = this.driverConfig.Options.Edge ?? new EdgeDriverConfigOptions();
                var edgeOptions = new EdgeOptions();
                if (!string.IsNullOrEmpty(edgeConfig.BrowserVersion))
                {
                    edgeOptions.BrowserVersion = edgeConfig.BrowserVersion;
                }
                edgeOptions.AddArguments("--no-sandbox", "--disable-dev-shm-usage");
                if (this.headless)
                {
                    edgeOptions.AddArgument("--headless");
                }
                if (!string.IsNullOrEmpty(this.browserBinaryLocation))
                {
                    edgeOptions.BinaryLocation = this.browserBinaryLocation;
                }
                return ApplyOverriddenOptions(edgeOptions, overriddenOptions);
            case Browser.IE:
                InternetExplorerDriverConfigOptions internetExplorerConfig = this.driverConfig.Options.InternetExplorer ?? new InternetExplorerDriverConfigOptions();
                return ApplyOverriddenOptions(new InternetExplorerOptions
                {
                    RequireWindowFocus = internetExplorerConfig.RequireWindowFocus,
                    UsePerProcessProxy = internetExplorerConfig.UsePerProcessProxy,
                    AttachToEdgeChrome = internetExplorerConfig.AttachToEdgeChrome,
                }, overriddenOptions);
            case Browser.Firefox:
                FirefoxDriverConfigOptions firefoxConfig = this.driverConfig.Options.Firefox ?? new FirefoxDriverConfigOptions();
                var firefoxOptions = new FirefoxOptions
                {
                    AcceptInsecureCertificates = firefoxConfig.AcceptInsecureCertificates,
                    EnableDevToolsProtocol = firefoxConfig.EnableDevToolsProtocol,
                };
                if (!string.IsNullOrEmpty(firefoxConfig.BrowserVersion))
                {
                    firefoxOptions.BrowserVersion = firefoxConfig.BrowserVersion;
                }
                if (this.headless)
                {
                    firefoxOptions.AddArgument("-headless");
                }
                if (!string.IsNullOrEmpty(this.browserBinaryLocation))
                {
                    firefoxOptions.BinaryLocation = this.browserBinaryLocation;
                }
                return ApplyOverriddenOptions(firefoxOptions, overriddenOptions);
            case Browser.Safari:
                SafariDriverConfigOptions safariConfig = this.driverConfig.Options.Safari ?? new SafariDriverConfigOptions();
                var safariOptions = new SafariOptions();
                if (safariConfig.UseTechnologyPreview)
                {
                    safariOptions.UseTechnologyPreview();
                }
                return ApplyOverriddenOptions(safariOptions, overriddenOptions);
            default:
                throw new InvalidOperationException($"Unsupported browser: {this.browser}");
        }
    }

    private DriverService CreateDriverService()
    {
        return this.browser switch
        {
            Browser.Chrome => ChromeDriverService.CreateDefaultService(),
            Browser.Edge => EdgeDriverService.CreateDefaultService(),
            Browser.IE => InternetExplorerDriverService.CreateDefaultService(),
            Browser.Firefox => FirefoxDriverService.CreateDefaultService(),
            Browser.Safari => SafariDriverService.CreateDefaultService(),
            _ => throw new InvalidOperationException($"Unsupported browser: {this.browser}"),
        };
    }

    private static T ApplyOverriddenOptions<T>(T options, DriverOptions overriddenOptions) where T : DriverOptions
    {
        if (overriddenOptions != null)
        {
            options.PageLoadStrategy = overriddenOptions.PageLoadStrategy;
            options.UnhandledPromptBehavior = overriddenOptions.UnhandledPromptBehavior;
            options.Proxy = overriddenOptions.Proxy;
            options.ScriptTimeout = overriddenOptions.ScriptTimeout;
            options.PageLoadTimeout = overriddenOptions.PageLoadTimeout;
            options.ImplicitWaitTimeout = overriddenOptions.ImplicitWaitTimeout;
            options.UseWebSocketUrl = overriddenOptions.UseWebSocketUrl;
        }

        return options;
    }
}
