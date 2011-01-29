using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Provides a wrapper for the native-code Internet Explorer driver library.
    /// </summary>
    internal class InternetExplorerDriverServer : IDisposable
    {
        #region Private constants
        private const string LibraryName = "IEDriver.dll";
        private const string StartServerFunctionName = "StartServer";
        private const string StopServerFunctionName = "StopServer";
        private const string GetServerSessionCountFunctionName = "GetServerSessionCount";
        private const string GetServerPortFunctionName = "GetServerPort";
        private const string ServerIsRunningFunctionName = "ServerIsRunning";
        private const string NativeLibraryResourceTemplate = "WebDriver.InternetExplorerDriver.{0}.dll";
        #endregion

        private static Random tempFileGenerator = new Random();
        private static NativeLibrary library;
        private string nativeLibraryPath = string.Empty;
        private IntPtr serverHandle = IntPtr.Zero;

        /// <summary>
        /// Initializes a new instance of the <see cref="InternetExplorerDriverServer"/> class.
        /// </summary>
        public InternetExplorerDriverServer()
        {
            // Only one copy of the native code library should be loaded into
            // the process at any given time.
            if (!LibraryIsLoaded)
            {
                this.ExtractNativeLibrary();
                library = new NativeLibrary(this.nativeLibraryPath);
            }
        }

        #region Private delegates
        private delegate IntPtr StartServerFunction(int port);

        private delegate void StopServerFunction(IntPtr serverHandle);

        private delegate int GetServerSessionCountFunction();

        private delegate int GetServerPortFunction();
        
        private delegate bool ServerIsRunningFunction();
        #endregion

        /// <summary>
        /// Gets a value indicating whether the unmanaged native code library has been loaded.
        /// </summary>
        public static bool LibraryIsLoaded
        {
            get { return library != null; }
        }

        /// <summary>
        /// Gets a value indicating whether the Internet Explorer driver server is running.
        /// </summary>
        public static bool IsRunning
        {
            get
            {
                bool running = false;
                if (LibraryIsLoaded)
                {
                    ServerIsRunningFunction isRunningFunction = library.GetUnmanagedFunction(ServerIsRunningFunctionName, typeof(ServerIsRunningFunction)) as ServerIsRunningFunction;
                    if (isRunningFunction != null)
                    {
                        running = isRunningFunction();
                    }
                }

                return running;
            }
        }

        /// <summary>
        /// Starts the server, communicating on the specified port, if it is not already running
        /// </summary>
        /// <param name="port">The port on which the server should listen for requests.</param>
        /// <returns>The port on which the server is actually listening for requests.</returns>
        /// <remarks>If the server has already been started, there is no need to start it
        /// again. We can leverage the already-running server, and the port it is listening
        /// on.</remarks>
        public int Start(int port)
        {
            if (IsRunning)
            {
                GetServerPortFunction getPortFunction = library.GetUnmanagedFunction(GetServerPortFunctionName, typeof(GetServerPortFunction)) as GetServerPortFunction;
                if (getPortFunction != null)
                {
                    port = getPortFunction();
                }
            }
            else
            {
                StartServerFunction startFunction = library.GetUnmanagedFunction(StartServerFunctionName, typeof(StartServerFunction)) as StartServerFunction;
                if (startFunction != null)
                {
                    this.serverHandle = startFunction(port);
                }
            }

            return port;
        }

        /// <summary>
        /// Releases all resources used by this InternetExplorerDriverServer.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases all resources used by this InternetExplorerDriverServer.
        /// </summary>
        /// <param name="disposing"><see langword="true"/> to dispose of managed and unmanaged resources;
        /// <see langword="false"/> to only dispose of unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (LibraryIsLoaded && IsRunning)
                {
                    GetServerSessionCountFunction getSessionCountFunction = library.GetUnmanagedFunction(GetServerSessionCountFunctionName, typeof(GetServerSessionCountFunction)) as GetServerSessionCountFunction;
                    if (getSessionCountFunction != null)
                    {
                        int sessionCount = getSessionCountFunction();
                        if (sessionCount == 0)
                        {
                            StopServerFunction stopFunction = library.GetUnmanagedFunction(StopServerFunctionName, typeof(StopServerFunction)) as StopServerFunction;
                            if (stopFunction != null)
                            {
                                stopFunction(this.serverHandle);
                                this.serverHandle = IntPtr.Zero;
                            }

                            library.Dispose();
                            library = null;
                            this.DeleteLibraryDirectory();
                        }
                    }
                }
            }
        }

        private static string GetNativeLibraryResourceName()
        {
            // We're compiled as Any CPU, which will run as a 64-bit process
            // on 64-bit OS, and 32-bit process on 32-bit OS. Thus, checking
            // the size of IntPtr is good enough.
            string resourceName = string.Empty;
            if (IntPtr.Size == 8)
            {
                resourceName = string.Format(CultureInfo.InvariantCulture, NativeLibraryResourceTemplate, "x64");
            }
            else
            {
                resourceName = string.Format(CultureInfo.InvariantCulture, NativeLibraryResourceTemplate, "x86");
            }

            return resourceName;
        }

        private void WriteNativeLibraryFile(Stream libraryStream)
        {
            FileStream outputStream = File.Create(this.nativeLibraryPath);
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

        private void ExtractNativeLibrary()
        {
            string nativeLibraryFolderName = string.Format(CultureInfo.InvariantCulture, "webdriver{0}libs", tempFileGenerator.Next());
            string nativeLibraryDirectory = Path.Combine(Path.GetTempPath(), nativeLibraryFolderName);
            if (!Directory.Exists(nativeLibraryDirectory))
            {
                Directory.CreateDirectory(nativeLibraryDirectory);
            }

            this.nativeLibraryPath = Path.Combine(nativeLibraryDirectory, LibraryName);
            string resourceName = GetNativeLibraryResourceName();
            Stream libraryStream = ResourceUtilities.GetResourceStream(LibraryName, resourceName);
            this.WriteNativeLibraryFile(libraryStream);
        }

        private void DeleteLibraryDirectory()
        {
            string nativeLibraryDirectory = Path.GetDirectoryName(this.nativeLibraryPath);
            int numberOfRetries = 0;
            while (Directory.Exists(nativeLibraryDirectory) && numberOfRetries < 10)
            {
                try
                {
                    Directory.Delete(nativeLibraryDirectory, true);
                }
                catch (IOException)
                {
                    // If we hit an exception (like file still in use), wait a half second
                    // and try again. If we still hit an exception, go ahead and let it through.
                    System.Threading.Thread.Sleep(500);
                }
                catch (UnauthorizedAccessException)
                {
                    // If we hit an exception (like file still in use), wait a half second
                    // and try again. If we still hit an exception, go ahead and let it through.
                    System.Threading.Thread.Sleep(500);
                }
                finally
                {
                    numberOfRetries++;
                }
            }

            if (Directory.Exists(nativeLibraryDirectory))
            {
                Console.WriteLine("Unable to delete native library directory '{0}'", nativeLibraryDirectory);
            }
        }
    }
}
