// <copyright file="SafariDriverExtension.cs" company="WebDriver Committers">
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
using System.IO;
using System.Linq;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Safari
{
    /// <summary>
    /// The <see cref="SafariDriverExtension"/> class manages the Safari extension
    /// used by the <see cref="SafariDriver"/>. It handles installation and uninstallation
    /// as well as its extraction from an embedded resource, if needed.
    /// </summary>
    public class SafariDriverExtension
    {
        private const string ExtensionFileName = "SafariDriver.safariextz";
        private const string ExtensionResourceId = "WebDriver.SafariExtension";
        private const string ExtensionInstalledFileName = "WebDriver.safariextz";
        private const string ExtensionsPropertyListFileName = "Extensions.plist";

        private string backupDirectory;
        private string extensionSourcePath;
        private bool skipExtensionInstallation;

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariDriverExtension"/> class.
        /// </summary>
        public SafariDriverExtension()
            : this(null, false)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariDriverExtension"/> class, given the
        /// specified source path, and whether to skip the installation of the extension.
        /// </summary>
        /// <param name="sourcePath">The path to the SafariDriver.safariextz file used to install the
        /// WebDriver Safari extension.</param>
        /// <param name="skipExtensionInstallation"><see langword="true"/> to skip installation of the
        /// WebDriver Safari extension; otherwise <see langword="false"/>.</param>
        public SafariDriverExtension(string sourcePath, bool skipExtensionInstallation)
        {
            this.extensionSourcePath = sourcePath;
            this.skipExtensionInstallation = skipExtensionInstallation;
        }

        /// <summary>
        /// Installs the WebDriver Safari extension.
        /// </summary>
        public void Install()
        {
            if (this.skipExtensionInstallation)
            {
                return;
            }

            this.BackupSafariSettings();
            string installLocation = Path.Combine(GetSafariExtensionsDirectory(), ExtensionInstalledFileName);
            if (!string.IsNullOrEmpty(this.extensionSourcePath) && File.Exists(this.extensionSourcePath))
            {
                // Use File.Copy when possible, as it's *much* faster than using Streams.
                File.Copy(this.extensionSourcePath, installLocation, true);
            }
            else
            {
                using (Stream extensionStream = ResourceUtilities.GetResourceStream(ExtensionFileName, ExtensionResourceId))
                {
                    using (FileStream outputStream = new FileStream(installLocation, FileMode.Create, FileAccess.Write))
                    {
                        byte[] buffer = new byte[4096];
                        int bytesRead = extensionStream.Read(buffer, 0, buffer.Length);
                        while (bytesRead > 0)
                        {
                            outputStream.Write(buffer, 0, bytesRead);
                            bytesRead = extensionStream.Read(buffer, 0, buffer.Length);
                        }
                    }
                }
            }

            WritePropertyListFile();
        }

        /// <summary>
        /// Uninstalls the WebDriver Safari extension.
        /// </summary>
        public void Uninstall()
        {
            if (this.skipExtensionInstallation)
            {
                return;
            }

            this.RestoreSafariSettings();
        }

        /// <summary>
        /// Gets Safari's application data directory for the current platform.
        /// </summary>
        /// <returns>Safari's application data directory for the current platform.</returns>
        /// <exception cref="InvalidOperationException">Thrown if the current platform is unsupported.</exception>
        private static string GetSafariDataDirectory()
        {
            Platform current = Platform.CurrentPlatform;
            if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Mac))
            {
                return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Personal), Path.Combine("Library", "Safari"));
            }
            else if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), Path.Combine("Apple Computer", "Safari"));
            }

            throw new InvalidOperationException("The current platform is not supported: " + current);
        }

        private static string GetSafariExtensionsDirectory()
        {
            string directory = Path.Combine(GetSafariDataDirectory(), "Extensions");
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            return directory;
        }

        private static void WritePropertyListFile()
        {
            List<string> propertyListLines = new List<string>()
            {
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
                "<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">",
                "<plist version=\"1.0\">",
                "<dict>",
                "\t<key>Available Updates</key>",
                "\t<dict>",
                "\t\t<key>Last Update Check Time</key>",
                "\t\t<real>370125644.75941497</real>",
                "\t\t<key>Updates List</key>",
                "\t\t<array/>",
                "\t</dict>",
                "\t<key>Installed Extensions</key>",
                "\t<array>",
                "\t\t<dict>",
                "\t\t\t<key>Added Non-Default Toolbar Items</key>",
                "\t\t\t<array/>",
                "\t\t\t<key>Archive File Name</key>",
                "\t\t\t<string>WebDriver.safariextz</string>",
                "\t\t\t<key>Bundle Directory Name</key>",
                "\t\t\t<string>WebDriver.safariextension</string>",
                "\t\t\t<key>Enabled</key>",
                "\t\t\t<true/>",
                "\t\t\t<key>Hidden Bars</key>",
                "\t\t\t<array/>",
                "\t\t\t<key>Removed Default Toolbar Items</key>",
                "\t\t\t<array/>",
                "\t\t</dict>",
                "\t</array>",
                "\t<key>Version</key>",
                "\t<integer>1</integer>",
                "</dict>",
                "</plist>"
            };

            string propertyListContent = string.Join("\n", propertyListLines.ToArray());
            string propertyListFile = Path.Combine(GetSafariExtensionsDirectory(), "Extensions.plist");
            if (File.Exists(propertyListFile))
            {
                File.Delete(propertyListFile);
            }

            using (StreamWriter writer = File.CreateText(propertyListFile))
            {
                writer.Write(propertyListContent);
            }
        }

        private void BackupSafariSettings()
        {
            this.backupDirectory = FileUtilities.GenerateRandomTempDirectoryName("webdriver.SafariBackups.{0}");
            if (Directory.Exists(this.backupDirectory))
            {
                FileUtilities.DeleteDirectory(this.backupDirectory);
            }

            Directory.CreateDirectory(this.backupDirectory);
            string safariExtensionsDirectory = GetSafariExtensionsDirectory();
            string existingExtensionPath = Path.Combine(safariExtensionsDirectory, ExtensionInstalledFileName);
            if (File.Exists(existingExtensionPath))
            {
                File.Copy(existingExtensionPath, Path.Combine(this.backupDirectory, ExtensionInstalledFileName));
            }

            string existingPropertyListPath = Path.Combine(safariExtensionsDirectory, ExtensionsPropertyListFileName);
            if (File.Exists(existingPropertyListPath))
            {
                File.Copy(existingPropertyListPath, Path.Combine(this.backupDirectory, ExtensionsPropertyListFileName));
            }
        }

        private void RestoreSafariSettings()
        {
            if (!string.IsNullOrEmpty(this.backupDirectory))
            {
                string safariExtensionsDirectory = GetSafariExtensionsDirectory();
                string backupExtensionPath = Path.Combine(this.backupDirectory, ExtensionInstalledFileName);
                if (File.Exists(backupExtensionPath))
                {
                    File.Copy(backupExtensionPath, Path.Combine(safariExtensionsDirectory, ExtensionInstalledFileName), true);
                }

                string backupPropertyListPath = Path.Combine(this.backupDirectory, ExtensionsPropertyListFileName);
                if (File.Exists(backupPropertyListPath))
                {
                    File.Copy(backupPropertyListPath, Path.Combine(safariExtensionsDirectory, ExtensionsPropertyListFileName), true);
                }
            }
        }
    }
}