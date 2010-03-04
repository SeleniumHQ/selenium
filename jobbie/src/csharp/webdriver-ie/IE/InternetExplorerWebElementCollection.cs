using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Collection of Elements from Internet Explorer
    /// </summary>
    internal class InternetExplorerWebElementCollection : IDisposable
    {
        private InternetExplorerDriver driver;
        private SafeWebElementCollectionHandle collectionHandle;

        /// <summary>
        /// Initializes a new instance of the InternetExplorerWebElementCollection class
        /// </summary>
        /// <param name="driver">driver in use</param>
        /// <param name="elements">Elements on the page</param>
        public InternetExplorerWebElementCollection(InternetExplorerDriver driver, SafeWebElementCollectionHandle elements)
        {
            this.driver = driver;
            collectionHandle = elements;
        }

        /// <summary>
        /// Converts a Collection of elements into a list
        /// </summary>
        /// <returns>List of IWebElement</returns>
        public List<IWebElement> ToList()
        {
            List<IWebElement> toReturn = new List<IWebElement>();
            int numberOfElements = 0;
            NativeDriverLibrary.Instance.GetElementCollectionLength(collectionHandle, ref numberOfElements);
            for (int i = 0; i < numberOfElements; i++)
            {
                SafeInternetExplorerWebElementHandle wrapper = new SafeInternetExplorerWebElementHandle();
                WebDriverResult result = NativeDriverLibrary.Instance.GetElementAtIndex(collectionHandle, i, ref wrapper);

                // OPTIMIZATION: Check for a success value, then run through the
                // VerifyErrorCode which will throw the proper exception
                if (result != WebDriverResult.Success)
                {
                    try
                    {
                        ResultHandler.VerifyResultCode(result, string.Empty);
                    }
                    catch (Exception e)
                    {
                        // We need to process the exception to free the memory.
                        // Then we can wrap and rethrow.
                        collectionHandle.FreeElementsOnDispose = true;
                        Dispose();
                        throw new WebDriverException("Could not retrieve element " + i + " from element collection", e);
                    }
                }

                toReturn.Add(new InternetExplorerWebElement(driver, wrapper));
            }
            ////TODO(andre.nogueira): from the java code (elementcollection.java)... "Free memory from the collection"
            return toReturn;
        }

        #region IDisposable Members

        /// <summary>
        /// Dispose of the object
        /// </summary>
        public void Dispose()
        {
            collectionHandle.Dispose();
            GC.SuppressFinalize(this);
        }

        #endregion
    }
}
