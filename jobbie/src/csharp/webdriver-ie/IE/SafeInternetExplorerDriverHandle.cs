using Microsoft.Win32.SafeHandles;
using System.Runtime.InteropServices;
using System;

namespace OpenQa.Selenium.IE
{
    internal class SafeInternetExplorerDriverHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        internal SafeInternetExplorerDriverHandle()
            : base(true)
        {
        }

        [DllImport("InternetExplorerDriver")]
        public static extern void wdFreeString(IntPtr str);

        [DllImport("InternetExplorerDriver")]
        public static extern Int32 wdStringLength(IntPtr str, ref IntPtr length);

        [DllImport("InternetExplorerDriver")]
        public static extern void wdFreeDriver(IntPtr driver);

        [DllImport("InternetExplorerDriver")]
        public static extern int wdClose(IntPtr driver);

        public void CloseDriver()
        {
            // Need a seperate method from Close() for closing the driver.
            // Calling Close() on the driver does not imply the same semantics
            // as Quit(). In other words, we may want to close the driver, but
            // not free it.
            int result = wdClose(handle);
            if ((ErrorCodes)result != ErrorCodes.Success)
            {
                throw new InvalidOperationException("Unable to close driver: " + result.ToString());
            }
        }

        protected override bool ReleaseHandle()
        {
            wdFreeDriver(handle);
            // TODO(simonstewart): Are we really always successful?
            return true;
        }
    }
}
