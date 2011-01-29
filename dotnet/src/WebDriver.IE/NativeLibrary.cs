using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Utility class to wrap an unmanaged DLL and be responsible for freeing it.
    /// </summary>
    /// <remarks>
    /// This is a managed wrapper over the native LoadLibrary, GetProcAddress, 
    /// and FreeLibrary calls.
    /// </remarks>
    public sealed class NativeLibrary : IDisposable
    {
        // Unmanaged resource. CLR will ensure SafeHandles get freed, without 
        // requiring a finalizer on this class.
        private NativeLibrarySafeHandle libraryHandle;

        /// <summary>
        /// Initializes a new instance of the <see cref="NativeLibrary"/> class.
        /// </summary>
        /// <param name="fileName">full path name of dll to load</param>
        /// <exception cref="System.IO.FileNotFoundException">
        /// If fileName can't be found
        /// </exception>
        /// <remarks>
        /// This constructor loads a DLL and makes this class responible for 
        /// freeing it. Throws exceptions on failure. Most common failure would be 
        /// file-not-found, or that the file is not a loadable image.
        /// </remarks>
        public NativeLibrary(string fileName)
        {
            this.libraryHandle = NativeMethods.LoadLibrary(fileName);
            if (this.libraryHandle.IsInvalid)
            {
                int hr = Marshal.GetHRForLastWin32Error();
                Marshal.ThrowExceptionForHR(hr);
            }
        }

        /// <summary>
        /// Dynamically lookup a function in the dll via kernel32!GetProcAddress.
        /// </summary>
        /// <param name="functionName">The name of the function in the export table.</param>
        /// <param name="delegateType">The Type of the delegate to be returned.</param>
        /// <returns>A delegate to the unmanaged function. Returns 
        /// <see langword="null"/> if the function is not found.
        /// </returns>
        /// <remarks>
        /// GetProcAddress results are valid as long as the dll is not yet 
        /// unloaded. This is very very dangerous to use since you need to 
        /// ensure that the dll is not unloaded until after you're done with any 
        /// objects implemented by the dll. For example, if you get a delegate 
        /// that then gets an IUnknown implemented by this dll, you can not 
        /// dispose this library until that IUnknown is collected. Else, you may 
        /// free the library and then the CLR may call release on that IUnknown 
        /// and it will crash.
        /// </remarks>
        public Delegate GetUnmanagedFunction(string functionName, Type delegateType)
        {
            IntPtr procAddress = NativeMethods.GetProcAddress(this.libraryHandle, functionName);

            // Failure is a common case, especially for adaptive code.
            if (procAddress == IntPtr.Zero)
            {
                return null;
            }

            Delegate function = Marshal.GetDelegateForFunctionPointer(procAddress, delegateType);

            return function;
        }

        /// <summary>
        /// Call FreeLibrary on the unmanaged dll. All function pointers handed 
        /// out from this class become invalid after this.
        /// </summary>
        /// <remarks>
        /// This is very dangerous because it suddenly invalidate everything
        /// retrieved from this dll. This includes any functions handed out via 
        /// GetProcAddress, and potentially any objects returned from those 
        /// functions (which may have an implemention in the dll).
        /// </remarks>
        public void Dispose()
        {
            if (!this.libraryHandle.IsClosed)
            {
                this.libraryHandle.Close();
            }
        }
    }
}
