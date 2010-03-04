using System;
using System.Security.Permissions;
using System.Text;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Wrapper class for Strings
    /// </summary>
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class StringWrapper : IDisposable
    {
        private SafeStringWrapperHandle handle;

        /// <summary>
        /// Initializes a new instance of the StringWrapper class
        /// </summary>
        /// <param name="stringHandle">Instance of the <see cref="SafeStringWrapperHandle"/></param>
        internal StringWrapper(SafeStringWrapperHandle stringHandle)
        {
            handle = stringHandle;
        }

        /// <summary>
        /// Gets the value the value of the string from the native driver
        /// </summary>
        public string Value
        {
            get
            {
                string returnValue = null;
                if (!handle.IsInvalid)
                {
                    int length = Length;
                    StringBuilder result = new StringBuilder(length);
                    if (NativeDriverLibrary.Instance.CopyString(handle, length, result) != WebDriverResult.Success)
                    {
                        Dispose();
                        throw new WebDriverException("Cannot copy string from native data to .NET string");
                    }

                    returnValue = result.ToString();
                }

                return returnValue;
            }
        }

        private int Length
        {
            get
            {
                int length = 0;
                if (!handle.IsInvalid)
                {
                    if (NativeDriverLibrary.Instance.StringLength(handle, ref length) != WebDriverResult.Success)
                    {
                        Dispose();
                        throw new WebDriverException("Cannot determine length of string");
                    }
                }

                return length;
            }
        }

        #region IDisposable Members

        /// <summary>
        /// Disposes of the objects
        /// </summary>
        public void Dispose()
        {
            handle.Dispose();
            GC.SuppressFinalize(this);
        }

        #endregion
    }
}
