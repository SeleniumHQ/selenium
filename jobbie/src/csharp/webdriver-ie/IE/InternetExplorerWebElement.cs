using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Drawing;
using OpenQA.Selenium.Internal;
using System.Collections.ObjectModel;
using System.Globalization;

namespace OpenQA.Selenium.IE
{
    class InternetExplorerWebElement : IRenderedWebElement, ISearchContext, ILocatable, IDisposable
    {
        private SafeInternetExplorerWebElementHandle elementHandle;
        private InternetExplorerDriver driver;

        public InternetExplorerWebElement(InternetExplorerDriver driver, SafeInternetExplorerWebElementHandle wrapper)
        {
            this.driver = driver;
            this.elementHandle = wrapper;
        }

        internal SafeInternetExplorerWebElementHandle Wrapper
        {
            get { return elementHandle; }
        }

        public string Text
        {
            get 
            {
                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
                WebDriverResult result = NativeMethods.wdeGetText(elementHandle, ref stringHandle);
                ResultHandler.VerifyResultCode(result, "get the Text property");
                string returnValue = string.Empty;
                using (StringWrapper wrapper = new StringWrapper(stringHandle))
                {
                    // StringWrapper correctly disposes of the handle
                    returnValue = wrapper.Value;
                }
                return returnValue;
            }
        }

        public string TagName
        {
            get
            {
                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
                WebDriverResult result = NativeMethods.wdeGetTagName(elementHandle, ref stringHandle);
                ResultHandler.VerifyResultCode(result, "get the Value property");
                string returnValue = string.Empty;
                using (StringWrapper wrapper = new StringWrapper(stringHandle))
                {
                    // StringWrapper correctly disposes of the handle
                    returnValue = wrapper.Value;
                }
                return returnValue;
            }
        }

        public bool Enabled
        {
            get 
            {
                int enabled = 0;
                WebDriverResult result = NativeMethods.wdeIsEnabled(elementHandle, ref enabled);
                ResultHandler.VerifyResultCode(result, "get the Enabled property");
                return (enabled == 1);
            }
        }
	
        public void Clear()
        {
            WebDriverResult result = NativeMethods.wdeClear(elementHandle);
            ResultHandler.VerifyResultCode(result, "clear the element");
        }

        public void SendKeys(string text)
        {
            WebDriverResult result = NativeMethods.wdeSendKeys(elementHandle, text);            
            ResultHandler.VerifyResultCode(result, "send keystrokes to the element");
        }

        public void Submit()
        {
            WebDriverResult result = NativeMethods.wdeSubmit(elementHandle);
            ResultHandler.VerifyResultCode(result, "submit the element");
        }

        public void Click()
        {
            WebDriverResult result = NativeMethods.wdeClick(elementHandle);
            ResultHandler.VerifyResultCode(result, "click the element");
        }

        public string GetAttribute(string attributeName)
        {
            SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
            WebDriverResult result = NativeMethods.wdeGetAttribute(elementHandle, attributeName, ref stringHandle);
            ResultHandler.VerifyResultCode(result, string.Format(CultureInfo.InvariantCulture, "getting attribute '{0}' of the element", attributeName));
            string returnValue = string.Empty;
            using (StringWrapper wrapper = new StringWrapper(stringHandle))
            {
                returnValue = wrapper.Value;
            }
            return returnValue;
        }

        public string Value
        {
            get { return GetAttribute("value"); }
        }


        public bool Selected
        {
            get
            {
                int selected = 0;
                WebDriverResult result = NativeMethods.wdeIsSelected(elementHandle, ref selected);
                ResultHandler.VerifyResultCode(result, "Checking if element is selected");
                return (selected == 1);
            }
            set
            {
                WebDriverResult result = NativeMethods.wdeSetSelected(elementHandle);
                ResultHandler.VerifyResultCode(result, "(Un)selecting element");
            }
        }

        public bool Toggle()
        {
            int toggled = 0;
            WebDriverResult result = NativeMethods.wdeToggle(elementHandle, ref toggled);
            ResultHandler.VerifyResultCode(result, "Toggling element");
            return (toggled == 1);
        }

        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(new Finder(driver, elementHandle));
        }

        public IWebElement FindElement(By by)
        {
            return by.FindElement(new Finder(driver, elementHandle));
        }

        public WebDriverResult AddToScriptArgs(SafeScriptArgsHandle scriptArgs)
        {
            WebDriverResult result = NativeMethods.wdAddElementScriptArg(scriptArgs, elementHandle);
            ResultHandler.VerifyResultCode(result, "adding to script arguments");
            return result;
        }

        public Point LocationOnScreenOnceScrolledIntoView
        {
            get
            {
                Point location = Point.Empty;
                int x = 0;
                int y = 0;
                int width = 0;
                int height = 0;
                IntPtr hwnd = IntPtr.Zero;

                WebDriverResult result = NativeMethods.wdeGetDetailsOnceScrolledOnToScreen(elementHandle, ref hwnd, ref x, ref y, ref width, ref height);
                ResultHandler.VerifyResultCode(result, "get the location once scrolled onto the screen");
                location = new Point(x, y);
                return location;
            }
        }

        public Point Location
        {
            get
            {
                Point elementLocation = Point.Empty;
                int x = 0;
                int y = 0;
                WebDriverResult result = NativeMethods.wdeGetLocation(elementHandle, ref x, ref y);
                ResultHandler.VerifyResultCode(result, "get the location");
                elementLocation = new Point(x, y);
                return elementLocation;
            }
        }


        public Size Size
        {
            get
            {
                Size elementSize = Size.Empty;
                int width = 0;
                int height = 0;
                WebDriverResult result = NativeMethods.wdeGetSize(elementHandle, ref width, ref height);

                ResultHandler.VerifyResultCode(result, "get the size");
                elementSize = new Size(width, height);
                return elementSize;
            }
        }

        public bool Displayed
        {
            get
            {
                int displayed = 0;
                WebDriverResult result = NativeMethods.wdeIsDisplayed(elementHandle, ref displayed);
                ResultHandler.VerifyResultCode(result, "get the Displayed property");
                return (displayed == 1);
            }
        }

        public string GetValueOfCssProperty(string propertyName)
        {
            SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
            WebDriverResult result = NativeMethods.wdeGetValueOfCssProperty(elementHandle, propertyName, ref stringHandle);
            ResultHandler.VerifyResultCode(result, string.Format(CultureInfo.InvariantCulture, "get the value of CSS property '{0}'", propertyName));
            string returnValue = string.Empty;
            using (StringWrapper wrapper = new StringWrapper(stringHandle))
            {
                returnValue = wrapper.Value;
            }
            return returnValue;
        }

        public void Hover()
        {
            IntPtr hwnd = IntPtr.Zero;
            int x = 0;
            int y = 0;
            int width = 0;
            int height = 0;
            WebDriverResult result = NativeMethods.wdeGetDetailsOnceScrolledOnToScreen(elementHandle, ref hwnd, ref x, ref y, ref width, ref height);

            ResultHandler.VerifyResultCode(result, "hover");

            int midX = x + (width / 2);
            int midY = y + (height / 2);

            result = NativeMethods.wdeMouseMoveTo(hwnd, 100, 0, 0, midX, midY);

            ResultHandler.VerifyResultCode(result, "hover mouse move");
        }

        public void DragAndDropBy(int moveRightBy, int moveDownBy)
        {
            IntPtr hwnd = IntPtr.Zero;
            int x = 0;
            int y = 0;
            int width = 0;
            int height = 0;
            WebDriverResult result = NativeMethods.wdeGetDetailsOnceScrolledOnToScreen(elementHandle, ref hwnd, ref x, ref y, ref width, ref height);
            ResultHandler.VerifyResultCode(result, "Unable to determine location once scrolled on to screen");

            NativeMethods.wdeMouseDownAt(hwnd, x, y);

            int endX = x + moveRightBy;
            int endY = y + moveDownBy;

            int duration = driver.Manage().Speed.Timeout;
            NativeMethods.wdeMouseMoveTo(hwnd, duration, x, y, endX, endY);
            NativeMethods.wdeMouseUpAt(hwnd, endX, endY);
        }

        public void DragAndDropOn(IRenderedWebElement toElement)
        {
            IntPtr hwnd = IntPtr.Zero;
            int x = 0;
            int y = 0;
            int width = 0;
            int height = 0;
            WebDriverResult result = NativeMethods.wdeGetDetailsOnceScrolledOnToScreen(elementHandle, ref hwnd, ref x, ref y, ref width, ref height);
            ResultHandler.VerifyResultCode(result, "Unable to determine location once scrolled on to screen");

            int startX = x + (width / 2);
            int startY = y + (height / 2);

            NativeMethods.wdeMouseDownAt(hwnd, startX, startY);

            SafeInternetExplorerWebElementHandle other = ((InternetExplorerWebElement)toElement).Wrapper;
            result = NativeMethods.wdeGetDetailsOnceScrolledOnToScreen(other, ref hwnd, ref x, ref y, ref width, ref height);
            ResultHandler.VerifyResultCode(result, "Unable to determine location of target once scrolled on to screen");

            int endX = x + (width / 2);
            int endY = y + (height / 2);

            int duration = driver.Manage().Speed.Timeout;
            NativeMethods.wdeMouseMoveTo(hwnd, duration, startX, startY, endX, endY);
            NativeMethods.wdeMouseUpAt(hwnd, endX, endY);
        }

        public override bool Equals(object obj)
        {
            IWebElement other = obj as IWebElement;

            if (other == null)
            {
                return false;
            }

            if (other is IWrapsElement)
            {
                other = ((IWrapsElement)obj).WrappedElement;
            }

            if (!(other is InternetExplorerWebElement))
            {
                return false;
            }

            bool result = (bool)driver.ExecuteScript("return arguments[0] === arguments[1];", this, other);
            return result;
        }

        public override int GetHashCode()
        {
            return elementHandle.GetHashCode();
        }

        #region IDisposable Members

        public void Dispose()
        {
            elementHandle.Dispose();
            GC.SuppressFinalize(this);
        }

        #endregion
    }
}
