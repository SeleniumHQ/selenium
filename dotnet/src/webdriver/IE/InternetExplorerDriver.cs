// <copyright file="InternetExplorerDriver.cs" company="Selenium Committers">
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

using OpenQA.Selenium.Remote;
using System;
using System.IO;

namespace OpenQA.Selenium.IE;

/// <summary>
/// Provides a way to access Internet Explorer to run your tests by creating a InternetExplorerDriver instance
/// </summary>
/// <remarks>
/// When the WebDriver object has been instantiated the browser will load. The test can then navigate to the URL under test and
/// start your test.
/// </remarks>
/// <example>
/// <code>
/// [TestFixture]
/// public class Testing
/// {
///     private IWebDriver driver;
///     <para></para>
///     [SetUp]
///     public void SetUp()
///     {
///         driver = new InternetExplorerDriver();
///     }
///     <para></para>
///     [Test]
///     public void TestGoogle()
///     {
///         driver.Navigate().GoToUrl("http://www.google.co.uk");
///         /*
///         *   Rest of the test
///         */
///     }
///     <para></para>
///     [TearDown]
///     public void TearDown()
///     {
///         driver.Quit();
///         driver.Dispose();
///     }
/// }
/// </code>
/// </example>
public class InternetExplorerDriver : WebDriver
{
    /// <summary>
    /// Initializes a new instance of the <see cref="InternetExplorerDriver"/> class.
    /// </summary>
    public InternetExplorerDriver()
        : this(new InternetExplorerOptions())
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="InternetExplorerDriver"/> class with the desired
    /// options.
    /// </summary>
    /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="options"/> is <see langword="null"/>.</exception>
    public InternetExplorerDriver(InternetExplorerOptions options)
        : this(InternetExplorerDriverService.CreateDefaultService(), options)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="InternetExplorerDriver"/> class using the specified driver service.
    /// </summary>
    /// <param name="service">The <see cref="InternetExplorerDriverService"/> used to initialize the driver.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="service"/> is <see langword="null"/>.</exception>
    public InternetExplorerDriver(InternetExplorerDriverService service)
        : this(service, new InternetExplorerOptions())
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="InternetExplorerDriver"/> class using the specified path
    /// to the directory containing <c>IEDriverServer.exe</c>.
    /// </summary>
    /// <param name="internetExplorerDriverServerDirectory">The full path to the directory containing <c>IEDriverServer.exe</c>.</param>
    public InternetExplorerDriver(string internetExplorerDriverServerDirectory)
        : this(internetExplorerDriverServerDirectory, new InternetExplorerOptions())
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="InternetExplorerDriver"/> class using the specified path
    /// to the directory containing <c>IEDriverServer.exe</c> and options.
    /// </summary>
    /// <param name="internetExplorerDriverServerDirectory">The full path to the directory containing <c>IEDriverServer.exe</c>.</param>
    /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="options"/> is <see langword="null"/>.</exception>
    public InternetExplorerDriver(string internetExplorerDriverServerDirectory, InternetExplorerOptions options)
        : this(internetExplorerDriverServerDirectory, options, RemoteWebDriver.DefaultCommandTimeout)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="InternetExplorerDriver"/> class using the specified path
    /// to the directory containing <c>IEDriverServer.exe</c>, options, and command timeout.
    /// </summary>
    /// <param name="internetExplorerDriverServerDirectory">The full path to the directory containing <c>IEDriverServer.exe</c>.</param>
    /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
    /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="options"/> is <see langword="null"/>.</exception>
    public InternetExplorerDriver(string internetExplorerDriverServerDirectory, InternetExplorerOptions options, TimeSpan commandTimeout)
        : this(InternetExplorerDriverService.CreateDefaultService(internetExplorerDriverServerDirectory), options, commandTimeout)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="InternetExplorerDriver"/> class using the specified
    /// <see cref="InternetExplorerDriverService"/> and options.
    /// </summary>
    /// <param name="service">The <see cref="DriverService"/> to use.</param>
    /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="service"/> or <paramref name="options"/> are <see langword="null"/>.</exception>
    public InternetExplorerDriver(InternetExplorerDriverService service, InternetExplorerOptions options)
        : this(service, options, RemoteWebDriver.DefaultCommandTimeout)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="InternetExplorerDriver"/> class using the specified
    /// <see cref="DriverService"/>, <see cref="InternetExplorerOptions"/>, and command timeout.
    /// </summary>
    /// <param name="service">The <see cref="InternetExplorerDriverService"/> to use.</param>
    /// <param name="options">The <see cref="InternetExplorerOptions"/> used to initialize the driver.</param>
    /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="service"/> or <paramref name="options"/> are <see langword="null"/>.</exception>
    public InternetExplorerDriver(InternetExplorerDriverService service, InternetExplorerOptions options, TimeSpan commandTimeout)
        : base(GenerateDriverServiceCommandExecutor(service, options, commandTimeout), ConvertOptionsToCapabilities(options))
    {
    }

    /// <summary>
    /// Uses DriverFinder to set Service attributes if necessary when creating the command executor
    /// </summary>
    /// <param name="service"></param>
    /// <param name="commandTimeout"></param>
    /// <param name="options"></param>
    /// <returns></returns>
    private static ICommandExecutor GenerateDriverServiceCommandExecutor(DriverService service, DriverOptions options, TimeSpan commandTimeout)
    {
        if (service is null)
        {
            throw new ArgumentNullException(nameof(service));
        }

        if (options is null)
        {
            throw new ArgumentNullException(nameof(options));
        }

        if (service.DriverServicePath == null)
        {
            DriverFinder finder = new DriverFinder(options);
            string fullServicePath = finder.GetDriverPath();
            service.DriverServicePath = Path.GetDirectoryName(fullServicePath);
            service.DriverServiceExecutableName = Path.GetFileName(fullServicePath);
        }
        return new DriverServiceCommandExecutor(service, commandTimeout);
    }

    /// <summary>
    /// Gets or sets the <see cref="IFileDetector"/> responsible for detecting
    /// sequences of keystrokes representing file paths and names.
    /// </summary>
    /// <remarks>The IE driver does not allow a file detector to be set,
    /// as the server component of the IE driver (<c>IEDriverServer.exe</c>) only
    /// allows uploads from the local computer environment. Attempting to set
    /// this property has no effect, but does not throw an exception. If you
    /// are attempting to run the IE driver remotely, use <see cref="RemoteWebDriver"/>
    /// in conjunction with a standalone WebDriver server.</remarks>
    public override IFileDetector FileDetector
    {
        get => base.FileDetector;
        set { }
    }

    private static ICapabilities ConvertOptionsToCapabilities(InternetExplorerOptions options)
    {
        if (options == null)
        {
            throw new ArgumentNullException(nameof(options), "options must not be null");
        }

        return options.ToCapabilities();
    }
}
