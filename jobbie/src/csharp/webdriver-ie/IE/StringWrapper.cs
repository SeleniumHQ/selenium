using System;
using System.Security.Permissions;
using System.Text;

using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class StringWrapper : IDisposable
    {
        private SafeStringWrapperHandle handle;

        /// <summary>
        /// Initializes a new instance of StringWrapper class
        /// </summary>
        /// <param name="stringHandle">Wrapper Handle</param>
        internal StringWrapper(SafeStringWrapperHandle stringHandle)
        {
            handle = stringHandle;
        }

        #region Properties
        /// <summary>
        /// Gets the value if a string
        /// </summary>
        public string Value
        {
            get
            {
                int length = Length;
                string returnValue = null;
                if (!handle.IsInvalid)
                {
                    StringBuilder result = new StringBuilder(length);
                    if (!handle.IsInvalid && NativeMethods.wdCopyString(handle, length, result) != WebDriverResult.Success)
                    {
                        Dispose();
                        throw new WebDriverException("Cannot copy string from native data to .NET string");
                    }

                    returnValue = result.ToString();
                }

                return returnValue;
            }
        }

        public SafeStringWrapperHandle Handle
        {
            get
            {
                return handle;
            }
        }

        private int Length
        {
            get
            {
                int length = 0;
                if (!handle.IsInvalid && NativeMethods.wdStringLength(handle, ref length) != WebDriverResult.Success)
                {
                    Dispose();
                    throw new WebDriverException("Cannot determine length of string");
                }

                return length;
            }
        }
        #endregion

        #region IDisposable Members

        /// <summary>
        /// Dispose of the objects
        /// </summary>
        public void Dispose()
        {
            handle.Dispose();
            GC.SuppressFinalize(this);
        }

        #endregion
    }
}
