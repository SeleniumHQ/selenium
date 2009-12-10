using System;
using System.Text;
using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class StringWrapper : IDisposable
    {
        protected SafeStringWrapperHandle handle;

        internal StringWrapper(SafeStringWrapperHandle stringHandle)
        {
            handle = stringHandle;
        }

        private int Length
        {
            get
            {
                int length = 0;
                if (NativeMethods.wdStringLength(handle, ref length) != WebDriverResult.Success)
                {
                    Dispose();
                    throw new WebDriverException("Cannot determine length of string");
                }
                return length;
            }
        }

        public string Value
        {
            get
            {
                int length = Length;
                StringBuilder result = new StringBuilder(length);
                if (NativeMethods.wdCopyString(handle, length, result) != WebDriverResult.Success)
                {
                    Dispose();
                    throw new WebDriverException("Cannot copy string from native data to .NET string");
                }
                return result.ToString();
            }
        }

        #region IDisposable Members

        public void Dispose()
        {
            handle.Dispose();
            GC.SuppressFinalize(this);
        }

        #endregion
    }
}
