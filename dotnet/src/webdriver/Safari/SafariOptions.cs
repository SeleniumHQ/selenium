// <copyright file="SafariOptions.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.Safari;

/// <summary>
/// Class to manage options specific to <see cref="SafariDriver"/>
/// </summary>
/// <example>
/// <code>
/// SafariOptions options = new SafariOptions();
/// options.SkipExtensionInstallation = true;
/// </code>
/// <para></para>
/// <para>For use with SafariDriver:</para>
/// <para></para>
/// <code>
/// SafariDriver driver = new SafariDriver(options);
/// </code>
/// <para></para>
/// <para>For use with RemoteWebDriver:</para>
/// <para></para>
/// <code>
/// RemoteWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/wd/hub"), options.ToCapabilities());
/// </code>
/// </example>
public class SafariOptions : DriverOptions
{
    private const string BrowserNameValue = "safari";
    private const string EnableAutomaticInspectionSafariOption = "safari:automaticInspection";
    private const string EnableAutomaticProfilingSafariOption = "safari:automaticProfiling";

    /// <summary>
    /// Initializes a new instance of the <see cref="SafariOptions"/> class.
    /// </summary>
    public SafariOptions() : base()
    {
        this.BrowserName = BrowserNameValue;
        this.TechnologyPreview = false;
        this.AddKnownCapabilityName(SafariOptions.EnableAutomaticInspectionSafariOption, "EnableAutomaticInspection property");
        this.AddKnownCapabilityName(SafariOptions.EnableAutomaticProfilingSafariOption, "EnableAutomaticProfiling property");
    }

    /// <summary>
    /// Allows the Options class to be used with a Safari Technology Preview driver
    /// </summary>
    public void UseTechnologyPreview()
    {
        this.TechnologyPreview = true;
        this.BrowserName = "Safari Technology Preview";
    }

    /// <summary>
    /// Gets or sets a value indicating whether to have the driver preload the
    /// Web Inspector and JavaScript debugger in the background.
    /// </summary>
    public bool TechnologyPreview { get; private set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether to have the driver preload the
    /// Web Inspector and JavaScript debugger in the background.
    /// </summary>
    public bool EnableAutomaticInspection { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether to have the driver preload the
    /// Web Inspector and start a timeline recording in the background.
    /// </summary>
    public bool EnableAutomaticProfiling { get; set; } = false;

    /// <summary>
    /// Returns ICapabilities for Safari with these options included as
    /// capabilities. This copies the options. Further changes will not be
    /// reflected in the returned capabilities.
    /// </summary>
    /// <returns>The ICapabilities for Safari with these options.</returns>
    public override ICapabilities ToCapabilities()
    {
        IWritableCapabilities capabilities = this.GenerateDesiredCapabilities(true);
        if (this.EnableAutomaticInspection)
        {
            capabilities.SetCapability(EnableAutomaticInspectionSafariOption, true);
        }

        if (this.EnableAutomaticProfiling)
        {
            capabilities.SetCapability(EnableAutomaticProfilingSafariOption, true);
        }

        return capabilities.AsReadOnly();
    }
}
