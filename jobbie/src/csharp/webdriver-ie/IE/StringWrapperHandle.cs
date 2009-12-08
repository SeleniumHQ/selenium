using Microsoft.Win32.SafeHandles;
using System.Runtime.InteropServices;
using System;
using System.Text;

namespace OpenQa.Selenium.IE
{
    internal class StringWrapperHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        internal StringWrapperHandle()
            : base(true)
        {
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdStringLength(IntPtr handle, ref int length);
        public int Length
        {
            get
            {
                int length = 0;
                if (wdStringLength(handle, ref length) != 0)
                {
                    throw new Exception("Doh!");
                }
                return length;
            }
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdCopyString(IntPtr handle, int length, [Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder res);
        public string Value
        {
            get
            {
                int length = Length;
                StringBuilder result = new StringBuilder(length);
                wdCopyString(handle, length, result);
                return result.ToString();
            }
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdFreeString(IntPtr driver);
        protected override bool ReleaseHandle()
        {
            wdFreeString(handle);
            // TODO(simonstewart): Are we really always successful?
            return true;
        }
    }
}
