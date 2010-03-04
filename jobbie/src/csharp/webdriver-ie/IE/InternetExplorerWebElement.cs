using System;
using System.Collections.ObjectModel;
using System.Drawing;
using System.Globalization;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// InternetExplorerWebElement allows you to have access to specific items that are found on the page.
    /// </summary>
    /// <seealso cref="IRenderedWebElement"/>
    /// <seealso cref="ILocatable"/>
    /// <example>
    /// <code>
    /// [Test]
    /// public void TestGoogle()
    /// {
    ///     driver = new InternetExplorerDriver();
    ///     InternetExplorerWebElement elem = driver.FindElement(By.Name("q"));
    ///     elem.SendKeys("Cheese please!");
    /// }
    /// </code>
    /// </example>
    public sealed class InternetExplorerWebElement : IRenderedWebElement, ILocatable, IDisposable, IWrapsDriver
    {
        private SafeInternetExplorerWebElementHandle elementHandle;
        private InternetExplorerDriver driver;

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the InternetExplorerWebElement class.
        /// </summary>
        /// <param name="driver">Drive in use.</param>
        /// <param name="wrapper">Wrapper of the handle to get.</param>
        internal InternetExplorerWebElement(InternetExplorerDriver driver, SafeInternetExplorerWebElementHandle wrapper)
        {
            this.driver = driver;
            this.elementHandle = wrapper;
        }
        #endregion

        #region Properties
        #region Public Properties
        /// <summary>
        /// Gets the text from the element.
        /// </summary>
        public string Text
        {
            get
            {
                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
                WebDriverResult result = NativeDriverLibrary.Instance.GetElementText(elementHandle, ref stringHandle);
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

        /// <summary>
        /// Gets the DOM Tag of element.
        /// </summary>
        public string TagName
        {
            get
            {
                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
                WebDriverResult result = NativeDriverLibrary.Instance.GetElementTagName(elementHandle, ref stringHandle);
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

        /// <summary>
        /// Gets a value indicating whether an element is currently enabled.
        /// </summary>
        public bool Enabled
        {
            get
            {
                int enabled = 0;
                WebDriverResult result = NativeDriverLibrary.Instance.IsElementEnabled(elementHandle, ref enabled);
                ResultHandler.VerifyResultCode(result, "get the Enabled property");
                return enabled == 1;
            }
        }

        /// <summary>
        /// Gets the value of the element's "value" attribute. If this value has been modified after the page has loaded (for example, through javascript) then this will reflect the current value of the "value" attribute.
        /// </summary>
        public string Value
        {
            get { return GetAttribute("value"); }
        }

        /// <summary>
        /// Gets a value indicating whether this element is selected or not. This operation only applies to input elements such as checkboxes, options in a select and radio buttons.
        /// </summary>
        public bool Selected
        {
            get
            {
                int selected = 0;
                WebDriverResult result = NativeDriverLibrary.Instance.IsElementSelected(elementHandle, ref selected);
                ResultHandler.VerifyResultCode(result, "Checking if element is selected");
                return selected == 1;
            }
        }

        /// <summary>
        /// Gets the Location of an element that is off the screen by scrolling and returns a Point object.
        /// </summary>
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

                WebDriverResult result = NativeDriverLibrary.Instance.GetElementDetailsOnceScrolledOnToScreen(elementHandle, ref hwnd, ref x, ref y, ref width, ref height);
                ResultHandler.VerifyResultCode(result, "get the location once scrolled onto the screen");
                location = new Point(x, y);
                return location;
            }
        }

        /// <summary>
        /// Gets the Location of an element  and returns a Point object.
        /// </summary>
        public Point Location
        {
            get
            {
                Point elementLocation = Point.Empty;
                int x = 0;
                int y = 0;
                WebDriverResult result = NativeDriverLibrary.Instance.GetElementLocation(elementHandle, ref x, ref y);
                ResultHandler.VerifyResultCode(result, "get the location");
                elementLocation = new Point(x, y);
                return elementLocation;
            }
        }

        /// <summary>
        /// Gets the <see cref="Size"/> of the element on the page.
        /// </summary>
        public Size Size
        {
            get
            {
                Size elementSize = Size.Empty;
                int width = 0;
                int height = 0;
                WebDriverResult result = NativeDriverLibrary.Instance.GetElementSize(elementHandle, ref width, ref height);

                ResultHandler.VerifyResultCode(result, "get the size");
                elementSize = new Size(width, height);
                return elementSize;
            }
        }

        /// <summary>
        /// Gets a value indicating whether the object is currently being displayed.
        /// </summary>
        public bool Displayed
        {
            get
            {
                int displayed = 0;
                WebDriverResult result = NativeDriverLibrary.Instance.IsElementDisplayed(elementHandle, ref displayed);
                ResultHandler.VerifyResultCode(result, "get the Displayed property");
                return displayed == 1;
            }
        }

        /// <summary>
        /// Gets the <see cref="IWebDriver"/> used to find this element.
        /// </summary>
        public IWebDriver WrappedDriver
        {
            get { return driver; }
        }
        #endregion

        #region Internal properties
        /// <summary>
        /// Gets the wrappers handle.
        /// </summary>
        internal SafeInternetExplorerWebElementHandle Wrapper
        {
            get { return elementHandle; }
        }
        #endregion
        #endregion

        #region Methods
        #region Public Methods
        /// <summary>
        /// Method to clear the text out of an Input element.
        /// </summary>
        public void Clear()
        {
            WebDriverResult result = NativeDriverLibrary.Instance.ClearElement(elementHandle);
            ResultHandler.VerifyResultCode(result, "clear the element");
        }

        /// <summary>
        /// Method for sending native key strokes to the browser.
        /// </summary>
        /// <param name="text">String containing what you would like to type onto the screen.</param>
        public void SendKeys(string text)
        {
            WebDriverResult result = NativeDriverLibrary.Instance.SendKeysToElement(elementHandle, text);            
            ResultHandler.VerifyResultCode(result, "send keystrokes to the element");
        }

        /// <summary>
        /// If this current element is a form, or an element within a form, then this will be submitted to the remote server. 
        /// If this causes the current page to change, then this method will block until the new page is loaded.
        /// </summary>
        public void Submit()
        {
            WebDriverResult result = NativeDriverLibrary.Instance.SubmitElement(elementHandle);
            ResultHandler.VerifyResultCode(result, "submit the element");
        }

        /// <summary>
        /// Click this element. If this causes a new page to load, this method will block until the page has loaded. At this point, you should discard all references to this element and any further operations performed on this element 
        /// will have undefined behaviour unless you know that the element and the page will still be present. If this element is not clickable, then this operation is a no-op since it's pretty common for someone to accidentally miss 
        /// the target when clicking in Real Life.
        /// </summary>
        public void Click()
        {
            WebDriverResult result = NativeDriverLibrary.Instance.ClickElement(elementHandle);
            ResultHandler.VerifyResultCode(result, "click the element");
        }

        /// <summary>
        /// If this current element is a form, or an element within a form, then this will be submitted to the remote server. If this causes the current page to change, then this method will block until the new page is loaded.
        /// </summary>
        /// <param name="attributeName">Attribute you wish to get details of.</param>
        /// <returns>The attribute's current value or null if the value is not set.</returns>
        public string GetAttribute(string attributeName)
        {
            SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
            SafeInternetExplorerDriverHandle driverHandle = driver.GetUnderlayingHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.GetElementAttribute(driverHandle, elementHandle, attributeName, ref stringHandle);
            ResultHandler.VerifyResultCode(result, string.Format(CultureInfo.InvariantCulture, "getting attribute '{0}' of the element", attributeName));
            string returnValue = null;
            using (StringWrapper wrapper = new StringWrapper(stringHandle))
            {
                returnValue = wrapper.Value;
            }

            return returnValue;
        }

        /// <summary>
        /// Method to select or unselect element. This operation only applies to input elements such as checkboxes, options in a select and radio buttons.
        /// </summary>
        public void Select()
        {
            WebDriverResult result = NativeDriverLibrary.Instance.SetElementSelected(elementHandle);
            ResultHandler.VerifyResultCode(result, "(Un)selecting element");
        }

        /// <summary>
        /// If the element is a checkbox this will toggle the elements state from selected to not selected, or from not selected to selected.
        /// </summary>
        /// <returns>Whether the toggled element is selected (true) or not (false) after this toggle is complete.</returns>
        public bool Toggle()
        {
            int toggled = 0;
            WebDriverResult result = NativeDriverLibrary.Instance.ToggleElement(elementHandle, ref toggled);
            ResultHandler.VerifyResultCode(result, "Toggling element");
            return toggled == 1;
        }

        /// <summary>
        /// Finds the elements on the page by using the <see cref="By"/> object and returns a ReadOnlyCollection of the Elements on the page.
        /// </summary>
        /// <param name="by">By mechanism for finding the object.</param>
        /// <returns>ReadOnlyCollection of IWebElement.</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> classList = driver.FindElements(By.ClassName("class"));
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(new Finder(driver, elementHandle));
        }

        /// <summary>
        /// Finds the first element in the page that matches the <see cref="By"/> object.
        /// </summary>
        /// <param name="by">By mechanism.</param>
        /// <returns>IWebElement object so that you can interction that object.</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// IWebElement elem = driver.FindElement(By.Name("q"));
        /// </code>
        /// </example>
        public IWebElement FindElement(By by)
        {
            return by.FindElement(new Finder(driver, elementHandle));
        }

        /// <summary>
        /// Method to return the value of a CSS Property
        /// </summary>
        /// <param name="propertyName">CSS property key</param>
        /// <returns>string value of the CSS property</returns>
        public string GetValueOfCssProperty(string propertyName)
        {
            SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.GetElementValueOfCssProperty(elementHandle, propertyName, ref stringHandle);
            ResultHandler.VerifyResultCode(result, string.Format(CultureInfo.InvariantCulture, "get the value of CSS property '{0}'", propertyName));
            string returnValue = string.Empty;
            using (StringWrapper wrapper = new StringWrapper(stringHandle))
            {
                returnValue = wrapper.Value;
            }

            return returnValue;
        }

        /// <summary>
        /// Moves the mouse over the element to do a hover.
        /// </summary>
        public void Hover()
        {
            IntPtr hwnd = IntPtr.Zero;
            int x = 0;
            int y = 0;
            int width = 0;
            int height = 0;
            WebDriverResult result = NativeDriverLibrary.Instance.GetElementDetailsOnceScrolledOnToScreen(elementHandle, ref hwnd, ref x, ref y, ref width, ref height);

            ResultHandler.VerifyResultCode(result, "hover");

            int midX = x + (width / 2);
            int midY = y + (height / 2);

            result = NativeDriverLibrary.Instance.MouseMoveTo(hwnd, 100, 0, 0, midX, midY);

            ResultHandler.VerifyResultCode(result, "hover mouse move");
        }

        /// <summary>
        /// Move to an element, MouseDown on the element and move it by passing in the how many pixels horizontally and vertically you wish to move it.
        /// </summary>
        /// <param name="moveRightBy">Integer to move it left or right.</param>
        /// <param name="moveDownBy">Integer to move it up or down.</param>
        public void DragAndDropBy(int moveRightBy, int moveDownBy)
        {
            IntPtr hwnd = IntPtr.Zero;
            int x = 0;
            int y = 0;
            int width = 0;
            int height = 0;
            WebDriverResult result = NativeDriverLibrary.Instance.GetElementDetailsOnceScrolledOnToScreen(elementHandle, ref hwnd, ref x, ref y, ref width, ref height);
            ResultHandler.VerifyResultCode(result, "Unable to determine location once scrolled on to screen");

            NativeDriverLibrary.Instance.MouseDownAt(hwnd, x, y);

            int endX = x + moveRightBy;
            int endY = y + moveDownBy;

            int duration = driver.Manage().Speed.Timeout;
            NativeDriverLibrary.Instance.MouseMoveTo(hwnd, duration, x, y, endX, endY);
            NativeDriverLibrary.Instance.MouseUpAt(hwnd, endX, endY);
        }

        /// <summary>
        /// Drag and Drop an element to another element.
        /// </summary>
        /// <param name="element">Element you wish to drop on.</param>
        public void DragAndDropOn(IRenderedWebElement element)
        {
            IntPtr hwnd = IntPtr.Zero;
            int x = 0;
            int y = 0;
            int width = 0;
            int height = 0;
            WebDriverResult result = NativeDriverLibrary.Instance.GetElementDetailsOnceScrolledOnToScreen(elementHandle, ref hwnd, ref x, ref y, ref width, ref height);
            ResultHandler.VerifyResultCode(result, "Unable to determine location once scrolled on to screen");

            int startX = x + (width / 2);
            int startY = y + (height / 2);

            NativeDriverLibrary.Instance.MouseDownAt(hwnd, startX, startY);

            SafeInternetExplorerWebElementHandle other = ((InternetExplorerWebElement)element).Wrapper;
            result = NativeDriverLibrary.Instance.GetElementDetailsOnceScrolledOnToScreen(other, ref hwnd, ref x, ref y, ref width, ref height);
            ResultHandler.VerifyResultCode(result, "Unable to determine location of target once scrolled on to screen");

            int endX = x + (width / 2);
            int endY = y + (height / 2);

            int duration = driver.Manage().Speed.Timeout;
            NativeDriverLibrary.Instance.MouseMoveTo(hwnd, duration, startX, startY, endX, endY);
            NativeDriverLibrary.Instance.MouseUpAt(hwnd, endX, endY);
        }

        /// <summary>
        /// Compares if two elements are equal.
        /// </summary>
        /// <param name="obj">Object to compare against.</param>
        /// <returns>A boolean if it is equal or not.</returns>
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

        /// <summary>
        /// Method to get the hash code of the element.
        /// </summary>
        /// <returns>Interger of the hash code for the element.</returns>
        public override int GetHashCode()
        {
            return elementHandle.GetHashCode();
        }

        #region IDisposable Members

        /// <summary>
        /// Dispose the Element.
        /// </summary>
        public void Dispose()
        {
            elementHandle.Dispose();
            GC.SuppressFinalize(this);
        }

        #endregion
        #endregion

        #region Internal methods
        /// <summary>
        /// Add to the script args.
        /// </summary>
        /// <param name="scriptArgs">Arguments to be added.</param>
        /// <returns>A Driver result from adding it.</returns>
        internal WebDriverResult AddToScriptArgs(SafeScriptArgsHandle scriptArgs)
        {
            WebDriverResult result = NativeDriverLibrary.Instance.AddElementScriptArg(scriptArgs, elementHandle);
            ResultHandler.VerifyResultCode(result, "adding to script arguments");
            return result;
        }
        #endregion
        #endregion
    }
}
