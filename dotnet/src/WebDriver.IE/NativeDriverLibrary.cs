using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using System.Text;
using OpenQA.Selenium;
using OpenQA.Selenium.IE;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Provides a wrapper for the native-code Internet Explorer driver library.
    /// </summary>
    internal class NativeDriverLibrary
    {
        #region Private constants
        private const string LibraryName = "IEDriver.dll";
        private const string StartServerFunctionName = "StartServer";
        private const string StopServerFunctionName = "StopServer";
        private const string NativeLibraryResourceTemplate = "WebDriver.InternetExplorerDriver.{0}.dll";
        #endregion

        #region Private member variables
        private static Random tempFileGenerator = new Random();
        private static object lockObject = new object();
        private static NativeDriverLibrary libraryInstance;

        private IntPtr nativeLibraryHandle = IntPtr.Zero;
        private IntPtr serverHandle = IntPtr.Zero;
        private string nativeLibraryPath = string.Empty;
        private int refCount;
        #endregion

        #region Private delegates
        private delegate IntPtr StartServerFunction(int port);
        private delegate void StopServerFunction(IntPtr serverHandle);
        #endregion

        private NativeDriverLibrary()
        {
        }

        public static NativeDriverLibrary Instance
        {
            get
            {
                lock (lockObject)
                {
                    if (libraryInstance == null)
                    {
                        libraryInstance = new NativeDriverLibrary();
                    }
                }

                return libraryInstance;
            }
        }

        public void StartServer(int port)
        {
            //if (serverHandle == IntPtr.Zero || refCount == 0)
            if (refCount == 0)
            {
                ExtractNativeLibrary();
                LoadNativeLibrary();

                IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, StartServerFunctionName);
                StartServerFunction startServerFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StartServerFunction)) as StartServerFunction;
                serverHandle = startServerFunction(port);
                if (serverHandle == IntPtr.Zero)
                {
                    throw new WebDriverException("An error occured while attempting to start the HTTP server");
                }
            }

            refCount++;
        }

        public void StopServer()
        {
            refCount--;
            if (refCount == 0)
            {
                IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, StopServerFunctionName);
                StopServerFunction stopServerFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StopServerFunction)) as StopServerFunction;
                stopServerFunction(serverHandle);
                serverHandle = IntPtr.Zero;

                if (UnloadNativeLibrary())
                {
                    DeleteLibraryDirectory();
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
            nativeLibraryHandle = NativeMethods.LoadLibrary(nativeLibraryPath);
            if (nativeLibraryHandle == IntPtr.Zero)
            {
                int errorCode = Marshal.GetLastWin32Error();
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "An error (code: {0}) occured while attempting to load the native code library", errorCode));
            }
        }

        private bool UnloadNativeLibrary()
        {
            bool libraryFreed = NativeMethods.FreeLibrary(nativeLibraryHandle);
            int retryCount = 0;
            while (!libraryFreed && retryCount < 10)
            {
                System.Threading.Thread.Sleep(500);
                libraryFreed = NativeMethods.FreeLibrary(nativeLibraryHandle);
                retryCount++;
            }

            return libraryFreed;
        }

        private void WriteNativeLibraryFile(Stream libraryStream)
        {
            FileStream outputStream = File.Create(nativeLibraryPath);
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

            nativeLibraryPath = Path.Combine(nativeLibraryDirectory, LibraryName);
            string resourceName = GetNativeLibraryResourceName();
            Stream libraryStream = ResourceUtilities.GetResourceStream(LibraryName, resourceName);
            WriteNativeLibraryFile(libraryStream);
        }

        private void DeleteLibraryDirectory()
        {
            string nativeLibraryDirectory = Path.GetDirectoryName(nativeLibraryPath);
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
