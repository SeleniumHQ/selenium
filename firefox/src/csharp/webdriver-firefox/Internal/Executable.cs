using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Win32;
using System.IO;
using System.Diagnostics;
using System.Globalization;

namespace OpenQA.Selenium.Firefox.Internal
{
    internal class Executable
    {
        private static readonly string PlatformBinary = LocateFirefoxBinaryFromPlatform();

        private string binary;

        public Executable(string userSpecifiedBinaryPath)
        {
            if (userSpecifiedBinaryPath != null)
            {

                // It should exist and be a file.
                if (File.Exists(userSpecifiedBinaryPath))
                {
                    binary = userSpecifiedBinaryPath;
                    return;
                }

                throw new WebDriverException(
                    "Specified firefox binary location does not exist or is not a real file: " +
                    userSpecifiedBinaryPath);
            }

            if (PlatformBinary != null && File.Exists(PlatformBinary))
            {
                binary = PlatformBinary;
                return;
            }

            throw new WebDriverException("Cannot find firefox binary in PATH. " +
                "Make sure firefox is installed. OS appears to be: " + Platform.CurrentPlatform);
        }

        public string ExecutablePath
        {
            get
            {
                return binary;
            }
        }


        /**
         * Locates the firefox binary by platform.
         */
        private static string LocateFirefoxBinaryFromPlatform()
        {
            string binary = string.Empty;
            if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                var mozillaKey = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Mozilla\Mozilla Firefox");
                if (mozillaKey != null)
                {
                    binary = GetExecutablePathUsingRegistry(mozillaKey);
                }
                else
                {
                    string relativePath = Path.Combine("Mozilla Firefox", "Firefox.exe");
                    // We try and guess common locations where FireFox might be installed
                    var tempPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), relativePath);
                    if (File.Exists(tempPath))
                    {
                        binary = tempPath;
                    }
                    else
                    {
                        tempPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles) + " (x86)", relativePath);
                        if (File.Exists(tempPath))
                        {
                            binary = tempPath;
                        }
                        else
                        {
                            throw new WebDriverException("Unable to determine the current version of FireFox tried looking in the registry and the common locations on disk, please make sure you have installed FireFox correctly");
                        }
                    }
                }
            }
            else
            {
                // Use "which firefox" for non-Windows OS.
                Process proc = new Process();
                proc.StartInfo.FileName = "which";
                proc.StartInfo.Arguments = "firefox";
                proc.StartInfo.CreateNoWindow = true;
                proc.StartInfo.RedirectStandardOutput = true;
                proc.StartInfo.UseShellExecute = false;
                proc.Start();
                proc.WaitForExit();
                binary = proc.StandardOutput.ReadToEnd().Trim();
            }


            return binary != null && File.Exists(binary) ? binary : FindBinary(new string[] { "firefox3", "firefox2", "firefox" });
        }
        private static string GetExecutablePathUsingRegistry(RegistryKey mozillaKey)
        {
            var currentVersion = (string)mozillaKey.GetValue("CurrentVersion");
            if (string.IsNullOrEmpty(currentVersion))
            {
                throw new WebDriverException("Unable to determine the current version of FireFox using the registry, please make sure you have installed FireFox and Jssh correctly");
            }

            var currentMain = mozillaKey.OpenSubKey(string.Format(CultureInfo.InvariantCulture, @"{0}\Main", currentVersion));
            if (currentMain == null)
            {
                throw new WebDriverException(
                    "Unable to determine the current version of FireFox using the registry, please make sure you have installed FireFox and Jssh correctly");
            }

            var path = (string)currentMain.GetValue("PathToExe");
            if (!File.Exists(path))
            {
                throw new WebDriverException(
                    "FireFox executable listed in the registry does not exist, please make sure you have installed FireFox and Jssh correctly");
            }

            return path;
        }

        /**
         * Retrieve an env var; if no var is set, returns the default
         * 
         * @param name the name of the variable
         * @param defaultValue the default value of the variable
         * @return the env var
         */
        private static string GetEnvironmentVariable(string name, string defaultValue)
        {
            string value = Environment.GetEnvironmentVariable(name);
            if (string.IsNullOrEmpty(value))
            {
                value = defaultValue;
            }
            return value;
        }

        /**
         * Retrieves the platform specific env property name which contains the library path.
         */
        private static string GetLibraryPathPropertyName()
        {
            string libraryPropertyPathName = "LD_LIBRARY_PATH";
            if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                libraryPropertyPathName = "PATH";
            }
            else if (Platform.CurrentPlatform.IsPlatformType(PlatformType.MacOSX))
            {
                libraryPropertyPathName = "DYLD_LIBRARY_PATH";
            }
            return libraryPropertyPathName;
        }

        public void SetLibraryPath(Process builder)
        {
            string propertyName = GetLibraryPathPropertyName();
            StringBuilder libraryPath = new StringBuilder();

            // If we have an env var set for the path, use it.
            String env = GetEnvironmentVariable(propertyName, null);
            if (env != null)
            {
                libraryPath.Append(env).Append(Path.PathSeparator);
            }

            // Check our extra env vars for the same var, and use it too.
            if (builder.StartInfo.EnvironmentVariables.ContainsKey(propertyName))
            {
                libraryPath.Append(env).Append(Path.PathSeparator);
            }

            // Last, add the contents of the specified system property, defaulting to the binary's path.

            // On Snow Leopard, beware of problems the sqlite library    
            string firefoxLibraryPath = Path.GetFullPath(binary);
            if (Platform.CurrentPlatform.IsPlatformType(PlatformType.MacOSX) && Platform.CurrentPlatform.MinorVersion > 5)
            {
                libraryPath.Append(libraryPath).Append(Path.PathSeparator);
            }
            else
            {
                libraryPath.Append(firefoxLibraryPath).Append(Path.PathSeparator).Append(libraryPath);
            }

            // Add the library path to the builder.
            if (builder.StartInfo.EnvironmentVariables.ContainsKey(propertyName))
            {
                builder.StartInfo.EnvironmentVariables[propertyName] = libraryPath.ToString();
            }
            else
            {
                builder.StartInfo.EnvironmentVariables.Add(propertyName, libraryPath.ToString());
            }
        }

        /**
         * Walk a PATH to locate binaries with a specified name. Binaries will be searched for in the
         * order they are provided.
         * 
         * @param binaryNames the binary names to search for
         * @return the first binary found matching that name.
         */
        private static string FindBinary(string[] binaryNames)
        {
            string[] paths = Environment.GetEnvironmentVariable("PATH").Split(new char[] { Path.PathSeparator }, StringSplitOptions.None);
            foreach (string binaryName in binaryNames)
            {
                foreach (string path in paths)
                {
                    string file = Path.Combine(path, binaryName);
                    if (File.Exists(file))
                    {
                        return file;
                    }
                    if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
                    {
                        string exe = Path.Combine(path, binaryName + ".exe");
                        if (File.Exists(exe))
                        {
                            return exe;
                        }
                    }
                }
            }
            return null;
        }
    }
}
