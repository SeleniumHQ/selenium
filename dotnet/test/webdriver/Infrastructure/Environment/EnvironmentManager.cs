// <copyright file="EnvironmentManager.cs" company="Selenium Committers">
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
using System.Runtime.InteropServices;
using System.Text.Json;
using Bazel;
using OpenQA.Selenium.Testing.WebServer;

namespace OpenQA.Selenium.Tests.Infrastructure.Environment;

public class EnvironmentManager
{
    private static EnvironmentManager instance;
    private readonly Type driverType;
    private IWebDriver driver;
    private readonly DriverFactory driverFactory;

    private EnvironmentManager()
    {
        string dataFilePath;
        Runfiles runfiles = null;
        try
        {
            runfiles = Runfiles.Create();
            dataFilePath = runfiles.Rlocation("_main/dotnet/test/webdriver/appconfig.json");
        }
        catch (FileNotFoundException)
        {
            dataFilePath = "appconfig.json";
        }
        string currentDirectory = this.CurrentDirectory;

        string content = File.ReadAllText(dataFilePath);
        TestEnvironment env = JsonSerializer.Deserialize<TestEnvironment>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        string activeDriverConfig = System.Environment.GetEnvironmentVariable("ACTIVE_DRIVER_CONFIG") ?? TestContext.Parameters.Get("ActiveDriverConfig", env.ActiveDriverConfig);
        string driverServiceLocation = System.Environment.GetEnvironmentVariable("DRIVER_SERVICE_LOCATION") ?? TestContext.Parameters.Get("DriverServiceLocation", env.DriverServiceLocation);

        string browserLocation = System.Environment.GetEnvironmentVariable("BROWSER_LOCATION") ?? TestContext.Parameters.Get("BrowserLocation", string.Empty);

        DriverConfig driverConfig = env.DriverConfigs[activeDriverConfig];

        this.driverFactory = new DriverFactory(driverServiceLocation, browserLocation);
        this.driverFactory.DriverStarting += OnDriverStarting;

        // Search for the driver type in the all assemblies,
        // bazel uses unpredictable assembly names to execute tests
        driverType = AppDomain.CurrentDomain.GetAssemblies()
            .AsEnumerable()
            .Reverse()
            .Select(assembly => assembly.GetType(driverConfig.DriverTypeName))
            .FirstOrDefault(t => t != null);

        if (driverType == null)
        {
            throw new ArgumentOutOfRangeException($"Unable to find driver type {driverConfig.DriverTypeName}");
        }

        Browser = driverConfig.BrowserValue;
        RemoteCapabilities = driverConfig.RemoteCapabilities;

        WebServer = new AppServer();
        var (httpUrl, httpsUrl) = WebServer.StartAsync().Result;

        UrlBuilder = new UrlBuilder(httpUrl, httpsUrl);

        // Find selenium-manager binary.
        try
        {
            string managerFilePath = "";
            runfiles ??= Runfiles.Create();

            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                managerFilePath = runfiles.Rlocation("_main/dotnet/src/webdriver/manager/windows/selenium-manager.exe");
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                managerFilePath = runfiles.Rlocation("_main/dotnet/src/webdriver/manager/linux/selenium-manager");
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                managerFilePath = runfiles.Rlocation("_main/dotnet/src/webdriver/manager/macos/selenium-manager");
            }

            System.Environment.SetEnvironmentVariable("SE_MANAGER_PATH", managerFilePath);
        }
        catch (FileNotFoundException)
        {
            // Use the default one.
        }

        string projectRoot = System.Environment.GetEnvironmentVariable("TEST_SRCDIR");
        if (!string.IsNullOrEmpty(projectRoot))
        {
            projectRoot += "/_main";
        }
        else
        {
            projectRoot = FindProjectRoot(currentDirectory);
        }

        bool autoStartRemoteServer = false;
        if (Browser == Browser.Remote)
        {
            autoStartRemoteServer = driverConfig.AutoStartRemoteServer;
        }

        RemoteServer = new RemoteSeleniumServer(projectRoot, autoStartRemoteServer);
    }

    ~EnvironmentManager()
    {
        RemoteServer?.StopAsync().Wait();
        WebServer?.StopAsync().Wait();
        CloseCurrentDriver();
    }

    public event EventHandler<DriverStartingEventArgs> DriverStarting;

    public static EnvironmentManager Instance => instance ??= new EnvironmentManager();

    public Browser Browser { get; }

    public string CurrentDirectory
    {
        get
        {
            string assemblyLocation = Path.GetDirectoryName(typeof(EnvironmentManager).Assembly.Location);
            string testDirectory = TestContext.CurrentContext.TestDirectory;
            if (assemblyLocation != testDirectory)
            {
                return assemblyLocation;
            }
            return testDirectory;
        }
    }

    public AppServer WebServer { get; }

    public RemoteSeleniumServer RemoteServer { get; }

    public string RemoteCapabilities { get; }

    public UrlBuilder UrlBuilder { get; }

    public IWebDriver GetCurrentDriver()
    {
        return driver ?? CreateFreshDriver();
    }

    public IWebDriver CreateDriverInstance()
    {
        return driverFactory.CreateDriver(driverType);
    }

    public IWebDriver CreateDriverInstance(DriverOptions options)
    {
        return driverFactory.CreateDriverWithOptions(driverType, options);
    }

    public IWebDriver CreateFreshDriver()
    {
        CloseCurrentDriver();
        driver = CreateDriverInstance();
        return driver;
    }

    public void CloseCurrentDriver()
    {
        driver?.Quit();
        driver = null;
    }

    protected void OnDriverStarting(object sender, DriverStartingEventArgs e)
    {
        this.DriverStarting?.Invoke(sender, e);
    }

    private static string FindProjectRoot(string startDirectory)
    {
        // Walk up until we find a directory containing common/ and dotnet/
        DirectoryInfo info = new DirectoryInfo(startDirectory);
        while (info is not null && info != info.Root)
        {
            if (Directory.Exists(Path.Combine(info.FullName, "common"))
                && Directory.Exists(Path.Combine(info.FullName, "dotnet")))
            {
                return info.FullName;
            }
            info = info.Parent;
        }

        return startDirectory;
    }
}
