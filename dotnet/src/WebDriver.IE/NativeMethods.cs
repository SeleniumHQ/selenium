using System;
using System.Runtime.ConstrainedExecution;
using System.Runtime.InteropServices;
using System.Text;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Provides entry points into needed unmanaged APIs.
    /// </summary>
    internal static class NativeMethods
    {
        [DllImport("kernel32", CharSet = CharSet.Unicode, SetLastError = true)]
        internal static extern NativeLibrarySafeHandle LoadLibrary(string lpFileName);

        [DllImport("kernel32", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true, BestFitMapping = false)]
        internal static extern IntPtr GetProcAddress(NativeLibrarySafeHandle hModule, [MarshalAs(UnmanagedType.LPStr)]string procName);

        [ReliabilityContract(Consistency.WillNotCorruptState, Cer.Success)]
        [DllImport("kernel32", SetLastError = true)]
        [return:MarshalAs(UnmanagedType.Bool)]
        internal static extern bool FreeLibrary(IntPtr hModule);
    }
}
