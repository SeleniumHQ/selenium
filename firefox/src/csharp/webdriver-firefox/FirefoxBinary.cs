using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Text;
using System.Threading;
using OpenQA.Selenium.Firefox.Internal;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Represents the binary associated with Firefox.
    /// </summary>
    /// <remarks>The <see cref="FirefoxBinary"/> class is responsible for instantiating the
    /// Firefox process, and the operating system environment in which it runs.</remarks>
    public class FirefoxBinary
    {
        #region Constants
        private const string NoFocusLibraryName = "x_ignore_nofocus.so"; 
        #endregion

        #region Private members
        private Dictionary<string, string> extraEnv = new Dictionary<string, string>();
        private Executable executable;
        private Process process;
        private long timeoutInMilliseconds = 45000;
        private StreamReader stream; 
        #endregion

        #region Constructors
        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxBinary"/> class.
        /// </summary>
        public FirefoxBinary() :
            this(null)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxBinary"/> class located at a specific file location.
        /// </summary>
        /// <param name="pathToFirefoxBinary">Full path and file name to the Firefox executable.</param>
        public FirefoxBinary(string pathToFirefoxBinary)
        {
            executable = new Executable(pathToFirefoxBinary);
        } 
        #endregion

        #region Public properties
        /// <summary>
        /// Gets or sets the timeout (in milliseconds) to wait for command execution.
        /// </summary>
        public long TimeoutInMilliseconds
        {
            get { return timeoutInMilliseconds; }
            set { timeoutInMilliseconds = value; }
        }

        /// <summary>
        /// Gets all console output of the binary.
        /// </summary>
        /// <remarks>Output retrieval is non-destructive and non-blocking.</remarks>
        public string ConsoleOutput
        {
            get
            {
                if (process == null)
                {
                    return null;
                }

                return stream.ReadToEnd();
            }
        } 
        #endregion

        #region Support properties
        /// <summary>
        /// Gets the <see cref="Executable"/> associated with this <see cref="FirefoxBinary"/>.
        /// </summary>
        internal Executable BinaryExecutable
        {
            get { return executable; }
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
            get { return extraEnv; }
        } 
        #endregion

        /// <summary>
        /// Starts Firefox using the specified profile and command-line arguments.
        /// </summary>
        /// <param name="profile">The <see cref="FirefoxProfile"/> to use with this instance of Firefox.</param>
        /// <param name="commandLineArguments">The command-line arguments to use in starting Firefox.</param>
        public void StartProfile(FirefoxProfile profile, string[] commandLineArguments)
        {
            if (commandLineArguments == null)
            {
                commandLineArguments = new string[] { };
            }

            string profileAbsPath = profile.ProfileDirectory;
            SetEnvironmentProperty("XRE_PROFILE_PATH", profileAbsPath);
            SetEnvironmentProperty("MOZ_NO_REMOTE", "1");

            if (IsOnLinux && (profile.EnableNativeEvents || profile.AlwaysLoadNoFocusLibrary))
            {
                ModifyLinkLibraryPath(profile);
            }

            StringBuilder commandLineArgs = new StringBuilder("--verbose");
            foreach (string commandLineArg in commandLineArguments)
            {
                commandLineArgs.Append(" ").Append(commandLineArg);
            }

            Process builder = new Process();
            builder.StartInfo.FileName = BinaryExecutable.ExecutablePath;
            builder.StartInfo.Arguments = commandLineArgs.ToString();
            builder.StartInfo.UseShellExecute = false;
            builder.StartInfo.RedirectStandardError = true;
            builder.StartInfo.RedirectStandardOutput = true;

            foreach (string environmentVar in extraEnv.Keys)
            {
                builder.StartInfo.EnvironmentVariables.Add(environmentVar, extraEnv[environmentVar]);
            }

            BinaryExecutable.SetLibraryPath(builder);

            StartFirefoxProcess(builder);

            CopeWithTheStrangenessOfTheMac(builder);

            // startOutputWatcher();
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

            if (extraEnv.ContainsKey(propertyName))
            {
                extraEnv[propertyName] = value;
            }
            else
            {
                extraEnv.Add(propertyName, value);
            }
        }

        /// <summary>
        /// Creates a named profile for Firefox.
        /// </summary>
        /// <param name="profileName">The name of the profile to create.</param>
        public void CreateProfile(string profileName)
        {
            Process builder = new Process();
            builder.StartInfo.FileName = executable.ExecutablePath;
            builder.StartInfo.Arguments = "--verbose -CreateProfile " + profileName;
            builder.StartInfo.RedirectStandardError = true;
            builder.StartInfo.EnvironmentVariables.Add("MOZ_NO_REMOTE", "1");
            if (stream == null)
            {
                stream = builder.StandardOutput;
            }

            StartFirefoxProcess(builder);
        }

        /// <summary>
        /// Waits for the process to complete execution.
        /// </summary>
        public void WaitForProcessExit()
        {
            process.WaitForExit();
        }

        /// <summary>
        /// Intializes the binary with the specified profile.
        /// </summary>
        /// <param name="profile">The <see cref="FirefoxProfile"/> to use to initialize the binary.</param>
        public void Clean(FirefoxProfile profile)
        {
            StartProfile(profile, new string[] { "-silent" });
            try
            {
                WaitForProcessExit();
            }
            catch (ThreadInterruptedException e)
            {
                throw new WebDriverException("Thread was interupted", e);
            }

            if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                while (profile.IsRunning)
                {
                    Sleep(500);
                }

                do
                {
                    // Always sleep at least a half-second. This will allow
                    // the lazy cleanup of the profile parent.lock file to 
                    // be completed.
                    Sleep(500);
                }
                while (profile.IsRunning);
            }
        }

        /// <summary>
        /// Stops the execution of this <see cref="FirefoxBinary"/>, terminating the process if necessary.
        /// </summary>
        public void Quit()
        {
            // Suicide watch: First,  a second to see if the process will die on 
            // it's own (we will likely have asked the process to kill itself just 
            // before calling this method).
            if (!process.HasExited)
            {
                System.Threading.Thread.Sleep(1000);
            }

            // Murder option: The process is still alive, so kill it.
            if (!process.HasExited)
            {
                process.Kill();
            }
        }

        /// <summary>
        /// Returns a <see cref="System.String">String</see> that represents the current <see cref="System.Object">Object</see>.
        /// </summary>
        /// <returns>A <see cref="System.String">String</see> that represents the current <see cref="System.Object">Object</see>.</returns>
        public override string ToString()
        {
            return "FirefoxBinary(" + executable.ExecutablePath + ")";
        }

        /// <summary>
        /// Starts the Firefox process.
        /// </summary>
        /// <param name="builder">A <see cref="Process"/> object used to start Firefox.</param>
        protected void StartFirefoxProcess(Process builder)
        {
            process = builder;
            process.Start();
            if (stream == null)
            {
                stream = builder.StandardOutput;
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
            // 1. Extract x86/x_ignore_nofocus.so to profile.getLibsDir32bit
            // 2. Extract amd64/x_ignore_nofocus.so to profile.getLibsDir64bit
            // 3. Create a new LD_LIB_PATH string to contain:
            //    profile.getLibsDir32bit + ":" + profile.getLibsDir64bit
            List<string> pathsSet = new List<string>();
            pathsSet.Add(libraryPath32Bit);
            pathsSet.Add(libraryPath64Bit);

            StringBuilder builtPath = new StringBuilder();

            foreach (string path in pathsSet)
            {
                string outSoPath = Path.Combine(profile.ProfileDirectory, path);
                string file = Path.Combine(outSoPath, noFocusSoName);

                string resourceName = string.Format(CultureInfo.InvariantCulture, "WebDriver.FirefoxNoFocus.{0}.dll", path);
                Assembly executingAssembly = Assembly.GetExecutingAssembly();

                List<string> resourceNames = new List<string>(executingAssembly.GetManifestResourceNames());
                if (resourceNames.Contains(resourceName))
                {
                    Stream libraryStream = executingAssembly.GetManifestResourceStream(resourceName);

                    Directory.CreateDirectory(outSoPath);
                    FileStream outputStream = File.Create(file);
                    byte[] buffer = new byte[1000];
                    int bytesRead = libraryStream.Read(buffer, 0, buffer.Length);
                    while (bytesRead > 0)
                    {
                        outputStream.Write(buffer, 0, bytesRead);
                        bytesRead = libraryStream.Read(buffer, 0, buffer.Length);
                    }

                    outputStream.Close();
                    libraryStream.Close();
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
            string newLdLibPath = ExtractAndCheck(profile, NoFocusLibraryName, "x86", "amd64");
            if (!string.IsNullOrEmpty(existingLdLibPath))
            {
                newLdLibPath += existingLdLibPath;
            }

            SetEnvironmentProperty("LD_LIBRARY_PATH", newLdLibPath);

            // Set LD_PRELOAD to x_ignore_nofocus.so - this will be taken automagically
            // from the LD_LIBRARY_PATH
            SetEnvironmentProperty("LD_PRELOAD", NoFocusLibraryName);
        }

        private void CopeWithTheStrangenessOfTheMac(Process builder)
        {
            if (Platform.CurrentPlatform.IsPlatformType(PlatformType.MacOSX))
            {
                // On the Mac, this process sometimes dies. Check for this, put in a decent sleep
                // and then attempt to restart it. If this doesn't work, then give up

                // TODO(simon): Why is this happening? Firefox 2 never seemed to suffer this
                try
                {
                    System.Threading.Thread.Sleep(300);
                    if (process.ExitCode == 0)
                    {
                        return;
                    }

                    // Looks like it's gone wrong.
                    // TODO(simon): This is utterly bogus. We should do something far smarter
                    System.Threading.Thread.Sleep(10000);

                    StartFirefoxProcess(builder);
                }
                catch (ThreadStateException)
                {
                    // Excellent, we've not creashed.
                }

                // Ensure we're okay
                try
                {
                    Sleep(300);

                    if (process.ExitCode == 0)
                    {
                        return;
                    }

                    StringBuilder message = new StringBuilder("Unable to start firefox cleanly.\n");
                    message.Append(ConsoleOutput).Append("\n");
                    message.Append("Exit value: ").Append(process.ExitCode.ToString(CultureInfo.InvariantCulture)).Append("\n");
                    message.Append("Ran from: ").Append(builder.StartInfo.FileName).Append("\n");
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
