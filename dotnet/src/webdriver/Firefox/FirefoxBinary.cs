// <copyright file="FirefoxBinary.cs" company="WebDriver Committers">
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
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Security.Permissions;
using System.Text;
using System.Threading;
using OpenQA.Selenium.Firefox.Internal;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Represents the binary associated with Firefox.
    /// </summary>
    /// <remarks>The <see cref="FirefoxBinary"/> class is responsible for instantiating the
    /// Firefox process, and the operating system environment in which it runs.</remarks>
    public class FirefoxBinary : IDisposable
    {
        private const string NoFocusLibraryName = "x_ignore_nofocus.so";
        private Dictionary<string, string> extraEnv = new Dictionary<string, string>();
        private Executable executable;
        private Process process;
        private TimeSpan timeout = TimeSpan.FromSeconds(45);
        private bool isDisposed = false;

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxBinary"/> class.
        /// </summary>
        public FirefoxBinary()
            : this(null)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxBinary"/> class located at a specific file location.
        /// </summary>
        /// <param name="pathToFirefoxBinary">Full path and file name to the Firefox executable.</param>
        public FirefoxBinary(string pathToFirefoxBinary)
        {
            this.executable = new Executable(pathToFirefoxBinary);
        }

        /// <summary>
        /// Gets or sets the timeout to wait for Firefox to be available for command execution.
        /// </summary>
        public TimeSpan Timeout
        {
            get { return this.timeout; }
            set { this.timeout = value; }
        }

        /// <summary>
        /// Gets the <see cref="Executable"/> associated with this <see cref="FirefoxBinary"/>.
        /// </summary>
        internal Executable BinaryExecutable
        {
            get { return this.executable; }
        }

        /// <summary>
        /// Gets a value indicating whether the current operating system is Linux.
        /// </summary>
        protected static bool IsOnLinux
        {
            get { return Platform.CurrentPlatform.IsPlatformType(PlatformType.Linux); }
        }

        /// <summary>
        /// Gets a <see cref="Dictionary{K, V}"/> containing string key-value pairs
        /// representing any operating system environment variables beyond the defaults.
        /// </summary>
        protected Dictionary<string, string> ExtraEnvironmentVariables
        {
            get { return this.extraEnv; }
        }

        /// <summary>
        /// Starts Firefox using the specified profile and command-line arguments.
        /// </summary>
        /// <param name="profile">The <see cref="FirefoxProfile"/> to use with this instance of Firefox.</param>
        /// <param name="commandLineArguments">The command-line arguments to use in starting Firefox.</param>
        [SecurityPermission(SecurityAction.Demand)]
        public void StartProfile(FirefoxProfile profile, params string[] commandLineArguments)
        {
            if (profile == null)
            {
                throw new ArgumentNullException("profile", "profile cannot be null");
            }

            if (commandLineArguments == null)
            {
                commandLineArguments = new string[] { };
            }

            string profileAbsPath = profile.ProfileDirectory;
            this.SetEnvironmentProperty("XRE_PROFILE_PATH", profileAbsPath);
            this.SetEnvironmentProperty("MOZ_NO_REMOTE", "1");
            this.SetEnvironmentProperty("MOZ_CRASHREPORTER_DISABLE", "1"); // Disable Breakpad
            this.SetEnvironmentProperty("NO_EM_RESTART", "1"); // Prevent the binary from detaching from the console

            if (IsOnLinux && (profile.EnableNativeEvents || profile.AlwaysLoadNoFocusLibrary))
            {
                this.ModifyLinkLibraryPath(profile);
            }

            StringBuilder commandLineArgs = new StringBuilder();
            foreach (string commandLineArg in commandLineArguments)
            {
                commandLineArgs.Append(" ").Append(commandLineArg);
            }

            this.process = new Process();
            this.process.StartInfo.FileName = this.BinaryExecutable.ExecutablePath;
            this.process.StartInfo.Arguments = commandLineArgs.ToString();
            this.process.StartInfo.UseShellExecute = false;

            foreach (string environmentVar in this.extraEnv.Keys)
            {
                if (this.process.StartInfo.EnvironmentVariables.ContainsKey(environmentVar))
                {
                    this.process.StartInfo.EnvironmentVariables[environmentVar] = this.extraEnv[environmentVar];
                }
                else
                {
                    this.process.StartInfo.EnvironmentVariables.Add(environmentVar, this.extraEnv[environmentVar]);
                }
            }

            this.BinaryExecutable.SetLibraryPath(this.process);

            this.StartFirefoxProcess();

            this.CopeWithTheStrangenessOfTheMac();
        }

        /// <summary>
        /// Sets a variable to be used in the Firefox execution environment.
        /// </summary>
        /// <param name="propertyName">The name of the environment variable to set.</param>
        /// <param name="value">The value of the environment variable to set.</param>
        public void SetEnvironmentProperty(string propertyName, string value)
        {
            if (string.IsNullOrEmpty(propertyName) || value == null)
            {
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "You must set both the property name and value: {0}, {1}", propertyName, value));
            }

            if (this.extraEnv.ContainsKey(propertyName))
            {
                this.extraEnv[propertyName] = value;
            }
            else
            {
                this.extraEnv.Add(propertyName, value);
            }
        }

        /// <summary>
        /// Waits for the process to complete execution.
        /// </summary>
        [SecurityPermission(SecurityAction.Demand)]
        public void WaitForProcessExit()
        {
            this.process.WaitForExit();
        }

        /// <summary>
        /// Releases all resources used by the <see cref="FirefoxBinary"/>.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Returns a <see cref="string">String</see> that represents the current <see cref="object">Object</see>.
        /// </summary>
        /// <returns>A <see cref="string">String</see> that represents the current <see cref="object">Object</see>.</returns>
        public override string ToString()
        {
            return "FirefoxBinary(" + this.executable.ExecutablePath + ")";
        }

        /// <summary>
        /// Starts the Firefox process.
        /// </summary>
        [SecurityPermission(SecurityAction.Demand)]
        protected void StartFirefoxProcess()
        {
            this.process.Start();
        }

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="FirefoxBinary"/> and optionally
        /// releases the managed resources.
        /// </summary>
        /// <param name="disposing"><see langword="true"/> to release managed and resources;
        /// <see langword="false"/> to only release unmanaged resources.</param>
        [SecurityPermission(SecurityAction.Demand)]
        protected virtual void Dispose(bool disposing)
        {
            if (!this.isDisposed)
            {
                if (disposing)
                {
                    // Suicide watch: First,  a second to see if the process will die on
                    // it's own (we will likely have asked the process to kill itself just
                    // before calling this method).
                    if (this.process != null)
                    {
                        if (!this.process.HasExited)
                        {
                            System.Threading.Thread.Sleep(1000);
                        }

                        // Murder option: The process is still alive, so kill it.
                        if (!this.process.HasExited)
                        {
                            this.process.Kill();
                        }

                        this.process.Dispose();
                        this.process = null;
                    }
                }

                this.isDisposed = true;
            }
        }

        private static void Sleep(int timeInMilliseconds)
        {
            try
            {
                Thread.Sleep(timeInMilliseconds);
            }
            catch (ThreadInterruptedException e)
            {
                throw new WebDriverException("Thread was interrupted", e);
            }
        }

        private static string ExtractAndCheck(FirefoxProfile profile, string noFocusSoName, string libraryPath32Bit, string libraryPath64Bit)
        {
            //// 1. Extract x86/x_ignore_nofocus.so to profile.getLibsDir32bit
            //// 2. Extract amd64/x_ignore_nofocus.so to profile.getLibsDir64bit
            //// 3. Create a new LD_LIB_PATH string to contain:
            ////    profile.getLibsDir32bit + ":" + profile.getLibsDir64bit
            List<string> pathsSet = new List<string>();
            pathsSet.Add(libraryPath32Bit);
            pathsSet.Add(libraryPath64Bit);

            StringBuilder builtPath = new StringBuilder();

            foreach (string path in pathsSet)
            {
                string outSoPath = Path.Combine(profile.ProfileDirectory, path);
                string file = Path.Combine(outSoPath, noFocusSoName);
                string resourceName = string.Format(CultureInfo.InvariantCulture, "WebDriver.FirefoxNoFocus.{0}.dll", path);
                if (ResourceUtilities.IsValidResourceName(resourceName))
                {
                    using (Stream libraryStream = ResourceUtilities.GetResourceStream(noFocusSoName, resourceName))
                    {
                        Directory.CreateDirectory(outSoPath);
                        using (FileStream outputStream = File.Create(file))
                        {
                            byte[] buffer = new byte[1000];
                            int bytesRead = libraryStream.Read(buffer, 0, buffer.Length);
                            while (bytesRead > 0)
                            {
                                outputStream.Write(buffer, 0, bytesRead);
                                bytesRead = libraryStream.Read(buffer, 0, buffer.Length);
                            }
                        }
                    }
                }

                if (!File.Exists(file))
                {
                    throw new WebDriverException("Could not locate " + path + ": "
                                                 + "native events will not work.");
                }

                builtPath.Append(outSoPath).Append(Path.PathSeparator);
            }

            return builtPath.ToString();
        }

        private void ModifyLinkLibraryPath(FirefoxProfile profile)
        {
            // Extract x_ignore_nofocus.so from x86, amd64 directories inside
            // the jar into a real place in the filesystem and change LD_LIBRARY_PATH
            // to reflect that.
            string existingLdLibPath = Environment.GetEnvironmentVariable("LD_LIBRARY_PATH");

            // The returned new ld lib path is terminated with ':'
            string newLdLibPath = ExtractAndCheck(profile, NoFocusLibraryName, "x86", "x64");
            if (!string.IsNullOrEmpty(existingLdLibPath))
            {
                newLdLibPath += existingLdLibPath;
            }

            this.SetEnvironmentProperty("LD_LIBRARY_PATH", newLdLibPath);

            // Set LD_PRELOAD to x_ignore_nofocus.so - this will be taken automagically
            // from the LD_LIBRARY_PATH
            this.SetEnvironmentProperty("LD_PRELOAD", NoFocusLibraryName);
        }

        [SecurityPermission(SecurityAction.Demand)]
        private void CopeWithTheStrangenessOfTheMac()
        {
            if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Mac))
            {
                // On the Mac, this process sometimes dies. Check for this, put in a decent sleep
                // and then attempt to restart it. If this doesn't work, then give up

                // TODO(simon): Why is this happening? Firefox 2 never seemed to suffer this
                try
                {
                    System.Threading.Thread.Sleep(300);
                    if (this.process.ExitCode == 0)
                    {
                        return;
                    }

                    // Looks like it's gone wrong.
                    // TODO(simon): This is utterly bogus. We should do something far smarter
                    System.Threading.Thread.Sleep(10000);

                    this.StartFirefoxProcess();
                }
                catch (ThreadStateException)
                {
                    // Excellent, we've not creashed.
                }

                // Ensure we're okay
                try
                {
                    Sleep(300);

                    if (this.process.ExitCode == 0)
                    {
                        return;
                    }

                    StringBuilder message = new StringBuilder("Unable to start firefox cleanly.\n");
                    message.Append("Exit value: ").Append(this.process.ExitCode.ToString(CultureInfo.InvariantCulture)).Append("\n");
                    message.Append("Ran from: ").Append(this.process.StartInfo.FileName).Append("\n");
                    throw new WebDriverException(message.ToString());
                }
                catch (ThreadStateException)
                {
                    // Woot!
                }
            }
        }
    }
}
