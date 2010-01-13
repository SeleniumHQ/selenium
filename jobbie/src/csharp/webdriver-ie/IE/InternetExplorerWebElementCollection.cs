using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

namespace OpenQA.Selenium.IE
{
    internal class InternetExplorerWebElementCollection : IDisposable
    {
        InternetExplorerDriver driver;
        SafeWebElementCollectionHandle collectionHandle;

        public InternetExplorerWebElementCollection(InternetExplorerDriver driver, SafeWebElementCollectionHandle elements)
        {
            this.driver = driver;
            collectionHandle = elements;
        }

        public List<IWebElement> ToList()
        {
            List<IWebElement> toReturn = new List<IWebElement>();
            int numberOfElements = 0;
            NativeMethods.wdcGetElementCollectionLength(collectionHandle, ref numberOfElements);
            for (int i = 0; i < numberOfElements; i++)
            {
                SafeInternetExplorerWebElementHandle wrapper = new SafeInternetExplorerWebElementHandle();
                WebDriverResult result = NativeMethods.wdcGetElementAtIndex(collectionHandle, i, ref wrapper);
                //OPTIMIZATION: Check for a success value, then run through the
                //VerifyErrorCode which will throw the proper exception
                if (result != WebDriverResult.Success)
                {
                    try
                    {
                        ResultHandler.VerifyResultCode(result, string.Empty);
                    }
                    catch (Exception e)
                    {
                        //We need to process the exception to free the memory.
                        //Then we can wrap and rethrow.
                        collectionHandle.FreeElementsOnDispose = true;
                        Dispose();
                        throw new WebDriverException("Could not retrieve element " + i + " from element collection", e);
                    }
                }
                toReturn.Add(new InternetExplorerWebElement(driver, wrapper));
                
            }
            //TODO(andre.nogueira): from the java code (elementcollection.java)... "Free memory from the collection"
            return toReturn;
        }

        #region IDisposable Members

        public void Dispose()
        {
            collectionHandle.Dispose();
            GC.SuppressFinalize(this);
        }

        #endregion
    }
}
