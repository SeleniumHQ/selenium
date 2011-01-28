using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Provides a wrapper for the native-code Internet Explorer driver library.
    /// </summary>
    internal class NativeDriverLibrary : IDisposable
    {
        #region Private constants
        private const string LibraryName = "IEDriver.dll";
        private const string StartServerFunctionName = "StartServer";
        private const string StopServerFunctionName = "StopServer";
        private const string GetServerSessionCountFunctionName = "GetServerSessionCount";
        private const string NativeLibraryResourceTemplate = "WebDriver.InternetExplorerDriver.{0}.dll";
        #endregion

        #region Private member variables
        private static Random tempFileGenerator = new Random();
        private static NativeLibrarySafeHandle nativeLibraryHandle;
        private static object lockObject = new object();

        private IntPtr serverHandle = IntPtr.Zero;
        private string nativeLibraryPath = string.Empty;
        #endregion

        #region Private delegates
        private delegate IntPtr StartServerFunction(int port);

        private delegate void StopServerFunction(IntPtr serverHandle);
        
        private delegate int GetServerSessionCountFunction();
        #endregion

        /// <summary>
        /// Starts the HTTP server that drives the browser.
        /// </summary>
        /// <param name="port">The port on which to communicate with the server.</param>
        public void StartServer(int port)
        {
            this.LoadNativeLibrary();
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, StartServerFunctionName);
            StartServerFunction startServerFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StartServerFunction)) as StartServerFunction;
            this.serverHandle = startServerFunction(port);
            if (this.serverHandle == IntPtr.Zero)
            {
                throw new WebDriverException("An error occured while attempting to start the HTTP server");
            }
        }

        /// <summary>
        /// Releases all resources used by the NativeDriverLibrary class.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases the unmanaged resources used by the NativeDriverLibrary class 
        /// specifying whether to perform a normal dispose operation.
        /// </summary>
        /// <param name="disposing"><see langword="true"/> for a normal dispose
        /// operation; <see langword="false"/> to finalize the library.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!nativeLibraryHandle.IsInvalid)
            {
                IntPtr sessionCountFunctionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetServerSessionCountFunctionName);
                GetServerSessionCountFunction getSessionCountFunction = Marshal.GetDelegateForFunctionPointer(sessionCountFunctionPointer, typeof(GetServerSessionCountFunction)) as GetServerSessionCountFunction;
                int sessionCount = getSessionCountFunction();

                if (sessionCount == 0)
                {
                    IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, StopServerFunctionName);
                    StopServerFunction stopServerFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StopServerFunction)) as StopServerFunction;
                    stopServerFunction(this.serverHandle);
                    this.serverHandle = IntPtr.Zero;

                    this.UnloadNativeLibrary();
                }
            }
        }

        #region Private methods
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

        private void LoadNativeLibrary()
        {
            int errorCode = 0;
            lock (lockObject)
            {
                if (nativeLibraryHandle == null || nativeLibraryHandle.IsInvalid)
                {
                    this.ExtractNativeLibrary();
                    nativeLibraryHandle = NativeMethods.LoadLibrary(this.nativeLibraryPath);
                    errorCode = Marshal.GetLastWin32Error();
                }
            }

            if (nativeLibraryHandle.IsInvalid)
            {
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "An error (code: {0}) occured while attempting to load the native code library", errorCode));
            }
        }

        private void UnloadNativeLibrary()
        {
            if (!nativeLibraryHandle.IsClosed)
            {
                nativeLibraryHandle.Dispose();
            }

            // CONSIDER: Do we want to throw if we aren't able to free the
            // library? This code is called from Dispose(), so we really
            // shouldn't throw.
            if (nativeLibraryHandle.IsClosed)
            {
                nativeLibraryHandle = null;
                this.DeleteLibraryDirectory();
            }
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
        #endregion
    }
}
