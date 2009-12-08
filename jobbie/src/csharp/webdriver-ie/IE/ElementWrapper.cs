using Microsoft.Win32.SafeHandles;
using System.Runtime.InteropServices;
using System;

namespace OpenQa.Selenium.IE
{
    internal class ElementWrapper : SafeHandleZeroOrMinusOneIsInvalid
    {
        internal ElementWrapper()
            : base(true)
        {
        }

        [DllImport("InternetExplorerDriver")]
        private static extern void wdeFreeElement(IntPtr handle);

        protected override bool ReleaseHandle()
        {
            wdeFreeElement(handle);
            // TODO(simonstewart): Are we really always successful?
            return true;
        }
    }
}
