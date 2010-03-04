using System;
using System.Collections.Generic;
using System.Globalization;
using System.Security.Permissions;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Create and manage collections of strings
    /// </summary>
    /// TODO(andre.nogueira): StringCollection, ElementCollection and StringWrapperHandle should be consistent among them
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class StringCollection : IDisposable
    {
        private SafeStringCollectionHandle handle;

        /// <summary>
        /// Initializes a new instance of the StringCollection class.
        /// </summary>
        /// <param name="elementCollectionHandle">element collection handler</param>
        public StringCollection(SafeStringCollectionHandle elementCollectionHandle)
        {
            handle = elementCollectionHandle;
        }

        /// <summary>
        /// Converts the Collection to a list
        /// </summary>
        /// <returns>A list of strings </returns>
        public List<string> ToList()
        {
            int elementCount = 0;
            WebDriverResult result = NativeDriverLibrary.Instance.GetStringCollectionLength(handle, ref elementCount);
            if (result != WebDriverResult.Success)
            {
                Dispose();
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Cannot extract strings from collection: {0}", result));
            }

            List<string> toReturn = new List<string>();
            for (int i = 0; i < elementCount; i++)
            {
                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
                result = NativeDriverLibrary.Instance.GetStringAtIndex(handle, i, ref stringHandle);
                if (result != WebDriverResult.Success)
                {
                    stringHandle.Dispose();
                    Dispose();
                    throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Cannot extract string from collection at index: {0} ({1})", i, result));
                }

                using (StringWrapper wrapper = new StringWrapper(stringHandle))
                {
                    toReturn.Add(wrapper.Value);
                }
            }

            // TODO(andre.nogueira): from the java code (elementcollection.java)... "Free memory from the collection"
            // Dispose();
            return toReturn;
        }

        #region IDisposable Members
        /// <summary>
        /// Dispose of the object
        /// </summary>
        public void Dispose()
        {
            handle.Dispose();
            GC.SuppressFinalize(this);
        }

        #endregion
    }
}
