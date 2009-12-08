using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

namespace OpenQa.Selenium.IE
{
    // TODO(andre.nogueira): StringCollection, ElementCollection and StringWrapperHandle should be consistent among them
    class StringCollection
    {
        SafeInternetExplorerDriverHandle driverHandle;
        InternetExplorerDriver driver;
        IntPtr elements;

        public StringCollection(InternetExplorerDriver driver, SafeInternetExplorerDriverHandle driverHandle, IntPtr elements)
        {
            this.driver = driver;
            this.driverHandle = driverHandle;
            this.elements = elements;
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdcGetStringCollectionLength(IntPtr elementCollection, ref int count);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdcGetStringAtIndex(IntPtr elementCollection, int index, ref StringWrapperHandle result);
        public List<String> ToList()
        {
            List<String> toReturn = new List<String>();
            int nelements = 0;
            wdcGetStringCollectionLength(elements, ref nelements);
            for (int i = 0; i < nelements; i++)
            {
                StringWrapperHandle wrapper = new StringWrapperHandle();
                int result = wdcGetStringAtIndex(elements, i, ref wrapper);
                //TODO(andre.nogueira): I don't like this very much... Maybe add a ErrorHandler.IsError or something?
                try
                {
                    ErrorHandler.VerifyErrorCode(result, "");
                } 
                catch (Exception)
                {
                    //TODO(andre.nogueira): More suitable exception
                    throw new Exception("Could not retrieve element " + i + " from element collection");
                }
                toReturn.Add(wrapper.Value);
                
            }
            //TODO(andre.nogueira): from the java code (elementcollection.java)... "Free memory from the collection"
            FreeCollection(elements);
            return toReturn;
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdFreeStringCollection(IntPtr elementCollection);
        private void FreeCollection(IntPtr rawElements)
        {
            wdFreeStringCollection(rawElements);
        }

    }
}
