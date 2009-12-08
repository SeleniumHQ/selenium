using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

namespace OpenQa.Selenium.IE
{
    class ElementCollection
    {
        SafeInternetExplorerDriverHandle driverHandle;
        InternetExplorerDriver driver;
        IntPtr elements;

        public ElementCollection(InternetExplorerDriver driver, SafeInternetExplorerDriverHandle driverHandle, IntPtr elements)
        {
            this.driver = driver;
            this.driverHandle = driverHandle;
            this.elements = elements;
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdcGetElementCollectionLength(IntPtr elementCollection, ref int count);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdcGetElementAtIndex(IntPtr elementCollection, int index, ref ElementWrapper result);
        public List<IWebElement> ToList()
        {
            List<IWebElement> toReturn = new List<IWebElement>();
            int nelements = 0;
            wdcGetElementCollectionLength(elements, ref nelements);
            for (int i = 0; i < nelements; i++)
            {
                ElementWrapper wrapper = new ElementWrapper();
                int result = wdcGetElementAtIndex(elements, i, ref wrapper);
                //OPTIMIZATION: Check for a success value, then run through the
                //VerifyErrorCode which will throw the proper exception
                if ((ErrorCodes)result != ErrorCodes.Success)
                {
                    try
                    {
                        ErrorHandler.VerifyErrorCode(result, "");
                    }
                    catch (Exception e)
                    {
                        //We need to process the exception to free the memory.
                        //Then we can wrap and rethrow.
                        freeElements(elements);
                        throw new WebDriverException("Could not retrieve element " + i + " from element collection", e);
                    }
                }
                toReturn.Add(new InternetExplorerWebElement(driver, wrapper));
                
            }
            //TODO(andre.nogueira): from the java code (elementcollection.java)... "Free memory from the collection"
            freeCollection(elements);
            return toReturn;
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdFreeElementCollection(IntPtr elementCollection, int index);
        private void freeElements(IntPtr rawElements)
        {
            wdFreeElementCollection(rawElements, 1);
        }

        private void freeCollection(IntPtr rawElements)
        {
            wdFreeElementCollection(rawElements, 0);
        }

    }
}
