/* Copyright notice and license
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Drawing;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.Events
{
    /// <summary>
    /// A wrapper around an arbitrary WebDriver instance which supports registering for 
    /// events, e.g. for logging purposes.
    /// </summary>
    public class EventFiringWebDriver : IWebDriver, IJavaScriptExecutor, ITakesScreenshot, IWrapsDriver
    {
        private IWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the EventFiringWebDriver class.
        /// </summary>
        /// <param name="parentDriver">The driver to register events for.</param>
        public EventFiringWebDriver(IWebDriver parentDriver)
        {
            driver = parentDriver;
        }

        /// <summary>
        /// Fires before the driver begins navigation.
        /// </summary>
        public event EventHandler<WebDriverNavigationEventArgs> Navigating;

        /// <summary>
        /// Fires after the driver completes navigation
        /// </summary>
        public event EventHandler<WebDriverNavigationEventArgs> Navigated;

        /// <summary>
        /// Fires before the driver begins navigation back one entry in the browser history list.
        /// </summary>
        public event EventHandler<WebDriverNavigationEventArgs> NavigatingBack;

        /// <summary>
        /// Fires after the driver completes navigation back one entry in the browser history list.
        /// </summary>
        public event EventHandler<WebDriverNavigationEventArgs> NavigatedBack;

        /// <summary>
        /// Fires before the driver begins navigation forward one entry in the browser history list.
        /// </summary>
        public event EventHandler<WebDriverNavigationEventArgs> NavigatingForward;

        /// <summary>
        /// Fires after the driver completes navigation forward one entry in the browser history list.
        /// </summary>
        public event EventHandler<WebDriverNavigationEventArgs> NavigatedForward;

        /// <summary>
        /// Fires before the driver clicks on an element.
        /// </summary>
        public event EventHandler<WebElementEventArgs> ElementClicking;

        /// <summary>
        /// Fires after the driver has clicked on an element.
        /// </summary>
        public event EventHandler<WebElementEventArgs> ElementClicked;

        /// <summary>
        /// Fires before the driver changes the value of an element via Clear(), SendKeys() or Toggle().
        /// </summary>
        public event EventHandler<WebElementEventArgs> ElementValueChanging;

        /// <summary>
        /// Fires after the driver has changed the value of an element via Clear(), SendKeys() or Toggle().
        /// </summary>
        public event EventHandler<WebElementEventArgs> ElementValueChanged;

        /// <summary>
        /// Fires before the driver starts to find an element.
        /// </summary>
        public event EventHandler<FindElementEventArgs> FindingElement;

        /// <summary>
        /// Fires after the driver completes finding an element.
        /// </summary>
        public event EventHandler<FindElementEventArgs> FindElementCompleted;

        /// <summary>
        /// Fires before a script is executed.
        /// </summary>
        public event EventHandler<WebDriverScriptEventArgs> ScriptExecuting;

        /// <summary>
        /// Fires after a script is executed.
        /// </summary>
        public event EventHandler<WebDriverScriptEventArgs> ScriptExecuted;
        
        /// <summary>
        /// Fires when an exception is thrown.
        /// </summary>
        public event EventHandler<WebDriverExceptionEventArgs> ExceptionThrown;

        #region IWrapsDriver Members
        /// <summary>
        /// Gets the <see cref="IWebDriver"/> wrapped by this EventsFiringWebDriver instance.
        /// </summary>
        public IWebDriver WrappedDriver
        {
            get { return driver; }
        }

        #endregion

        #region IWebDriver Members
        /// <summary>
        /// Gets or sets the URL the browser is currently displaying.
        /// </summary>
        /// <remarks>
        /// Setting the <see cref="Url"/> property will load a new web page in the current browser window. 
        /// This is done using an HTTP GET operation, and the method will block until the 
        /// load is complete. This will follow redirects issued either by the server or 
        /// as a meta-redirect from within the returned HTML. Should a meta-redirect "rest"
        /// for any duration of time, it is best to wait until this timeout is over, since 
        /// should the underlying page change while your test is executing the results of 
        /// future calls against this interface will be against the freshly loaded page. 
        /// </remarks>
        /// <seealso cref="INavigation.GoToUrl(System.String)"/>
        /// <seealso cref="INavigation.GoToUrl(System.Uri)"/>
        public string Url
        {
            get
            {
                return driver.Url;
            }
            set
            {
                WebDriverNavigationEventArgs e = new WebDriverNavigationEventArgs(driver, value);
                OnNavigating(e);
                driver.Url = value;
                OnNavigated(e);
            }
        }

        /// <summary>
        /// Gets the title of the current browser window.
        /// </summary>
        public string Title
        {
            get { return driver.Title; }
        }

        /// <summary>
        /// Gets the source of the page last loaded by the browser.
        /// </summary>
        /// <remarks>
        /// If the page has been modified after loading (for example, by JavaScript) 
        /// there is no guarentee that the returned text is that of the modified page. 
        /// Please consult the documentation of the particular driver being used to 
        /// determine whether the returned text reflects the current state of the page 
        /// or the text last sent by the web server. The page source returned is a 
        /// representation of the underlying DOM: do not expect it to be formatted 
        /// or escaped in the same way as the response sent from the web server. 
        /// </remarks>
        public string PageSource
        {
            get { return driver.PageSource; }
        }

        /// <summary>
        /// Close the current window, quitting the browser if it is the last window currently open.
        /// </summary>
        public void Close()
        {
            driver.Close();
        }

        /// <summary>
        /// Quits this driver, closing every associated window.
        /// </summary>
        public void Quit()
        {
            driver.Quit();
        }

        /// <summary>
        /// Instructs the driver to change its settings.
        /// </summary>
        /// <returns>An <see cref="IOptions"/> object allowing the user to change
        /// the settings of the driver.</returns>
        public IOptions Manage()
        {
            return new EventFiringOptions(this);
        }

        /// <summary>
        /// Instructs the driver to navigate the browser to another location.
        /// </summary>
        /// <returns>An <see cref="INavigation"/> object allowing the user to access 
        /// the browser's history and to navigate to a given URL.</returns>
        public INavigation Navigate()
        {
            return new EventFiringNavigation(this);
        }

        /// <summary>
        /// Instructs the driver to send future commands to a different frame or window.
        /// </summary>
        /// <returns>An <see cref="ITargetLocator"/> object which can be used to select
        /// a frame or window.</returns>
        public ITargetLocator SwitchTo()
        {
            return new EventFiringTargetLocator(this);
        }

        /// <summary>
        /// Get the window handles of open browser windows.
        /// </summary>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all window handles
        /// of windows belonging to this driver instance.</returns>
        /// <remarks>The set of window handles returned by this method can be used to 
        /// iterate over all open windows of this <see cref="IWebDriver"/> instance by 
        /// passing them to <c>SwitchTo().Window(string)</c></remarks>
        public ReadOnlyCollection<string> GetWindowHandles()
        {
            return driver.GetWindowHandles();
        }

        /// <summary>
        /// Get the current window handle.
        /// </summary>
        /// <returns>An opaque handle to this window that uniquely identifies it 
        /// within this driver instance.</returns>
        public string GetWindowHandle()
        {
            return driver.GetWindowHandle();
        }

        #endregion

        #region ISearchContext Members
        /// <summary>
        /// Find the first <see cref="IWebElement"/> using the given method. 
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>The first matching <see cref="IWebElement"/> on the current context.</returns>
        /// <exception cref="NoSuchElementException">If no element matches the criteria.</exception>
        public IWebElement FindElement(By by)
        {
            FindElementEventArgs e = new FindElementEventArgs(driver, by);
            OnFindingElement(e);
            IWebElement element = driver.FindElement(by);
            OnFindElementCompleted(e);
            EventFiringWebElement wrappedElement = WrapElement(element);
            return wrappedElement;
        }

        /// <summary>
        /// Find all <see cref="IWebElement">IWebElements</see> within the current context 
        /// using the given mechanism.
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> of all <see cref="IWebElement">WebElements</see>
        /// matching the current criteria, or an empty list if nothing matches.</returns>
        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            List<IWebElement> wrappedElementList = new List<IWebElement>();
            FindElementEventArgs e = new FindElementEventArgs(driver, by);
            OnFindingElement(e);
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(by);
            OnFindElementCompleted(e);
            foreach (IWebElement element in elements)
            {
                EventFiringWebElement wrappedElement = WrapElement(element);
                wrappedElementList.Add(wrappedElement);
            }

            return wrappedElementList.AsReadOnly();
        }
        #endregion

        #region IDisposable Members
        /// <summary>
        /// Frees all managed and unmanaged resources used by this instance.
        /// </summary>
        public void Dispose()
        {
            driver.Dispose();
        }
        #endregion

        #region IJavaScriptExecutor Members
        /// <summary>
        /// Gets a value indicating whether JavaScript is enabled for this browser.
        /// </summary>
        public bool IsJavaScriptEnabled
        {
            get
            {
                bool javascriptEnabled = false;
                IJavaScriptExecutor javascriptDriver = driver as IJavaScriptExecutor;
                if (javascriptDriver != null)
                {
                    javascriptEnabled = javascriptDriver.IsJavaScriptEnabled;
                }

                return javascriptEnabled;
            }
        }

        /// <summary>
        /// Executes JavaScript in the context of the currently selected frame or window.
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        /// <remarks>
        /// <para>
        /// The <see cref="ExecuteScript"/>method executes JavaScript in the context of 
        /// the currently selected frame or window. This means that "document" will refer 
        /// to the current document. If the script has a return value, then the following 
        /// steps will be taken:
        /// </para>
        /// <para>
        /// <list type="bullet">
        /// <item><description>For an HTML element, this method returns a <see cref="IWebElement"/></description></item>
        /// <item><description>For a number, a <see cref="System.Int64"/> is returned</description></item>
        /// <item><description>For a boolean, a <see cref="System.Boolean"/> is returned</description></item>
        /// <item><description>For all other cases a <see cref="System.String"/> is returned.</description></item>
        /// <item><description>For an array,we check the first element, and attempt to return a 
        /// <see cref="List{T}"/> of that type, following the rules above. Nested lists are not
        /// supported.</description></item>
        /// <item><description>If the value is null or there is no return value,
        /// <see langword="null"/> is returned.</description></item>
        /// </list>
        /// </para>
        /// <para>
        /// Arguments must be a number (which will be converted to a <see cref="System.Int64"/>),
        /// a <see cref="System.Boolean"/>, a <see cref="System.String"/> or a <see cref="IWebElement"/>.
        /// An exception will be thrown if the arguments do not meet these criteria. 
        /// The arguments will be made available to the JavaScript via the "arguments" magic 
        /// variable, as if the function were called via "Function.apply" 
        /// </para>
        /// </remarks>
        public object ExecuteScript(string script, params object[] args)
        {
            IJavaScriptExecutor javascriptDriver = driver as IJavaScriptExecutor;
            if (javascriptDriver == null)
            {
                throw new NotSupportedException("Underlying driver instance does not support executing javascript");
            }

            object[] unwrappedArgs = UnwrapElementArguments(args);
            WebDriverScriptEventArgs e = new WebDriverScriptEventArgs(driver, script);
            OnScriptExecuting(e);
            object scriptResult = javascriptDriver.ExecuteScript(script, unwrappedArgs);
            OnScriptExecuted(e);
            return scriptResult;
        }

        /// <summary>
        /// Executes JavaScript asynchronously in the context of the currently selected frame or window.
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        public object ExecuteAsyncScript(string script, params object[] args)
        {
            IJavaScriptExecutor javascriptDriver = driver as IJavaScriptExecutor;
            if (javascriptDriver == null)
            {
                throw new NotSupportedException("Underlying driver instance does not support executing javascript");
            }

            object[] unwrappedArgs = UnwrapElementArguments(args);
            WebDriverScriptEventArgs e = new WebDriverScriptEventArgs(driver, script);
            OnScriptExecuting(e);
            object scriptResult = javascriptDriver.ExecuteAsyncScript(script, unwrappedArgs);
            OnScriptExecuted(e);
            return scriptResult;
        }
        #endregion

        #region ITakesScreenshot Members
        /// <summary>
        /// Gets a <see cref="Screenshot"/> object representing the image of the page on the screen.
        /// </summary>
        /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
        public Screenshot GetScreenshot()
        {
            ITakesScreenshot screenshotDriver = driver as ITakesScreenshot;
            if (driver == null)
            {
                throw new NotSupportedException("Underlying driver instance does not support taking screenshots");
            }

            Screenshot screen = null;
            screen = screenshotDriver.GetScreenshot();
            return screen;
        }
        #endregion

        /// <summary>
        /// Raises the <see cref="Navigating"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebDriverNavigationEventArgs"/> that contains the event data.</param>
        protected virtual void OnNavigating(WebDriverNavigationEventArgs e)
        {
            if (Navigating != null)
            {
                Navigating(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="Navigated"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebDriverNavigationEventArgs"/> that contains the event data.</param>
        protected virtual void OnNavigated(WebDriverNavigationEventArgs e)
        {
            if (Navigated != null)
            {
                Navigated(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="NavigatingBack"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebDriverNavigationEventArgs"/> that contains the event data.</param>
        protected virtual void OnNavigatingBack(WebDriverNavigationEventArgs e)
        {
            if (NavigatingBack != null)
            {
                NavigatingBack(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="NavigatedBack"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebDriverNavigationEventArgs"/> that contains the event data.</param>
        protected virtual void OnNavigatedBack(WebDriverNavigationEventArgs e)
        {
            if (NavigatedBack != null)
            {
                NavigatedBack(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="NavigatingForward"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebDriverNavigationEventArgs"/> that contains the event data.</param>
        protected virtual void OnNavigatingForward(WebDriverNavigationEventArgs e)
        {
            if (NavigatingForward != null)
            {
                NavigatingForward(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="NavigatedForward"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebDriverNavigationEventArgs"/> that contains the event data.</param>
        protected virtual void OnNavigatedForward(WebDriverNavigationEventArgs e)
        {
            if (NavigatedForward != null)
            {
                NavigatedForward(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="ElementClicking"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebElementEventArgs"/> that contains the event data.</param>
        protected virtual void OnElementClicking(WebElementEventArgs e)
        {
            if (ElementClicking != null)
            {
                ElementClicking(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="ElementClicked"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebElementEventArgs"/> that contains the event data.</param>
        protected virtual void OnElementClicked(WebElementEventArgs e)
        {
            if (ElementClicked != null)
            {
                ElementClicked(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="ElementValueChanging"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebElementEventArgs"/> that contains the event data.</param>
        protected virtual void OnElementValueChanging(WebElementEventArgs e)
        {
            if (ElementValueChanging!= null)
            {
                ElementValueChanging(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="ElementValueChanged"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebElementEventArgs"/> that contains the event data.</param>
        protected virtual void OnElementValueChanged(WebElementEventArgs e)
        {
            if (ElementValueChanged != null)
            {
                ElementValueChanged(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="FindingElement"/> event.
        /// </summary>
        /// <param name="e">A <see cref="FindElementEventArgs"/> that contains the event data.</param>
        protected virtual void OnFindingElement(FindElementEventArgs e)
        {
            if (FindingElement != null)
            {
                FindingElement(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="FindElementCompleted"/> event.
        /// </summary>
        /// <param name="e">A <see cref="FindElementEventArgs"/> that contains the event data.</param>
        protected virtual void OnFindElementCompleted(FindElementEventArgs e)
        {
            if (FindElementCompleted != null)
            {
                FindElementCompleted(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="ScriptExecuting"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebDriverScriptEventArgs"/> that contains the event data.</param>
        protected virtual void OnScriptExecuting(WebDriverScriptEventArgs e)
        {
            if (ScriptExecuting != null)
            {
                ScriptExecuting(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="ScriptExecuted"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebDriverScriptEventArgs"/> that contains the event data.</param>
        protected virtual void OnScriptExecuted(WebDriverScriptEventArgs e)
        {
            if (ScriptExecuted != null)
            {
                ScriptExecuted(this, e);
            }
        }

        /// <summary>
        /// Raises the <see cref="ExceptionThrown"/> event.
        /// </summary>
        /// <param name="e">A <see cref="WebDriverExceptionEventArgs"/> that contains the event data.</param>
        protected virtual void OnException(WebDriverExceptionEventArgs e)
        {
            if (ExceptionThrown != null)
            {
                ExceptionThrown(this, e);
            }
        }

        private object[] UnwrapElementArguments(object[] args)
        {
            // Walk the args: the various drivers expect unwrapped versions of the elements
            List<object> unwrappedArgs = new List<object>();
            foreach (object arg in args)
            {
                EventFiringWebElement eventElementArg = arg as EventFiringWebElement;
                if (eventElementArg != null)
                {
                    unwrappedArgs.Add(eventElementArg.WrappedElement);
                }
                else
                {
                    unwrappedArgs.Add(arg);
                }
            }

            return unwrappedArgs.ToArray();
        }

        private EventFiringWebElement WrapElement(IWebElement underlyingElement)
        {
            return new EventFiringWebElement(this, underlyingElement);
        }

        private class EventFiringNavigation : INavigation
        {
            private EventFiringWebDriver parentDriver;
            private INavigation wrappedNavigation;

            public EventFiringNavigation(EventFiringWebDriver driver)
            {
                parentDriver = driver;
                wrappedNavigation = parentDriver.WrappedDriver.Navigate();
            }

            #region INavigation Members

            public void Back()
            {
                WebDriverNavigationEventArgs e = new WebDriverNavigationEventArgs(parentDriver);
                parentDriver.OnNavigatingBack(e);
                wrappedNavigation.Back();
                parentDriver.OnNavigatedBack(e);
            }

            public void Forward()
            {
                WebDriverNavigationEventArgs e = new WebDriverNavigationEventArgs(parentDriver);
                parentDriver.OnNavigatingForward(e);
                wrappedNavigation.Forward();
                parentDriver.OnNavigatedForward(e);
            }

            public void GoToUrl(string url)
            {
                WebDriverNavigationEventArgs e = new WebDriverNavigationEventArgs(parentDriver, url);
                parentDriver.OnNavigating(e);
                wrappedNavigation.GoToUrl(url);
                parentDriver.OnNavigated(e);
            }

            public void GoToUrl(Uri url)
            {
                WebDriverNavigationEventArgs e = new WebDriverNavigationEventArgs(parentDriver, url.ToString());
                parentDriver.OnNavigating(e);
                wrappedNavigation.GoToUrl(url);
                parentDriver.OnNavigated(e);
            }

            public void Refresh()
            {
                wrappedNavigation.Refresh();
            }

            #endregion
        }

        private class EventFiringOptions : IOptions
        {
            private EventFiringWebDriver parentDriver;
            private IOptions wrappedOptions;

            public EventFiringOptions(EventFiringWebDriver driver)
            {
                parentDriver = driver;
                wrappedOptions = driver.Manage();
            }

            #region IOptions Members

            public Speed Speed
            {
                get
                {
                    return wrappedOptions.Speed;
                }
                set
                {
                    wrappedOptions.Speed = value;
                }
            }

            public void AddCookie(Cookie cookie)
            {
                wrappedOptions.AddCookie(cookie);
            }

            public ReadOnlyCollection<Cookie> GetCookies()
            {
                return wrappedOptions.GetCookies();
            }

            public Cookie GetCookieNamed(string name)
            {
                return wrappedOptions.GetCookieNamed(name);
            }

            public void DeleteCookie(Cookie cookie)
            {
                wrappedOptions.DeleteCookie(cookie);
            }

            public void DeleteCookieNamed(string name)
            {
                wrappedOptions.DeleteCookieNamed(name);
            }

            public void DeleteAllCookies()
            {
                wrappedOptions.DeleteAllCookies();
            }

            public ITimeouts Timeouts()
            {
                return new EventFiringTimeouts(wrappedOptions);
            }

            #endregion
        }

        private class EventFiringTargetLocator : ITargetLocator
        {
            private EventFiringWebDriver parentDriver;
            private ITargetLocator wrappedLocator;

            public EventFiringTargetLocator(EventFiringWebDriver driver)
            {
                parentDriver = driver;
                wrappedLocator = driver.SwitchTo();
            }

            #region ITargetLocator Members

            public IWebDriver Frame(int frameIndex)
            {
                return wrappedLocator.Frame(frameIndex);
            }

            public IWebDriver Frame(string frameName)
            {
                return wrappedLocator.Frame(frameName);
            }

            public IWebDriver Frame(IWebElement frameElement)
            {
                return wrappedLocator.Frame(frameElement);
            }

            public IWebDriver Window(string windowName)
            {
                return wrappedLocator.Window(windowName);
            }

            public IWebDriver DefaultContent()
            {
                return wrappedLocator.DefaultContent();
            }

            public IWebElement ActiveElement()
            {
                return wrappedLocator.ActiveElement();
            }

            public IAlert Alert()
            {
                return wrappedLocator.Alert();
            }

            #endregion
        }

        private class EventFiringTimeouts : ITimeouts
        {
            ITimeouts wrappedTimeouts;

            public EventFiringTimeouts(IOptions options)
            {
                wrappedTimeouts = options.Timeouts();
            }

            #region ITimeouts Members

            public ITimeouts ImplicitlyWait(TimeSpan timeToWait)
            {
                return wrappedTimeouts.ImplicitlyWait(timeToWait);
            }

            public ITimeouts SetScriptTimeout(TimeSpan timeToWait)
            {
                return wrappedTimeouts.SetScriptTimeout(timeToWait);
            }

            #endregion
        }


        private class EventFiringWebElement : IWebElement, IWrapsElement
        {
            private IWebElement underlyingElement;
            private EventFiringWebDriver parentDriver;

            public EventFiringWebElement(EventFiringWebDriver driver, IWebElement element)
            {
                underlyingElement = element;
                parentDriver = driver;
            }

            #region IWrapsElement Members

            public IWebElement WrappedElement
            {
                get { return underlyingElement; }
            }

            #endregion

            #region IWebElement Members

            public string TagName
            {
                get { return underlyingElement.TagName; }
            }

            public string Text
            {
                get { return underlyingElement.Text; }
            }

            public string Value
            {
                get { return underlyingElement.Value; }
            }

            public bool Enabled
            {
                get { return underlyingElement.Enabled; }
            }

            public bool Selected
            {
                get { return underlyingElement.Selected; }
            }

            public void Clear()
            {
                WebElementEventArgs e = new WebElementEventArgs(parentDriver.WrappedDriver, underlyingElement);
                parentDriver.OnElementValueChanging(e);
                underlyingElement.Clear();
                parentDriver.OnElementValueChanged(e);
            }

            public void SendKeys(string text)
            {
                WebElementEventArgs e = new WebElementEventArgs(parentDriver.WrappedDriver, underlyingElement);
                parentDriver.OnElementValueChanging(e);
                underlyingElement.SendKeys(text);
                parentDriver.OnElementValueChanged(e);
            }

            public void Submit()
            {
                underlyingElement.Submit();
            }

            public void Click()
            {
                WebElementEventArgs e = new WebElementEventArgs(parentDriver.WrappedDriver, underlyingElement);
                parentDriver.OnElementClicking(e);
                underlyingElement.Click();
                parentDriver.OnElementClicked(e);
            }

            public void Select()
            {
                underlyingElement.Select();
            }

            public string GetAttribute(string attributeName)
            {
                return underlyingElement.GetAttribute(attributeName);
            }

            public bool Toggle()
            {
                WebElementEventArgs e = new WebElementEventArgs(parentDriver.WrappedDriver, underlyingElement);
                parentDriver.OnElementValueChanging(e);
                bool toggleValue = underlyingElement.Toggle();
                parentDriver.OnElementValueChanged(e);
                return toggleValue;
            }

            #endregion

            #region ISearchContext Members

            public IWebElement FindElement(By by)
            {
                FindElementEventArgs e = new FindElementEventArgs(parentDriver.WrappedDriver, underlyingElement, by);
                parentDriver.OnFindingElement(e);
                IWebElement element = underlyingElement.FindElement(by);
                parentDriver.OnFindElementCompleted(e);
                EventFiringWebElement wrappedElement = parentDriver.WrapElement(element);
                return wrappedElement;
            }

            public ReadOnlyCollection<IWebElement> FindElements(By by)
            {
                List<IWebElement> wrappedElementList = new List<IWebElement>();
                FindElementEventArgs e = new FindElementEventArgs(parentDriver.WrappedDriver, underlyingElement, by);
                parentDriver.OnFindingElement(e);
                ReadOnlyCollection<IWebElement> elements = underlyingElement.FindElements(by);
                parentDriver.OnFindElementCompleted(e);
                foreach (IWebElement element in elements)
                {
                    EventFiringWebElement wrappedElement = parentDriver.WrapElement(element);
                    wrappedElementList.Add(wrappedElement);
                }

                return wrappedElementList.AsReadOnly();
            }

            #endregion
        }

        private class EventFiringRenderedWebElement : EventFiringWebElement, IRenderedWebElement
        {
            public EventFiringRenderedWebElement(EventFiringWebDriver driver, IWebElement element)
                : base(driver, element)
            {
            }

            #region IRenderedWebElement Members

            public Point Location
            {
                get
                {
                    IRenderedWebElement renderedElement = WrappedElement as IRenderedWebElement;
                    return renderedElement.Location;
                }
            }

            public Size Size
            {
                get
                {
                    IRenderedWebElement renderedElement = WrappedElement as IRenderedWebElement;
                    return renderedElement.Size;
                }
            }

            public bool Displayed
            {
                get
                {
                    IRenderedWebElement renderedElement = WrappedElement as IRenderedWebElement;
                    return renderedElement.Displayed;
                }
            }

            public string GetValueOfCssProperty(string propertyName)
            {
                IRenderedWebElement renderedElement = WrappedElement as IRenderedWebElement;
                return renderedElement.GetValueOfCssProperty(propertyName);
            }

            public void Hover()
            {
                IRenderedWebElement renderedElement = WrappedElement as IRenderedWebElement;
                renderedElement.Hover();
            }

            public void DragAndDropBy(int moveRightBy, int moveDownBy)
            {
                IRenderedWebElement renderedElement = WrappedElement as IRenderedWebElement;
                renderedElement.DragAndDropBy(moveRightBy, moveDownBy);
            }

            public void DragAndDropOn(IRenderedWebElement element)
            {
                IRenderedWebElement renderedElement = WrappedElement as IRenderedWebElement;
                renderedElement.DragAndDropOn(element);
            }

            #endregion
        }
    }
}
