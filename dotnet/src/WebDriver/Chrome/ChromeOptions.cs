// <copyright file="ChromeOptions.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
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
using System.IO;
using System.Text;
using Newtonsoft.Json;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Class to manage options specific to <see cref="ChromeDriver"/>
    /// </summary>
    /// <remarks>
    /// Used with ChromeDriver.exe v17.0.963.0 and higher.
    /// </remarks>
    /// <example>
    /// <code>
    /// ChromeOptions options = new ChromeOptions();
    /// options.AddExtensions("\path\to\extension.crx");
    /// options.BinaryLocation = "\path\to\chrome";
    /// </code>
    /// <para></para>
    /// <para>For use with ChromeDriver:</para>
    /// <para></para>
    /// <code>
    /// ChromeDriver driver = new ChromeDriver(options);
    /// </code>
    /// <para></para>
    /// <para>For use with RemoteWebDriver:</para>
    /// <para></para>
    /// <code>
    /// DesiredCapabilities capabilities = DesiredCapabilities.Chrome();
    /// capabilities.SetCapability(ChromeOptions.Capability, options);
    /// RemoteWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/wd/hub"), capabilities);
    /// </code>
    /// </example>
    public class ChromeOptions
    {
        /// <summary>
        /// Gets the name of the capability used to store Chrome options in
        /// a <see cref="DesiredCapabilities"/> object.
        /// </summary>
        public static readonly string Capability = "chromeOptions";

        private string binaryLocation = string.Empty;
        private List<string> arguments = new List<string>();
        private List<string> extensionFiles = new List<string>();

        /// <summary>
        /// Gets or sets the location of the Chrome browser's binary executable file.
        /// </summary>
        [JsonProperty("binary")]
        public string BinaryLocation
        {
            get { return this.binaryLocation; }
            set { this.binaryLocation = value; }
        }

        /// <summary>
        /// Gets the list of arguments appended to the Chrome command line as a string array.
        /// </summary>
        [JsonProperty("args")]
        public ReadOnlyCollection<string> Arguments
        {
            get { return this.arguments.AsReadOnly(); }
        }

        /// <summary>
        /// Gets the list of extensions to be installed as an array of base64-encoded strings.
        /// </summary>
        [JsonProperty("extensions")]
        public ReadOnlyCollection<string> Extensions
        {
            get
            {
                List<string> encodedExtensions = new List<string>();
                foreach (string extensionFile in this.extensionFiles)
                {
                    byte[] extensionByteArray = File.ReadAllBytes(extensionFile);
                    string encodedExtension = Convert.ToBase64String(extensionByteArray);
                    encodedExtensions.Add(encodedExtension);
                }

                return encodedExtensions.AsReadOnly();
            }
        }

        /// <summary>
        /// Adds a single argument to the list of arguments to be appended to the Chrome.exe command line.
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
        /// Adds arguments to be appended to the Chrome.exe command line.
        /// </summary>
        /// <param name="arguments">An array of arguments to add.</param>
        public void AddArguments(params string[] arguments)
        {
            this.AddArguments(new List<string>(arguments));
        }

        /// <summary>
        /// Adds arguments to be appended to the Chrome.exe command line.
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

        /// <summary>
        /// Adds a path to a packed Chrome extension (.crx file) to the list of extensions 
        /// to be installed in the instance of Chrome.
        /// </summary>
        /// <param name="pathToExtension">The full path to the extension to add.</param>
        public void AddExtension(string pathToExtension)
        {
            if (string.IsNullOrEmpty(pathToExtension))
            {
                throw new ArgumentException("pathToExtension must not be null or empty", "pathToExtension");
            }

            this.AddExtensions(pathToExtension);
        }

        /// <summary>
        /// Adds a list of paths to packed Chrome extensions (.crx files) to be installed
        /// in the instance of Chrome.
        /// </summary>
        /// <param name="extensions">An array of full paths to the extensions to add.</param>
        public void AddExtensions(params string[] extensions)
        {
            this.AddExtensions(new List<string>(extensions));
        }

        /// <summary>
        /// Adds a list of paths to packed Chrome extensions (.crx files) to be installed
        /// in the instance of Chrome.
        /// </summary>
        /// <param name="extensions">An <see cref="IEnumerable{T}"/> of full paths to the extensions to add.</param>
        public void AddExtensions(IEnumerable<string> extensions)
        {
            if (extensions == null)
            {
                throw new ArgumentNullException("extensions", "extensions must not be null");
            }

            foreach (string extension in extensions)
            {
                if (!File.Exists(extension))
                {
                    throw new FileNotFoundException("No extension found at the specified path", extension);
                }

                this.extensionFiles.Add(extension);
            }
        }

        /// <summary>
        /// Returns DesiredCapabilities for Chrome with these options included as
        /// capabilities. This does not copy the options. Further changes will be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The DesiredCapabilities for Chrome with these options.</returns>
        internal ICapabilities ToCapabilities()
        {
            DesiredCapabilities capabilities = DesiredCapabilities.Chrome();
            capabilities.SetCapability(ChromeOptions.Capability, this);

            // chromeOptions is only recognized by chromedriver 17.0.963.0 or newer.
            // Provide backwards compatibility for capabilities supported by older
            // versions of chromedriver.
            // TODO: remove this once the deprecated capabilities are no longer supported.
            capabilities.SetCapability("chrome.switches", this.arguments);
            if (!string.IsNullOrEmpty(this.binaryLocation))
            {
                capabilities.SetCapability("chrome.binary", this.binaryLocation);
            }

            return capabilities;
        }
    }
}
