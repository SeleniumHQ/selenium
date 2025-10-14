// <copyright file="FirefoxProfile.cs" company="Selenium Committers">
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

using OpenQA.Selenium.Internal;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.IO.Compression;
using System.Text.Json;

namespace OpenQA.Selenium.Firefox;

/// <summary>
/// Provides the ability to edit the preferences associated with a Firefox profile.
/// </summary>
public class FirefoxProfile
{
    private const string UserPreferencesFileName = "user.js";
    private readonly string? sourceProfileDir;
    private readonly bool deleteSource;
    private readonly Preferences profilePreferences;
    private readonly Dictionary<string, FirefoxExtension> extensions = new Dictionary<string, FirefoxExtension>();

    /// <summary>
    /// Initializes a new instance of the <see cref="FirefoxProfile"/> class.
    /// </summary>
    public FirefoxProfile()
        : this(null)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="FirefoxProfile"/> class using a
    /// specific profile directory.
    /// </summary>
    /// <param name="profileDirectory">The directory containing the profile.</param>
    public FirefoxProfile(string? profileDirectory)
        : this(profileDirectory, false)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="FirefoxProfile"/> class using a
    /// specific profile directory.
    /// </summary>
    /// <param name="profileDirectory">The directory containing the profile.</param>
    /// <param name="deleteSourceOnClean">Delete the source directory of the profile upon cleaning.</param>
    public FirefoxProfile(string? profileDirectory, bool deleteSourceOnClean)
    {
        this.sourceProfileDir = profileDirectory;
        this.deleteSource = deleteSourceOnClean;
        this.profilePreferences = this.ReadDefaultPreferences();
        this.profilePreferences.AppendPreferences(this.ReadExistingPreferences());
    }

    /// <summary>
    /// Gets the directory containing the profile.
    /// </summary>
    public string? ProfileDirectory { get; private set; }

    /// <summary>
    /// Gets or sets a value indicating whether to delete this profile after use with
    /// the <see cref="FirefoxDriver"/>.
    /// </summary>
    public bool DeleteAfterUse { get; set; } = true;

    /// <summary>
    /// Converts a base64-encoded string into a <see cref="FirefoxProfile"/>.
    /// </summary>
    /// <param name="base64">The base64-encoded string containing the profile contents.</param>
    /// <returns>The constructed <see cref="FirefoxProfile"/>.</returns>
    public static FirefoxProfile FromBase64String(string base64)
    {
        string destinationDirectory = FileUtilities.GenerateRandomTempDirectoryName("webdriver.{0}.duplicated");
        byte[] zipContent = Convert.FromBase64String(base64);
        using (MemoryStream zipStream = new MemoryStream(zipContent))
        {
            using (ZipArchive profileZipArchive = new ZipArchive(zipStream, ZipArchiveMode.Read))
            {
                profileZipArchive.ExtractToDirectory(destinationDirectory);
            }
        }

        return new FirefoxProfile(destinationDirectory, true);
    }

    /// <summary>
    /// Adds a Firefox Extension to this profile
    /// </summary>
    /// <param name="extensionToInstall">The path to the new extension</param>
    /// <exception cref="ArgumentNullException">If <paramref name="extensionToInstall"/> is <see langword="null"/>.</exception>
    public void AddExtension(string extensionToInstall)
    {
        if (extensionToInstall is null)
        {
            throw new ArgumentNullException(nameof(extensionToInstall));
        }

        this.extensions.Add(Path.GetFileNameWithoutExtension(extensionToInstall), new FirefoxExtension(extensionToInstall));
    }

    /// <summary>
    /// Sets a preference in the profile.
    /// </summary>
    /// <param name="name">The name of the preference to add.</param>
    /// <param name="value">A <see cref="string"/> value to add to the profile.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="name"/> or <paramref name="value"/> are <see langword="null"/>.</exception>
    public void SetPreference(string name, string value)
    {
        this.profilePreferences.SetPreference(name, value);
    }

    /// <summary>
    /// Sets a preference in the profile.
    /// </summary>
    /// <param name="name">The name of the preference to add.</param>
    /// <param name="value">A <see cref="int"/> value to add to the profile.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="name"/> is <see langword="null"/>.</exception>
    public void SetPreference(string name, int value)
    {
        this.profilePreferences.SetPreference(name, value);
    }

    /// <summary>
    /// Sets a preference in the profile.
    /// </summary>
    /// <param name="name">The name of the preference to add.</param>
    /// <param name="value">A <see cref="bool"/> value to add to the profile.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="name"/> is <see langword="null"/>.</exception>
    public void SetPreference(string name, bool value)
    {
        this.profilePreferences.SetPreference(name, value);
    }

    /// <summary>
    /// Writes this in-memory representation of a profile to disk.
    /// </summary>
    [MemberNotNull(nameof(ProfileDirectory))]
    public void WriteToDisk()
    {
        this.ProfileDirectory = GenerateProfileDirectoryName();
        if (!string.IsNullOrEmpty(this.sourceProfileDir))
        {
            FileUtilities.CopyDirectory(this.sourceProfileDir!, this.ProfileDirectory);
        }
        else
        {
            Directory.CreateDirectory(this.ProfileDirectory);
        }

        this.InstallExtensions(this.ProfileDirectory);
        this.DeleteLockFiles(this.ProfileDirectory);
        this.DeleteExtensionsCache(this.ProfileDirectory);
        this.UpdateUserPreferences(this.ProfileDirectory);
    }

    /// <summary>
    /// Cleans this Firefox profile.
    /// </summary>
    /// <remarks>If this profile is a named profile that existed prior to
    /// launching Firefox, the <see cref="Clean"/> method removes the WebDriver
    /// Firefox extension. If the profile is an anonymous profile, the profile
    /// is deleted.</remarks>
    public void Clean()
    {
        if (this.DeleteAfterUse && !string.IsNullOrEmpty(this.ProfileDirectory) && Directory.Exists(this.ProfileDirectory))
        {
            FileUtilities.DeleteDirectory(this.ProfileDirectory);
        }

        if (this.deleteSource && !string.IsNullOrEmpty(this.sourceProfileDir) && Directory.Exists(this.sourceProfileDir))
        {
            FileUtilities.DeleteDirectory(this.sourceProfileDir);
        }
    }

    /// <summary>
    /// Converts the profile into a base64-encoded string.
    /// </summary>
    /// <returns>A base64-encoded string containing the contents of the profile.</returns>
    public string ToBase64String()
    {
        string base64zip;
        this.WriteToDisk();

        using (MemoryStream profileMemoryStream = new MemoryStream())
        {
            using (ZipArchive profileZipArchive = new ZipArchive(profileMemoryStream, ZipArchiveMode.Create, true))
            {
                string[] files = Directory.GetFiles(this.ProfileDirectory, "*.*", SearchOption.AllDirectories);
                foreach (string file in files)
                {
                    string fileNameInZip = file.Substring(this.ProfileDirectory.Length + 1).Replace(Path.DirectorySeparatorChar, '/');
                    profileZipArchive.CreateEntryFromFile(file, fileNameInZip);
                }
            }

            base64zip = Convert.ToBase64String(profileMemoryStream.ToArray());
            this.Clean();
        }

        return base64zip;
    }

    /// <summary>
    /// Generates a random directory name for the profile.
    /// </summary>
    /// <returns>A random directory name for the profile.</returns>
    private static string GenerateProfileDirectoryName()
    {
        return FileUtilities.GenerateRandomTempDirectoryName("anonymous.{0}.webdriver-profile");
    }

    /// <summary>
    /// Deletes the lock files for a profile.
    /// </summary>
    private void DeleteLockFiles(string profileDirectory)
    {
        File.Delete(Path.Combine(profileDirectory, ".parentlock"));
        File.Delete(Path.Combine(profileDirectory, "parent.lock"));
    }

    /// <summary>
    /// Installs all extensions in the profile in the directory on disk.
    /// </summary>
    private void InstallExtensions(string profileDirectory)
    {
        foreach (string extensionKey in this.extensions.Keys)
        {
            this.extensions[extensionKey].Install(profileDirectory);
        }
    }

    /// <summary>
    /// Deletes the cache of extensions for this profile, if the cache exists.
    /// </summary>
    /// <remarks>If the extensions cache does not exist for this profile, the
    /// <see cref="DeleteExtensionsCache"/> method performs no operations, but
    /// succeeds.</remarks>
    private void DeleteExtensionsCache(string profileDirectory)
    {
        DirectoryInfo ex = new DirectoryInfo(Path.Combine(profileDirectory, "extensions"));
        string cacheFile = Path.Combine(ex.Parent!.FullName, "extensions.cache");
        if (File.Exists(cacheFile))
        {
            File.Delete(cacheFile);
        }
    }

    /// <summary>
    /// Writes the user preferences to the profile.
    /// </summary>
    private void UpdateUserPreferences(string profileDirectory)
    {
        string userPrefs = Path.Combine(profileDirectory, UserPreferencesFileName);
        if (File.Exists(userPrefs))
        {
            try
            {
                File.Delete(userPrefs);
            }
            catch (Exception e)
            {
                throw new WebDriverException("Cannot delete existing user preferences", e);
            }
        }

        string homePage = this.profilePreferences.GetPreference("browser.startup.homepage");
        if (!string.IsNullOrEmpty(homePage))
        {
            this.profilePreferences.SetPreference("startup.homepage_welcome_url", string.Empty);
            if (homePage != "about:blank")
            {
                this.profilePreferences.SetPreference("browser.startup.page", 1);
            }
        }

        this.profilePreferences.WriteToFile(userPrefs);
    }

    private Preferences ReadDefaultPreferences()
    {
        using (Stream defaultPrefsStream = ResourceUtilities.GetResourceStream("webdriver_prefs.json", "webdriver_prefs.json"))
        {
            using JsonDocument defaultPreferences = JsonDocument.Parse(defaultPrefsStream);

            JsonElement immutableDefaultPreferences = defaultPreferences.RootElement.GetProperty("frozen");
            JsonElement editableDefaultPreferences = defaultPreferences.RootElement.GetProperty("mutable");

            return new Preferences(immutableDefaultPreferences, editableDefaultPreferences);
        }
    }

    /// <summary>
    /// Reads the existing preferences from the profile.
    /// </summary>
    /// <returns>A <see cref="Dictionary{K, V}"/>containing key-value pairs representing the preferences.</returns>
    /// <remarks>Assumes that we only really care about the preferences, not the comments</remarks>
    private Dictionary<string, string> ReadExistingPreferences()
    {
        Dictionary<string, string> prefs = new Dictionary<string, string>();

        try
        {
            if (!string.IsNullOrEmpty(this.sourceProfileDir))
            {
                string userPrefs = Path.Combine(this.sourceProfileDir, UserPreferencesFileName);
                if (File.Exists(userPrefs))
                {
                    string[] fileLines = File.ReadAllLines(userPrefs);
                    foreach (string line in fileLines)
                    {
                        if (line.StartsWith("user_pref(\"", StringComparison.OrdinalIgnoreCase))
                        {
                            string parsedLine = line.Substring("user_pref(\"".Length);
                            parsedLine = parsedLine.Substring(0, parsedLine.Length - ");".Length);
                            string[] parts = line.Split(new string[] { "," }, StringSplitOptions.None);
                            parts[0] = parts[0].Substring(0, parts[0].Length - 1);
                            prefs.Add(parts[0].Trim(), parts[1].Trim());
                        }
                    }
                }
            }
        }
        catch (IOException e)
        {
            throw new WebDriverException(string.Empty, e);
        }

        return prefs;
    }
}
