using System;
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
        internal static extern IntPtr LoadLibrary(string lpFileName);

        [DllImport("kernel32", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
        internal static extern IntPtr GetProcAddress(IntPtr hModule, string procName);
    }
}
