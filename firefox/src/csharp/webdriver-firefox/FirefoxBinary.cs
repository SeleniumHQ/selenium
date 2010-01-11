using System;
using System.Collections.Generic;
using System.Text;
using System.Diagnostics;
using System.IO;
using System.Threading;
using OpenQA.Selenium.Firefox.Internal;

namespace OpenQA.Selenium.Firefox
{
    public class FirefoxBinary
    {
        private const string NoFocusLibraryName = "x_ignore_nofocus.so";

        private Dictionary<string, string> extraEnv = new Dictionary<string, string>();
        private Executable executable;
        private Process process;
        private long timeoutInMilliseconds = 4500;
        private StreamReader stream;
        //private Thread outputWatcher;
        //private FirefoxProfile profile;

        public FirefoxBinary() :
            this(null)
        { }

        public FirefoxBinary(string pathToFirefoxBinary)
        {
            executable = new Executable(pathToFirefoxBinary);
        }

        protected bool isOnLinux()
        {
            return Platform.CurrentPlatform.IsPlatformType(PlatformType.Linux);
        }

        public void StartProfile(FirefoxProfile profile, string[] commandLineFlags)
        {
            if (commandLineFlags == null)
            {
                commandLineFlags = new string[] { };
            }
            string profileAbsPath = profile.ProfileDirectory;
            SetEnvironmentProperty("XRE_PROFILE_PATH", profileAbsPath);
            SetEnvironmentProperty("MOZ_NO_REMOTE", "1");

            if (isOnLinux()
                && (profile.EnableNativeEvents || profile.AlwaysLoadNoFocusLibrary))
            {
                ModifyLinkLibraryPath(profile);
            }
            StringBuilder commandLineArgs = new StringBuilder("--verbose");
            foreach (string commandLineArg in commandLineFlags)
            {
                commandLineArgs.Append(" ").Append(commandLineArg);
            }
            Process builder = new Process();
            ProcessStartInfo startInfo = new ProcessStartInfo();
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

            //startOutputWatcher();
        }

        protected void StartFirefoxProcess(Process builder)
        {
            process = builder;
            process.Start();
            if (stream == null)
            {
                stream = builder.StandardOutput;
            }
        }

        //protected void StartOutputWatcher() {
        //  outputWatcher = new Thread(new OutputWatcher(process, stream), "Firefox output watcher");
        //  outputWatcher.start();
        //}

        internal Executable BinaryExecutable
        {
            get
            {
                return executable;
            }
        }

        protected Dictionary<string, string> ExtraEnvironmentVariables
        {
            get { return extraEnv; }
        }

        protected void ModifyLinkLibraryPath(FirefoxProfile profile)
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

        protected string ExtractAndCheck(FirefoxProfile profile, string noFocusSoName,
                                         string jarPath32Bit, string jarPath64Bit)
        {

            // 1. Extract x86/x_ignore_nofocus.so to profile.getLibsDir32bit
            // 2. Extract amd64/x_ignore_nofocus.so to profile.getLibsDir64bit
            // 3. Create a new LD_LIB_PATH string to contain:
            //   profile.getLibsDir32bit + ":" + profile.getLibsDir64bit

            List<string> pathsSet = new List<string>();
            pathsSet.Add(jarPath32Bit);
            pathsSet.Add(jarPath64Bit);

            StringBuilder builtPath = new StringBuilder();

            foreach (string path in pathsSet)
            {
                //try {

                //  FileHandler.copyResource(profile.getProfileDir(), getClass(), path +
                //                                                                File.separator
                //                                                                + noFocusSoName);

                //} catch (IOException e) {
                //  if (Boolean.getBoolean("webdriver.development")) {
                //    System.err.println(
                //        "Exception unpacking required library, but in development mode. Continuing");
                //  } else {
                //    throw new WebDriverException(e);
                //  }
                //} // End catch.

                string outSoPath = Path.Combine(profile.ProfileDirectory, path);

                string file = Path.Combine(outSoPath, noFocusSoName);
                if (!File.Exists(file))
                {
                    throw new WebDriverException("Could not locate " + path + ": "
                                                 + "native events will not work.");
                }

                builtPath.Append(outSoPath).Append(":");
            }

            return builtPath.ToString();
        }

        protected void CopeWithTheStrangenessOfTheMac(Process builder)
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
                    sleep(300);

                    if (process.ExitCode == 0)
                    {
                        return;
                    }

                    StringBuilder message = new StringBuilder("Unable to start firefox cleanly.\n");
                    message.Append(getConsoleOutput()).Append("\n");
                    message.Append("Exit value: ").Append(process.ExitCode.ToString()).Append("\n");
                    message.Append("Ran from: ").Append(builder.StartInfo.FileName).Append("\n");
                    throw new WebDriverException(message.ToString());
                }
                catch (ThreadStateException)
                {
                    // Woot!
                }
            }
        }

        public void SetEnvironmentProperty(String propertyName, String value)
        {
            if (string.IsNullOrEmpty(propertyName) || value == null)
            {
                throw new WebDriverException(
                    String.Format("You must set both the property name and value: {0}, {1}", propertyName,
                        value));
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

        public void CreateProfile(String profileName)
        {
            Process builder = new Process();
            builder.StartInfo.FileName = executable.ExecutablePath;
            builder.StartInfo.Arguments = "--verbose -CreateProfile" + profileName;
            builder.StartInfo.RedirectStandardError = true;
            builder.StartInfo.EnvironmentVariables.Add("MOZ_NO_REMOTE", "1");
            if (stream == null)
            {
                stream = builder.StandardOutput;
            }

            StartFirefoxProcess(builder);

            //outputWatcher = new Thread(new OutputWatcher(process, stream));
            //outputWatcher.start();
        }

        /**
         * Waits for the process to execute, returning the command output taken from the profile's execution.
         *
         * @throws InterruptedException if we are interrupted while waiting for the process to launch
         * @throws IOException          if there is a problem with reading the input stream of the launching process
         */
        public void waitFor()
        {
            process.WaitForExit();
        }

        /**
         * Gets all console output of the binary.
         * Output retrieval is non-destructive and non-blocking.
         *
         * @return the console output of the executed binary.
         * @throws IOException
         */
        public string getConsoleOutput()
        {
            if (process == null)
            {
                return null;
            }

            return stream.ReadToEnd();
        }

        private void sleep(int timeInMillis)
        {
            try
            {
                Thread.Sleep(timeInMillis);
            }
            catch (ThreadInterruptedException e)
            {
                throw new WebDriverException("Thread was interrupted", e);
            }
        }

        public void Clean(FirefoxProfile profile)
        {
            StartProfile(profile, new string[] { "-silent" });
            try
            {
                waitFor();
            }
            catch (ThreadInterruptedException e)
            {
                throw new WebDriverException("Thread was interupted", e);
            }

            if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                while (profile.IsRunning)
                {
                    sleep(500);
                }

                do
                {
                    sleep(500);
                } while (profile.IsRunning);
            }
        }

        public long TimeoutInMilliseconds
        {
            get { return timeoutInMilliseconds; }
            set { timeoutInMilliseconds = value; }
        }

        public override string ToString()
        {
            return "FirefoxBinary(" + executable.ExecutablePath + ")";
        }

        //public void setOutputWatcher(OutputStream stream)
        //{
        //    this.stream = stream;
        //}

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

        //private static class OutputWatcher  {
        //  private Process process;
        //  private Stream stream;

        //  public OutputWatcher(Process process, Stream stream) {
        //    this.process = process;
        //    this.stream = stream;
        //  }

        //  public void Run() {
        //    int in = 0;
        //    while (in != -1) {
        //      try {
        //        in = process.getInputStream().read();
        //        stream.Write(in);
        //      } catch (IOException e) {
        //        System.err.println(e);
        //      }
        //    }
        //  }
        //}
    }
}
