using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using Microsoft.Win32;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Provides a mechanism to find the Chrome Binary
    /// </summary>
    internal class ChromeBinary
    {
        private static readonly string[] chromePaths = new string[] 
        {
            "/usr/bin/google-chrome",
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            string.Concat("/Users/", Environment.UserName, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
        };

        private const int ShutdownWaitInterval = 2000;
        private const int StartWaitInterval = 2500;
        private static int linearStartWaitCoefficient = 1;
        private ChromeProfile profile;
        private ChromeExtension extension;
        private Process chromeProcess;
        private static string chromeFile = string.Empty;

        /// <summary>
        /// Initializes a new instance of the ChromeBinary class using the given <see cref="ChromeProfile"/> and <see cref="extension"/>.
        /// </summary>
        /// <param name="profile">The Chrome profile to use.</param>
        /// <param name="extension">The extension to launch Chrome with.</param>
        internal ChromeBinary(ChromeProfile profile, ChromeExtension extension)
        {
            this.profile = profile;
            this.extension = extension;
        }

        private string Arguments
        {
            get
            {
                return String.Concat(" --user-data-dir=\"", profile.ProfileDirectory, "\"", " --load-extension=\"", extension.ExtensionDirectory, "\"", " --activate-on-launch", " --homepage=about:blank", " --no-first-run", " --disable-hang-monitor", " --disable-popup-blocking", " --disable-prompt-on-repost", " --no-default-browser-check ");
            }
        }

        /// <summary>
        /// Increases the wait time
        /// </summary>
        /// <param name="diff">How long to wait</param>
        public static void IncrementStartWaitInterval(int diff)
        {
            linearStartWaitCoefficient += diff;
        }

        /// <summary>
        ///  Starts the Chrome process for WebDriver. Assumes the passed directories exist.
        /// </summary>
        /// <param name="serverUrl">URL from which commands should be requested</param>
        /// <exception cref="WebDriverException">When it can't launch will throw an error</exception>
        public void Start(string serverUrl)
        {
            try
            {
                chromeProcess = Process.Start(new ProcessStartInfo(GetChromeFile(), String.Concat(Arguments, serverUrl)) { UseShellExecute = false });
            }
            catch (IOException e)
            { // TODO(AndreNogueira): Check exception type thrown when process.start fails
                throw new WebDriverException("Could not start Chrome process", e);
            }

            Thread.Sleep(StartWaitInterval * linearStartWaitCoefficient);
        }

        /// <summary>
        /// Kills off the Browser Instance
        /// </summary>
        public void Kill()
        {
            if ((chromeProcess != null) && !chromeProcess.HasExited)
            {
                // Ask nicely to close.
                chromeProcess.CloseMainWindow();
                chromeProcess.WaitForExit(ShutdownWaitInterval);

                // If it still hasn't closed, be rude.
                if (!chromeProcess.HasExited)
                {
                    chromeProcess.Kill();
                }

                chromeProcess = null;
            }
        }

        /// <summary>
        /// Locates the Chrome executable on the current platform. First looks in the webdriver.chrome.bin property, then searches
        /// through the default expected locations.
        /// </summary>
        /// <returns>chrome.exe path</returns>
        private static string GetChromeFile()
        {
            if (!IsChromeBinaryLocationKnown())
            {
                string chromeFileSystemProperty = Environment.GetEnvironmentVariable("webdriver.chrome.bin");
                if (chromeFileSystemProperty != null)
                {
                    chromeFile = chromeFileSystemProperty;
                }
                else
                {
                    if (Platform.CurrentPlatform.IsPlatformType(PlatformType.XP) || Platform.CurrentPlatform.IsPlatformType(PlatformType.Vista))
                    {
                        try
                        {
                            chromeFile = ChromePathFromRegistry;

                        }
                        catch (NullReferenceException)
                        {
                            if (Platform.CurrentPlatform.IsPlatformType(PlatformType.XP))
                            {
                                chromeFile =
                                    Path.Combine(
                                        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                                        "Google\\Chrome\\Application\\chrome.exe");
                            }else
                            {
                                chromeFile = Path.Combine(Path.GetTempPath(),
                                                          "..\\Google\\Chrome\\Application\\chrome.exe");
                            }
                        }
                    }
                    else if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Unix))
                    {
                        // Thanks to a bug in Mono Mac and Linux will be treated the same  https://bugzilla.novell.com/show_bug.cgi?id=515570 but adding this in case
                        string chromeFileString = string.Empty;
                        bool foundPath = false;
                        foreach (string path in chromePaths)
                        {
                            FileInfo binary = new FileInfo(path);
                            if (binary.Exists)
                            {
                                chromeFileString = binary.FullName;
                                foundPath = true;
                                break;
                            }
                        }

                        if (!foundPath)
                        {
                            throw new WebDriverException("Couldn't locate Chrome. Set webdriver.chrome.bin");
                        }

                        chromeFile = chromeFileString;
                    }
                    else
                    {
                        throw new WebDriverException(
                            "Unsupported operating system. Could not locate Chrome.  Set webdriver.chrome.bin");
                    }
                }
            }

            return chromeFile;
        }

        private static bool IsChromeBinaryLocationKnown()
        {
            return !string.IsNullOrEmpty(chromeFile) && File.Exists(chromeFile);
        }

        private static string ChromePathFromRegistry
        {
            get
            {
                return Registry.LocalMachine.OpenSubKey(
                                    "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\").GetValue("chrome.exe").
                                    ToString();
            }
        }
    }
}
