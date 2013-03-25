// <copyright file="PhantomJSDriverService.cs" company="WebDriver Committers">
// Copyright 2007-2012 WebDriver committers
// Copyright 2007-2012 Google Inc.
// Portions copyright 2012 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
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
        private const string PhantomJSDriverServiceFileName = "PhantomJS.exe";
        private static readonly Uri PhantomJSDownloadUrl    = new Uri("http://phantomjs.org/download.html");

        /// <summary>
        /// Initializes a new instance of the PhantomJSDriverService class.
        /// </summary>
        /// <param name="executable">The full path to the PhantomJS executable.</param>
        /// <param name="port">The port on which the IEDriverServer executable should listen.</param>
        private PhantomJSDriverService(string executable, int port)
            : base(executable, port, PhantomJSDriverServiceFileName, PhantomJSDownloadUrl)
        {
        }

        /// <summary>
        /// Gets the command-line arguments for the driver service.
        /// </summary>
        protected override string CommandLineArguments
        {
            get
            {
                // Initialize the command-line arguments to launch PhantomJS using the embedded GhostDriver
                StringBuilder argsBuilder = new StringBuilder();
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --webdriver={0}", this.Port);

                // Apply explicitly-supported command line arguments for the PhantomJS-specific options
                ApplyExplicitPhantomJSCommandLineArguments(argsBuilder);

                // Apply additional arguments supplied by the client (to enable future arguments to be supported in some fashion)
                ApplyAdditionalArguments(argsBuilder);

                return argsBuilder.ToString();
            }
        }

        private void ApplyAdditionalArguments(StringBuilder argsBuilder)
        {
            if (arguments.Count > 0)
                argsBuilder.Append(" " + string.Join(" ", arguments));
        }

        private void ApplyExplicitPhantomJSCommandLineArguments(StringBuilder argsBuilder)
        {
            // If config option is specified, it replaces all other options
            if (!string.IsNullOrWhiteSpace(Config))
            {
                argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --config={0}",
                                         ProcessStringArgumentForCommandLine(Config));
                return;
            }

            // Process all serializable properties, i.e. all properties opting in using "[JsonProperty]" 
            // (which should only be properties for PhantomJS.exe command-line arguments)
            var properties = GetSerializableProperties();

            foreach (var property in properties)
            {
                // If value is not the defined default value for the argument...
                if (!IsDefaultValue(property))
                {
                    // Prepare the command-line argument
                    var argumentName = GetArgumentName(property);
                    var argumentValue = GetArgumentValue(property);

                    argsBuilder.AppendFormat(CultureInfo.InvariantCulture, " --{0}={1}", argumentName, argumentValue);
                }
            }
        }

        #region ApplyExplicitPhantomJSCommandLineArguments support methods

        private object GetArgumentValue(PropertyInfo property)
        {
            // Get the current value for the property
            object propertyValue = property.GetValue(this, null);

            object argumentValue;

            if (property.PropertyType == typeof(string))
            {
                // Wrap string arguments with embedded spaces in quotes
                argumentValue = ProcessStringArgumentForCommandLine(propertyValue.ToString());
            }
            else if (property.PropertyType == typeof(bool))
            {
                // Convert booleans to yes/no
                argumentValue = Convert.ToBoolean(propertyValue) ? "yes" : "no";
            }
            else
            {
                argumentValue = propertyValue;
            }

            return argumentValue;
        }

        private static string GetArgumentName(PropertyInfo property)
        {
            // Translate, by convention, the property name into the PhantomJS.exe argument name
            // (i.e. convert mixed case property name to a hyphenated lower case name)
            return Regex.Replace(property.Name, "([A-Z](?=[A-Z])|[A-Z][a-z0-9]+)", "$1-").TrimEnd('-').ToLower();
        }

        private static IEnumerable<PropertyInfo> GetSerializableProperties()
        {
            var serializableProperties =
                from p in typeof(PhantomJSDriverService).GetProperties()
                where p.GetCustomAttributes(typeof(JsonPropertyAttribute), true).Any()
                select p;
            
            return serializableProperties;
        }

        private bool IsDefaultValue(PropertyInfo property)
        {
            object currentValue = property.GetValue(this, null);
            object defaultValue = GetDefaultValue(property);

            if (currentValue == null)
                return defaultValue == null;

            return currentValue.Equals(defaultValue);
        }

        private static object GetDefaultValue(PropertyInfo property)
        {
            object defaultValue;

            // Try to get defined "default" value (from the [DefaultValue] attribute on property)
            var defaultValueAttribute =
                property.GetCustomAttributes(typeof(DefaultValueAttribute), false).SingleOrDefault() as DefaultValueAttribute;

            if (defaultValueAttribute != null)
            {
                // Use defined default value
                defaultValue = defaultValueAttribute.Value;
            }
            else
            {
                // Use .NET default value
                defaultValue = GetDotNetDefaultValue(property);
            }

            return defaultValue;
        }

        private static object GetDotNetDefaultValue(PropertyInfo property)
        {
            if (property.PropertyType.IsValueType)
                return Activator.CreateInstance(property.PropertyType);

            // Default for reference types is null
            return null;
        }

        private string ProcessStringArgumentForCommandLine(string value)
        {
            // Wrap arguments in quotes if they contain spaces
            if (value.Contains(" "))
                return string.Format("\"{0}\"", value);

            return value;
        }

        #endregion

        #region Explicitly-supported PhantomJS command-line arguments

        /// <summary>
        /// Specifies the file name to store the persistent cookies.
        /// </summary>
        [JsonProperty("cookiesFile", NullValueHandling = NullValueHandling.Ignore)]
        public string CookiesFile { get; set; }

        /// <summary>
        /// Specifies the path to the JSON configuration file (in lieu of providing any other parameters).
        /// </summary>
        /// <remarks>If a <see cref="PhantomJSDriverService"/> instance  is serialized to JSON, it can be saved to a 
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
        /// driverService.Config = @"C:\temp\myconfig.json";
        /// 
        /// var driver = new PhantomJSDriver(driverService);  // Launches PhantomJS.exe using JSON configuration file.
        /// </code>
        /// </example>
        public string Config { get; set; }  // Not serialized because it is used to pass the JSON configuration path to PhantomJS.exe, and should not appear in the JSON configuration.

        /// <summary>
        /// Enables disk cache (at desktop services cache storage location, default is no).
        /// </summary>
        [JsonProperty("diskCache", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(false)]
        public bool DiskCache { get; set; }

        /// <summary>
        /// Ignores SSL errors, such as expired or self-signed certificate errors (default is no).
        /// </summary>
        [JsonProperty("ignoreSslErrors", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(false)]
        public bool IgnoreSslErrors { get; set; }

        /// <summary>
        /// Load all inlined images (default is yes).
        /// </summary>
        [JsonProperty("loadImages", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(true)]
        public bool LoadImages { get; set; }

        /// <summary>
        /// Allows local content to access remote URL (default is no).
        /// </summary>
        [JsonProperty("localToRemoteUrlAccess", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(false)]
        public bool LocalToRemoteUrlAccess { get; set; }

        /// <summary>
        /// Limits the size of disk cache (in KB).
        /// </summary>
        [JsonProperty("maxDiskCacheSize", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(0)]
        public int MaxDiskCacheSize { get; set; }

        /// <summary>
        /// Sets the encoding used for terminal output (default is "utf8").
        /// </summary>
        [JsonProperty("outputEncoding", NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue("utf8")]
        public string OutputEncoding { get; set; }

        /// <summary>
        /// Specifies the proxy server information (in the format of {address} or {address}:{port}).
        /// </summary>
        [JsonProperty("proxy", NullValueHandling = NullValueHandling.Ignore)]
        public string Proxy { get; set; }

        /// <summary>
        /// The type of the proxy server ('http', 'socks5' or 'none').
        /// </summary>
        [JsonProperty("proxyType", NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue("http")]
        public string ProxyType { get; set; }

        /// <summary>
        /// Sets the encoding used for the starting script (default is "utf8").
        /// </summary>
        [JsonProperty("scriptEncoding", NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue("utf8")]
        public string ScriptEncoding { get; set; }

        /// <summary>
        /// Enables web security and forbids cross-domain XHR (default is yes).
        /// </summary>
        [JsonProperty("webSecurity", NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue(true)]
        public bool WebSecurity { get; set; }

        /// <summary>
        /// Sets the SSL protocol for secure connections ('sslv3' (default), 'sslv2', 'tlsv1' or 'any').
        /// </summary>
        [JsonProperty("sslProtocol", NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore)]
        [DefaultValue("SSLv3")]
        public string SslProtocol { get; set; }

        // Note: To add support for new PhantomJS command-line arguments, simply add another auto-property 
        // with appropriate [JsonProperty] and [DefaultValue] attributes.

        #endregion

        #region Generic command-line arguments support

        private List<string> arguments = new List<string>();

        /// <summary>
        /// Gets the list of arguments appended to the PhantomJS command line as a string array.
        /// </summary>
        public ReadOnlyCollection<string> Arguments
        {
            // We don't want the arguments to be serialized to the JSON-based configuration that could be 
            // subsequently passed to the PhantomJS.exe process using the --config=<path> argument.
            // They're only used to provide a facility to add arguments that are not yet explicitly supported by this API
            // for the launching of the 'PhantomJS.exe' service process.
            get { return this.arguments.AsReadOnly(); }
        }

        /// <summary>
        /// Adds a single argument to the list of arguments to be appended to the PhantomJS.exe command line.
        /// </summary>
        /// <param name="argument">The argument to add.</param>
        public void AddArgument(string argument)
        {
            if (String.IsNullOrEmpty(argument))
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

            this.arguments.AddRange(arguments);
        }

        #endregion

        /// <summary>
        /// Creates a default instance of the <see cref="PhantomJSDriverService"/>.
        /// </summary>
        /// <returns>A PhantomJSDriverService that implements default settings.</returns>
        public static PhantomJSDriverService CreateDefaultService()
        {
            return new PhantomJSDriverService();
        }

        /// <summary>
        /// Creates a default instance of the <see cref="PhantomJSDriverService"/> using a specified path to the PhantomJS executable.
        /// </summary>
        /// <param name="driverPath">The directory containing the PhantomJS executable.</param>
        /// <returns>A PhantomJSDriverService using a random port.</returns>
        public static PhantomJSDriverService CreateDefaultService(string driverPath)
        {
            return new PhantomJSDriverService(driverPath);
        }

        [JsonConstructor]
        private PhantomJSDriverService()
            : this(DriverService.FindDriverServiceExecutable(PhantomJSDriverServiceFileName, PhantomJSDownloadUrl))
        {
            InitializeDefaults();
        }

        private PhantomJSDriverService(string driverPath)
            : this(driverPath, PortUtilities.FindFreePort())
        {
            InitializeDefaults();
        }

        private void InitializeDefaults()
        {
            // Iterate through properties using DefaultValue attributes to assign appropriate default values
            foreach (var propertyInfo in typeof(PhantomJSDriverService).GetProperties())
            {
                var defaultValueAttribute = propertyInfo.GetCustomAttributes(typeof(DefaultValueAttribute), false).SingleOrDefault() as DefaultValueAttribute;

                if (defaultValueAttribute != null)
                {
                    propertyInfo.SetValue(this, defaultValueAttribute.Value, null);
                }
            }
        }

        /// <summary>
        /// Serializes the service options to JSON to be used as a configuration file for PhantomJS.exe (via the --config argument).
        /// </summary>
        /// <returns>The JSON representation of the configured service options.</returns>
        public string ToJson()
        {
            return JsonConvert.SerializeObject(this, Formatting.Indented);
        }
    }
}
