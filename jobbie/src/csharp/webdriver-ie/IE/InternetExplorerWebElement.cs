using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Drawing;
using OpenQa.Selenium.Internal;

namespace OpenQa.Selenium.IE
{
    class InternetExplorerWebElement : IRenderedWebElement, ISearchContext, ILocatable
    {
        private ElementWrapper wrapper;
        private InternetExplorerDriver driver;

        public InternetExplorerWebElement(InternetExplorerDriver driver, ElementWrapper wrapper)
        {
            this.driver = driver;
            this.wrapper = wrapper;
        }

        internal ElementWrapper Wrapper
        {
            get { return wrapper; }
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdeGetText(ElementWrapper wrapper, ref StringWrapperHandle result);
        public string Text
        {
            get 
            {
                StringWrapperHandle result = new StringWrapperHandle();
                int returnValue = wdeGetText(wrapper, ref result);
                ErrorHandler.VerifyErrorCode(returnValue, "get the Text property");
                return result.Value;
            }
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdeGetTagName(ElementWrapper wrapper, ref StringWrapperHandle result);
        public string TagName
        {
            get
            {
                StringWrapperHandle result = new StringWrapperHandle();
                int returnValue = wdeGetTagName(wrapper, ref result);
                ErrorHandler.VerifyErrorCode(returnValue, "get the Value property");
                return result.Value;
            }
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdeIsEnabled(ElementWrapper handle, ref int enabled);
        public bool Enabled
        {
            get 
            {
                int enabled = 0;
                int result = wdeIsEnabled(wrapper, ref enabled);
                ErrorHandler.VerifyErrorCode(result, "get the Enabled property");
                return (enabled == 1);
            }
        }
	
        [DllImport("InternetExplorerDriver")]
        private static extern int wdeClear(ElementWrapper handle);
        public void Clear()
        {
            int result = wdeClear(wrapper);
            ErrorHandler.VerifyErrorCode(result, "clear the element");
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdeSendKeys(ElementWrapper wrapper, [MarshalAs(UnmanagedType.LPWStr)] string text);
        public void SendKeys(string text)
        {
            int result = wdeSendKeys(wrapper, text);            
            ErrorHandler.VerifyErrorCode(result, "send keystrokes to the element");
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdeSubmit(ElementWrapper wrapper);
        public void Submit()
        {
            int result = wdeSubmit(wrapper);
            ErrorHandler.VerifyErrorCode(result, "submit the element");
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdeClick(ElementWrapper wrapper);
        public void Click()
        {
            int result = wdeClick(wrapper);
            ErrorHandler.VerifyErrorCode(result, "click the element");
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdeGetAttribute(ElementWrapper wrapper, [MarshalAs(UnmanagedType.LPWStr)] string attributeName, ref StringWrapperHandle result);
        public string GetAttribute(string attributeName)
        {
            StringWrapperHandle result = new StringWrapperHandle();
            int returnValue = wdeGetAttribute(wrapper, attributeName, ref result);
            ErrorHandler.VerifyErrorCode(returnValue, string.Format("getting attribute '{0}' of the element", attributeName));
            return result.Value;
        }

        public string Value
        {
            get { return GetAttribute("value"); }
        }


        [DllImport("InternetExplorerDriver")]
        private static extern int wdeIsSelected(ElementWrapper handle, ref int selected);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdeSetSelected(ElementWrapper handle);
        public bool Selected
        {
            get
            {
                int selected = 0;
                int result = wdeIsSelected(wrapper, ref selected);
                ErrorHandler.VerifyErrorCode(result, "Checking if element is selected");
                return (selected == 1);
            }
            set
            {
                int result = wdeSetSelected(wrapper);
                ErrorHandler.VerifyErrorCode(result, "(Un)selecting element");
            }
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdeToggle(ElementWrapper handle, ref int toggled);
        public bool Toggle()
        {
            int toggled = 0;
            int result = wdeToggle(wrapper, ref toggled);
            ErrorHandler.VerifyErrorCode(result, "Toggling element");
            return (toggled == 1);
        }

        public List<IWebElement> FindElements(By by)
        {
            return by.FindElements(new Finder(driver, wrapper));
        }

        public IWebElement FindElement(By by)
        {
            return by.FindElement(new Finder(driver, wrapper));
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdAddElementScriptArg(IntPtr scriptArgs, ElementWrapper handle);
        public int AddToScriptArgs(IntPtr scriptArgs)
        {
            int result = wdAddElementScriptArg(scriptArgs, wrapper);
            ErrorHandler.VerifyErrorCode(result, "adding to script arguments");
            return result;
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdeGetDetailsOnceScrolledOnToScreen(ElementWrapper element, ref IntPtr hwnd, ref int x, ref int y, ref int width, ref int height);
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

                int result = wdeGetDetailsOnceScrolledOnToScreen(wrapper, ref hwnd, ref x, ref y, ref width, ref height);
                ErrorHandler.VerifyErrorCode(result, "get the location once scrolled onto the screen");
                location = new Point(x, y);
                return location;
            }
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdeGetLocation(ElementWrapper element, ref int x, ref int y);
        public Point Location
        {
            get
            {
                Point elementLocation = Point.Empty;
                int x = 0;
                int y = 0;
                int result = wdeGetLocation(wrapper, ref x, ref y);
                ErrorHandler.VerifyErrorCode(result, "get the location");
                elementLocation = new Point(x, y);
                return elementLocation;
            }
        }


        [DllImport("InternetExplorerDriver")]
        private static extern int wdeGetSize(ElementWrapper element, ref int width, ref int height);
        public Size Size
        {
            get
            {
                Size elementSize = Size.Empty;
                int width = 0;
                int height = 0;
                int result = wdeGetSize(wrapper, ref width, ref height);

                ErrorHandler.VerifyErrorCode(result, "get the size");
                elementSize = new Size(width, height);
                return elementSize;
            }
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdeIsDisplayed(ElementWrapper handle, ref int displayed);
        public bool Displayed
        {
            get
            {
                int displayed = 0;
                int result = wdeIsDisplayed(wrapper, ref displayed);
                ErrorHandler.VerifyErrorCode(result, "get the Displayed property");
                return (displayed == 1);
            }
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdeGetValueOfCssProperty(ElementWrapper handle, [MarshalAs(UnmanagedType.LPWStr)] string attributeName, ref StringWrapperHandle result);
        public string GetValueOfCssProperty(string propertyName)
        {
            StringWrapperHandle result = new StringWrapperHandle();
            int returnValue = wdeGetValueOfCssProperty(wrapper, propertyName, ref result);
            ErrorHandler.VerifyErrorCode(returnValue, string.Format("get the value of CSS property '{0}'", propertyName));
            return result.Value;
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdeMouseMoveTo(IntPtr hwnd, int duration, int fromX, int fromY, int toX, int toY);
        public void Hover()
        {
            IntPtr hwnd = IntPtr.Zero;
            int x = 0;
            int y = 0;
            int width = 0;
            int height = 0;
            int result = wdeGetDetailsOnceScrolledOnToScreen(wrapper, ref hwnd, ref x, ref y, ref width, ref height);

            ErrorHandler.VerifyErrorCode(result, "hover");

            int midX = x + (width / 2);
            int midY = y + (height / 2);

            result = wdeMouseMoveTo(hwnd, 100, 0, 0, midX, midY);

            ErrorHandler.VerifyErrorCode(result, "hover mouse move");
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdeMouseDownAt(IntPtr hwnd, int windowX, int windowY);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdeMouseUpAt(IntPtr hwnd, int windowX, int windowY);
        public void DragAndDropBy(int moveRightBy, int moveDownBy)
        {
            IntPtr hwnd = IntPtr.Zero;
            int x = 0;
            int y = 0;
            int width = 0;
            int height = 0;
            int result = wdeGetDetailsOnceScrolledOnToScreen(wrapper, ref hwnd, ref x, ref y, ref width, ref height);
            ErrorHandler.VerifyErrorCode(result, "Unable to determine location once scrolled on to screen");

            wdeMouseDownAt(hwnd, x, y);

            int endX = x + moveRightBy;
            int endY = y + moveDownBy;

            int duration = driver.Manage().Speed.Timeout;
            wdeMouseMoveTo(hwnd, duration, x, y, endX, endY);
            wdeMouseUpAt(hwnd, endX, endY);
        }

        public void DragAndDropOn(IRenderedWebElement toElement)
        {
            IntPtr hwnd = IntPtr.Zero;
            int x = 0;
            int y = 0;
            int width = 0;
            int height = 0;
            int result = wdeGetDetailsOnceScrolledOnToScreen(wrapper, ref hwnd, ref x, ref y, ref width, ref height);
            ErrorHandler.VerifyErrorCode(result, "Unable to determine location once scrolled on to screen");

            int startX = x + (width / 2);
            int startY = y + (height / 2);

            wdeMouseDownAt(hwnd, startX, startY);

            ElementWrapper other = ((InternetExplorerWebElement)toElement).Wrapper;
            result = wdeGetDetailsOnceScrolledOnToScreen(other, ref hwnd, ref x, ref y, ref width, ref height);
            ErrorHandler.VerifyErrorCode(result, "Unable to determine location of target once scrolled on to screen");

            int endX = x + (width / 2);
            int endY = y + (height / 2);

            int duration = driver.Manage().Speed.Timeout;
            wdeMouseMoveTo(hwnd, duration, startX, startY, endX, endY);
            wdeMouseUpAt(hwnd, endX, endY);
        }

        public override bool Equals(object obj)
        {
            if (!(obj is IWebElement))
            {
                return false;
            }

            IWebElement other = obj as IWebElement;

            if (other == null && other is IWrapsElement)
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
            return wrapper.GetHashCode();
        }
    }
}
