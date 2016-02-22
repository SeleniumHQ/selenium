// <copyright file="PhantomJSDriverService.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Globalization;
using System.Reflection;
using System.Text;
using Newtonsoft.Json;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.PhantomJS
{
    /// <summary>
    /// Exposes the service provided by the native PhantomJS executable and GhostDriver JavaScript library.
    /// </summary>
    [JsonObject(MemberSerialization.OptIn)]
    public sealed class PhantomJSDriverService : DriverService
    {
        private static readonly string PhantomJSDriverServiceFileName = PlatformSpecificDriverServiceFileName;
        private static readonly Uri PhantomJSDownloadUrl = new Uri("http://phantomjs.org/download.html");

        private List<string> additionalArguments = new List<string>();
        private string ghostDriverPath = string.Empty;
        private string logFile = string.Empty;
        private string address = string.Empty;
        private string gridHubUrl = string.Empty;

        /// <summary>
        /// Prevents a default instance of the <see cref="PhantomJSDriverService"/> class from being created.
        /// </summary>
        /// <remarks>
        /// This constructor is only used by the unit tests. It should not be
        /// used in any other circumstances.
        /// </remarks>
        [JsonConstructor]
        private PhantomJSDriverService()
            : this(FileUtilities.FindFile(PhantomJSDriverServiceFileName), PhantomJSDriverServiceFileName, PortUtilities.FindFreePort())
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PhantomJSDriverService"/> class.
        /// </summary>
        /// <param name="executablePath">The full path to the PhantomJS executable.</param>
        /// <param name="executableFileName">The file name of the PhantomJS executable.</param>
        /// <param name="port">The port on which the IEDriverServer executable should listen.</param>
        private PhantomJSDriverService(string executablePath, string executableFileName, int port)
            : base(executablePath, port, executableFileName, PhantomJSDownloadUrl)
        {
            this.InitializeProperties();
        }

        // Note: To add support for new PhantomJS command-line arguments, simply add another auto-property
        // with appropriate [JsonProperty] and [DefaultValue] attributes.

        /// <summary>
        /// Gets or sets the file name used to store the persistent cookies.
        /// </summary>
        [JsonProperty("cookiesFile", NullValueHandling = NullValueHandling.Ignore)]
        [CommandLineArgumentName("cookies-file")]
        public string CookiesFile { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the disk cache is enabled (at desktop services cache storage location, default is no).
        /// </summary>
        [JsonProperty("diskCache", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(false)]
        [CommandLineArgumentName("disk-cache")]
        public bool DiskCache { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether SSL errors are ignored, such as expired or self-signed certificate errors (default is no).
        /// </summary>
        [JsonProperty("ignoreSslErrors", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(false)]
        [CommandLineArgumentName("ignore-ssl-errors")]
        public bool IgnoreSslErrors { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether all inlined images are loaded (default is yes).
        /// </summary>
        [JsonProperty("loadImages", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(true)]
        [CommandLineArgumentName("load-images")]
        public bool LoadImages { get; set; }

        /// <summary>
        /// Gets or sets the path to save LocalStorage content and WebSQL content.
        /// </summary>
        [JsonProperty("localStoragePath", NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore)]
        [CommandLineArgumentName("local-storage-path")]
        public string LocalStoragePath { get; set; }

        /// <summary>
        /// Gets or sets the maximum size to allow for data.
        /// </summary>
        [JsonProperty("localStorageQuota", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(0)]
        [CommandLineArgumentName("local-storage-quota")]
        public int LocalStorageQuota { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether local content is allowed to access remote URL (default is no).
        /// </summary>
        [JsonProperty("localToRemoteUrlAccess", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(false)]
        [CommandLineArgumentName("local-to-remote-url-access")]
        public bool LocalToRemoteUrlAccess { get; set; }

        /// <summary>
        /// Gets or sets the size limit of the disk cache in KB.
        /// </summary>
        [JsonProperty("maxDiskCacheSize", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(0)]
        [CommandLineArgumentName("max-disk-cache-size")]
        public int MaxDiskCacheSize { get; set; }

        /// <summary>
        /// Gets or sets the encoding used for terminal output (default is "utf8").
        /// </summary>
        [JsonProperty("outputEncoding", NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue("utf8")]
        [CommandLineArgumentName("output-encoding")]
        public string OutputEncoding { get; set; }

        /// <summary>
        /// Gets or sets the proxy server information (in the format of {address} or {address}:{port}).
        /// </summary>
        [JsonProperty("proxy", NullValueHandling = NullValueHandling.Ignore)]
        [CommandLineArgumentName("proxy")]
        public string Proxy { get; set; }

        /// <summary>
        /// Gets or sets the type of the proxy server ('http', 'socks5' or 'none').
        /// </summary>
        [JsonProperty("proxyType", NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue("http")]
        [CommandLineArgumentName("proxy-type")]
        public string ProxyType { get; set; }

        /// <summary>
        /// Gets or sets the proxy authentication info (e.g. username:password).
        /// </summary>
        [JsonProperty("proxyAuth", NullValueHandling = NullValueHandling.Ignore)]
        [CommandLineArgumentName("proxy-auth")]
        public string ProxyAuthentication { get; set; }

        /// <summary>
        /// Gets or sets the encoding used for the starting script (default is "utf8").
        /// </summary>
        [JsonProperty("scriptEncoding", NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue("utf8")]
        [CommandLineArgumentName("script-encoding")]
        public string ScriptEncoding { get; set; }

        /// <summary>
        /// Gets or sets the SSL protocol for secure connections ('sslv3' (default), 'sslv2', 'tlsv1' or 'any').
        /// </summary>
        [JsonProperty("sslProtocol", NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue("SSLv3")]
        [CommandLineArgumentName("ssl-protocol")]
        public string SslProtocol { get; set; }

        /// <summary>
        /// Gets or sets the location for custom CA certificates (if none set, uses system default).
        /// </summary>
        [JsonProperty("sslCertificatesPath", NullValueHandling = NullValueHandling.Ignore)]
        [CommandLineArgumentName("ssl-certificates-path")]
        public string SslCertificatesPath { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether web security is enabled and forbids cross-domain XHR (default is yes).
        /// </summary>
        [JsonProperty("webSecurity", NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(true)]
        [CommandLineArgumentName("web-security")]
        public bool WebSecurity { get; set; }

        /// <summary>
        /// Gets or sets the location where the GhostDriver JavaScript file is located. This
        /// allows the use of an external implementation of GhostDriver instead of the
        /// implementation embedded inside the PhantomJS executable.
        /// </summary>
        [JsonIgnore]
        public string GhostDriverPath
        {
            get { return this.ghostDriverPath; }
            set { this.ghostDriverPath = value; }
        }

        /// <summary>
        /// Gets or sets the IP address to use when starting the GhostDriver implementation
        /// embedded in PhantomJS.
        /// </summary>
        [JsonIgnore]
        public string IPAddress
        {
            get { return this.address; }
            set { this.address = value; }
        }

        /// <summary>
        /// Gets or sets the URL of a Selenium Grid hub with which this PhantomJS instance should register.
        /// </summary>
        [JsonIgnore]
        public string GridHubUrl
        {
            get { return this.gridHubUrl; }
            set { this.gridHubUrl = value; }
        }

        /// <summary>
        /// Gets or sets the location of the log file to which PhantomJS will write log
        /// output. If this value is <see langword="null"/> or an empty string, the log
        /// output will be written to the console window.
        /// </summary>
        public string LogFile
        {
            get { return this.logFile; }
            set { this.logFile = value; }
        }

        /// <summary>
        /// Gets the list of arguments appended to the PhantomJS command line as a string array.
        /// </summary>
        [JsonIgnore]
        public ReadOnlyCollection<string> AdditionalArguments
        {
            // We don't want the arguments to be serialized to the JSON-based configuration that could be
            // subsequently passed to the PhantomJS.exe process using the --config=<path> argument.
            // They're only used to provide a facility to add arguments that are not yet explicitly supported by this API
            // for the launching of the 'PhantomJS.exe' service process.
            get { return this.additionalArguments.AsReadOnly(); }
        }

        /// <summary>
        /// Gets or sets the path to the JSON configuration file (in lieu of providing any other parameters).
        /// </summary>
        /// <remarks>If a <see cref="PhantomJSDriverService"/> instance is serialized to JSON, it can be saved to a
        /// file and used as a JSON configuration source for the PhantomJS.exe process.</remarks>
        /// <example>
        /// <code>
        /// var configOptions = PhantomJSDriverService.CreateDefaultService()
        /// {
        ///     CookiesFile = "cookiesFile",
        ///     DiskCache = true,
        ///     IgnoreSslErrors = true,
        ///     LoadImages = true,
        ///     LocalToRemoteUrlAccess = true,
        ///     MaxDiskCacheSize = 1000,
        ///     OutputEncoding = "abc",
        ///     Proxy = "address:999",
        ///     ProxyType = "socks5",
        ///     ScriptEncoding = "def",
        ///     SslProtocol = "sslv2",
        ///     WebSecurity = true,
        /// };
        ///
        /// string json = configOptions.ToJson();
        ///
        /// File.WriteAllText(@"C:\temp\myconfig.json", json);
        ///
        /// var driverService = PhantomJSDriver.CreateDefaultService();
        /// driverService.ConfigFile = @"C:\temp\myconfig.json";
        ///
        /// var driver = new PhantomJSDriver(driverService);  // Launches PhantomJS.exe using JSON configuration file.
        /// </code>
        /// </example>
        [JsonIgnore]
        public string ConfigFile { get; set; } // Not serialized because it is used to pass the JSON configuration path to PhantomJS.exe, and should not appear in the JSON configuration.

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected override string CommandLineArguments
        {
            get
            {
                StringBuilder argsBuilder = new StringBuilder();
                if (!string.IsNullOrEmpty(this.ConfigFile))
                {
                    argsBuilder.AppendFormat(" --config={0}", this.ConfigFile);
                }
                else
                {
                    // These are all command-line args for PhantomJS proper, and
                    // must be placed before the "main.js" file argument if running
                    // with a non-embedded version of GhostDriver.
                    var properties = typeof(PhantomJSDriverService).GetProperties();
                    foreach (PropertyInfo info in properties)
                    {
                        if (IsSerializableProperty(info))
                        {
                            object propertyValue = info.GetValue(this, null);
                            object defaultValue = GetPropertyDefaultValue(info);
                            if (propertyValue != null && !propertyValue.Equals(defaultValue))
                            {
                                string argumentName = GetPropertyCommandLineArgName(info);
                                string argumentValue = this.GetPropertyCommandLineArgValue(info);
                                argsBuilder.AppendFormat(" --{0}={1}", argumentName, argumentValue);
                            }
                        }
                    }
                }

                if (string.IsNullOrEmpty(this.ghostDriverPath))
                {
                    if (string.IsNullOrEmpty(this.address))
                    {
                        argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --webdriver={0}", this.Port);
                    }
                    else
                    {
                        argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --webdriver={0}:{1}", this.address, this.Port);
                    }

                    if (!string.IsNullOrEmpty(this.logFile))
                    {
                        argsBuilder.AppendFormat(" --webdriver-logfile=\"{0}\"", this.logFile);
                    }

                    if (!string.IsNullOrEmpty(this.gridHubUrl))
                    {
                        argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --webdriver-selenium-grid-hub={0}", this.gridHubUrl);
                    }
                }
                else
                {
                    argsBuilder.AppendFormat(" \"{0}\"", this.ghostDriverPath);
                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --port={0}", this.Port);
                    if (!string.IsNullOrEmpty(this.logFile))
                    {
                        argsBuilder.AppendFormat(" --logFile=\"{0}\"", this.logFile);
                    }
                }

                if (this.additionalArguments.Count > 0)
                {
                    foreach (string additionalArg in this.additionalArguments)
                    {
                        if (!string.IsNullOrEmpty(additionalArg.Trim()))
                        {
                            argsBuilder.AppendFormat(" {0}", additionalArg);
                        }
                    }
                }

                return argsBuilder.ToString();
            }
        }

        private static string PlatformSpecificDriverServiceFileName
        {
            get
            {
                return Platform.CurrentPlatform.IsPlatformType(PlatformType.Unix) ? "phantomjs" : "PhantomJS.exe";
            }
        }

        /// <summary>
        /// Creates a default instance of the PhantomJSDriverService.
        /// </summary>
        /// <returns>A PhantomJSDriverService that implements default settings.</returns>
        public static PhantomJSDriverService CreateDefaultService()
        {
            string serviceDirectory = DriverService.FindDriverServiceExecutable(PhantomJSDriverServiceFileName, PhantomJSDownloadUrl);
            return CreateDefaultService(serviceDirectory);
        }

        /// <summary>
        /// Creates a default instance of the PhantomJSDriverService using a specified path to the PhantomJS executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the PhantomJS executable.</param>
        /// <returns>A PhantomJSDriverService using a random port.</returns>
        public static PhantomJSDriverService CreateDefaultService(string driverPath)
        {
            return CreateDefaultService(driverPath, PhantomJSDriverServiceFileName);
        }

        /// <summary>
        /// Creates a default instance of the PhantomJSDriverService using a specified path to the PhantomJS executable with the given name.
        /// </summary>
        /// <param name="driverPath">The directory containing the PhantomJS executable.</param>
        /// <param name="driverExecutableFileName">The name of the PhantomJS executable file.</param>
        /// <returns>A PhantomJSDriverService using a random port.</returns>
        public static PhantomJSDriverService CreateDefaultService(string driverPath, string driverExecutableFileName)
        {
            return new PhantomJSDriverService(driverPath, driverExecutableFileName, PortUtilities.FindFreePort());
        }

        /// <summary>
        /// Adds a single argument to the list of arguments to be appended to the PhantomJS.exe command line.
        /// </summary>
        /// <param name="argument">The argument to add.</param>
        public void AddArgument(string argument)
        {
            if (string.IsNullOrEmpty(argument))
            {
                throw new ArgumentException("argument must not be null or empty", "argument");
            }

            this.AddArguments(argument);
        }

        /// <summary>
        /// Adds arguments to be appended to the PhantomJS.exe command line.
        /// </summary>
        /// <param name="arguments">An array of arguments to add.</param>
        public void AddArguments(params string[] arguments)
        {
            this.AddArguments(new List<string>(arguments));
        }

        /// <summary>
        /// Adds arguments to be appended to the PhantomJS.exe command line.
        /// </summary>
        /// <param name="arguments">An <see cref="IEnumerable{T}"/> object of arguments to add.</param>
        public void AddArguments(IEnumerable<string> arguments)
        {
            if (arguments == null)
            {
                throw new ArgumentNullException("arguments", "arguments must not be null");
            }

            this.additionalArguments.AddRange(arguments);
        }

        /// <summary>
        /// Serializes the service options to JSON to be used as a configuration file for PhantomJS.exe (via the --config argument).
        /// </summary>
        /// <returns>The JSON representation of the configured service options.</returns>
        public string ToJson()
        {
            return JsonConvert.SerializeObject(this, Formatting.Indented);
        }

        private static object GetPropertyDefaultValue(PropertyInfo info)
        {
            object[] customAttributes = info.GetCustomAttributes(typeof(DefaultValueAttribute), false);
            if (customAttributes.Length > 0)
            {
                // Should be one and only one DefaultValue attribute, so just take the one at index 0.
                DefaultValueAttribute defaultValueAttribute = customAttributes[0] as DefaultValueAttribute;
                if (defaultValueAttribute != null)
                {
                    return defaultValueAttribute.Value;
                }
            }
            else
            {
                if (info.PropertyType.IsValueType)
                {
                    return Activator.CreateInstance(info.PropertyType);
                }
            }

            return null;
        }

        private static string GetPropertyCommandLineArgName(PropertyInfo info)
        {
            object[] customAttributes = info.GetCustomAttributes(typeof(CommandLineArgumentNameAttribute), false);
            if (customAttributes.Length > 0)
            {
                // Should be one and only one DefaultValue attribute, so just take the one at index 0.
                CommandLineArgumentNameAttribute argNameAttribute = customAttributes[0] as CommandLineArgumentNameAttribute;
                if (argNameAttribute != null)
                {
                    return argNameAttribute.Name;
                }
            }

            return null;
        }

        private static bool IsSerializableProperty(PropertyInfo info)
        {
            var attributes = info.GetCustomAttributes(typeof(JsonPropertyAttribute), true);
            return attributes.Length > 0;
        }

        private string GetPropertyCommandLineArgValue(PropertyInfo info)
        {
            object propertyValue = info.GetValue(this, null);
            if (info.PropertyType == typeof(string))
            {
                string actualValue = propertyValue.ToString();
                if (actualValue.Contains(" "))
                {
                    return string.Format(CultureInfo.InvariantCulture, "\"{0}\"", actualValue);
                }
                else
                {
                    return actualValue;
                }
            }
            else if (info.PropertyType == typeof(bool))
            {
                return (bool)propertyValue ? "true" : "false";
            }

            return propertyValue.ToString();
        }

        private void InitializeProperties()
        {
            // Iterate through properties using DefaultValue attributes to assign appropriate default values
            foreach (var propertyInfo in typeof(PhantomJSDriverService).GetProperties())
            {
                if (IsSerializableProperty(propertyInfo))
                {
                    object defaultValue = GetPropertyDefaultValue(propertyInfo);
                    if (defaultValue != null)
                    {
                        propertyInfo.SetValue(this, defaultValue, null);
                    }
                }
            }
        }
    }
}
