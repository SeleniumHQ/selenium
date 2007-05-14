/*
 * Copyright 2007 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

using System;
using System.Collections;
using System.Runtime.InteropServices;
using System.Threading;
using System.Xml.XPath;
using IEWrapper;
using mshtml;
using SHDocVw;
using WebDriver.XPath;

namespace WebDriver
{
    internal class IeWrapper : WebDriver, IXPathNavigable, IDisposable
    {
        private InternetExplorer browser;
        private bool shouldWait = true;
        private int currentFrame = 0;
        private InternetExplorerDriver parent;

        public IeWrapper(InternetExplorerDriver parent) : this(parent, new InternetExplorer())
        {
        }

        public IeWrapper(InternetExplorerDriver parent, InternetExplorer toWrap)
        {
            this.parent = parent;
            browser = toWrap;
            browser.NewWindow2 +=
                delegate(ref object ppDisp, ref bool Cancel)
                    {
                        InternetExplorer newWindow = new InternetExplorer();
                        newWindow.Visible = browser.Visible;
                        ppDisp = newWindow;
                        parent.AddWrapper(new IeWrapper(parent, newWindow));
                    };
            Visible = false;
        }

        public string Title
        {
            get
            {
                if (shouldWait)
                    WaitForDocumentToComplete(HtmlDocument);
                return HtmlDocument.title;
            }
        }

        public bool Visible
        {
            get { return browser.Visible; }
            set { browser.Visible = value; }
        }

        public string CurrentUrl
        {
            get
            {
                if (shouldWait)
                    WaitForDocumentToComplete(HtmlDocument);
                return HtmlDocument.url;
            }
        }

        private void Navigate(string url)
        {
            object flags = null;
            object objectTargetFrameName = null;
            object postData = null;
            object headers = null;
            browser.Navigate(url, ref flags, ref objectTargetFrameName, ref postData, ref headers);
        }

        public void Get(string url)
        {
            Navigate(url);
            WaitForLoadToComplete();
            currentFrame = 0;
        }

        internal void WaitForLoadToComplete()
        {
            shouldWait = false;

            if (browser == null)
            {
                return;
            }

            while (browser.Busy)
            {
                Thread.Sleep(10);
            }

            while (browser.ReadyState != tagREADYSTATE.READYSTATE_COMPLETE)
            {
                Thread.Sleep(20);
            }

            WaitForDocumentToComplete(HtmlDocument);

            FramesCollection frames = ((IHTMLDocument2)browser.Document).frames;
            if (frames != null)
            {
                for (int i = 0; i < frames.length; i++)
                {
                    object refIndex = currentFrame;
                    IHTMLWindow2 frame = (IHTMLWindow2)frames.item(ref refIndex);
                    WaitForDocumentToComplete(frame.document);
                }
            }
        }

        private void WaitForDocumentToComplete(IHTMLDocument2 doc)
        {
            while (doc.readyState != "complete")
            {
                Thread.Sleep(20);
            }
        }

        public void DumpBody()
        {
            if (shouldWait)
                WaitForDocumentToComplete(HtmlDocument);

            // Console.WriteLine(GetDocumentText());
        }

        public void Close()
        {
            browser.Quit();
        }

        public string SelectTextWithXPath(string xpath)
        {
            if (shouldWait)
                WaitForDocumentToComplete(HtmlDocument);

            XPathNavigator navigator = CreateNavigator();
            XPathNodeIterator iterator = navigator.Select(xpath);
            if (iterator.Count == 0)
                return null;

            iterator.MoveNext();
            return iterator.Current.Value.Trim();
        }

        public ArrayList SelectElementsByXPath(string xpath)
        {
            if (shouldWait)
                WaitForDocumentToComplete(HtmlDocument);

            XPathNavigator navigator = CreateNavigator();
            XPathNodeIterator nodes = navigator.Select(xpath);
            IEnumerator allNodes = nodes.GetEnumerator();
            ArrayList elements = new ArrayList();
            while (allNodes.MoveNext())
            {
                NavigableDocument node = (NavigableDocument) allNodes.Current;
                elements.Add(new WrappedWebElement(this, node.UnderlyingObject as IHTMLDOMNode));
            }
            return elements;
        }

        public WebElement SelectElement(string selector)
        {
            if (shouldWait)
                WaitForDocumentToComplete(HtmlDocument);

            if (selector.StartsWith("link="))
            {
                return SelectLinkWithText(selector);
            } 
            else if (selector.StartsWith("id="))
            {
                return SelectElementById(selector);
            }
            else
            {
                XPathNavigator navigator = CreateNavigator();
                NavigableDocument node = navigator.SelectSingleNode(selector) as NavigableDocument;
                if (node == null)
                    throw new NoSuchElementException("Cannot find an element with the expression: " + selector);
                return new WrappedWebElement(this, node.UnderlyingObject as IHTMLDOMNode);
            }
        }

        public XPathNavigator CreateNavigator()
        {
            if (shouldWait)
                WaitForDocumentToComplete(HtmlDocument);

            return new NavigableDocument(HtmlDocument);
        }

        public void Dispose()
        {
            Marshal.ReleaseComObject(browser);
            browser = null;
        }

        private WebElement SelectLinkWithText(String selector)
        {
            int equalsIndex = selector.IndexOf('=') + 1;
            string linkText = selector.Substring(equalsIndex).Trim();

            IHTMLElementCollection links = HtmlDocument.links;
            IEnumerator enumerator = links.GetEnumerator();

            while (enumerator.MoveNext())
            {
                IHTMLElement element = (IHTMLElement) enumerator.Current;
                if (element.innerText == linkText)
                {
                    return new WrappedWebElement(this, (IHTMLDOMNode) element);
                }
            }
            throw new NoSuchElementException("Cannot find link with text: " + linkText);
        }

        private WebElement SelectElementById(String selector)
        {
            int equalsIndex = selector.IndexOf('=') + 1;
            string id = selector.Substring(equalsIndex).Trim();

            IHTMLElement element = ((IHTMLDocument3) HtmlDocument).getElementById(id);
            if (element != null)
            {
                return new WrappedWebElement(this, (IHTMLDOMNode) element);
            }
            throw new NoSuchElementException("Cannot find element with id: " + selector);
        }

        private IHTMLDocument2 HtmlDocument
        {
            get
            {
                try
                {
                    FramesCollection frames = ((IHTMLDocument2)browser.Document).frames;
                    if (frames.length == 0)
                        return browser.Document as IHTMLDocument2;

                    object refIndex = currentFrame;
                    IHTMLWindow2 frame = (IHTMLWindow2) frames.item(ref refIndex);
                    return frame.document;
                }
                catch (COMException)
                {
                    return null;
                }
            }
        }

        private WebDriver SwitchToFrame(int index)
        {
            FramesCollection frames = ((IHTMLDocument2)browser.Document).frames;

            if (!(index < frames.length))
            {
                throw new IndexOutOfRangeException("There are only " + frames.length +
                                                   " frames to use. You index was out of bounds: " + index);
            }

            currentFrame = index;

            return this;
        }

        public TargetLocator SwitchTo()
        {
            return new IeWrapperTargetLocator(this);
        }

        private class IeWrapperTargetLocator : TargetLocator
        {
            private IeWrapper parent;

            public IeWrapperTargetLocator(IeWrapper parent)
            {
                this.parent = parent;
            }

            public WebDriver Frame(int index)
            {
                parent.SwitchToFrame(index);
                return parent.parent;
            }

            public WebDriver Window(int index)
            {
                return parent.parent.SwitchToWindow(index);
            }
        }
    }
}