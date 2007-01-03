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
using IEWrapper;
using mshtml;

namespace WebDriver
{
    [Guid("F9072BAE-29BC-4505-8DB5-2A32BD00AC68")]
    [ClassInterface(ClassInterfaceType.None)]
    public class WrappedWebElement : WebElement
    {
        private readonly IeWrapper parent;
        private readonly IHTMLElement node;

        public WrappedWebElement(IeWrapper parent, IHTMLDOMNode node)
        {
            this.parent = parent;
            this.node = (IHTMLElement) node;
        }

        public string Text
        {
            get { return node.innerText; }
        }

        public string GetAttribute(string name)
        {
            object attribute = node.getAttribute(name, 0);
            
            if (attribute == null)
            {
                return "";
            }
            
            Nullable<Boolean> b = attribute as Nullable<Boolean>;
            if (b != null)
            {
                return b.ToString().ToLower();
            }

            // This is a nasty hack. 
            if ("System.__ComObject".Equals(attribute.GetType().FullName)) {
                return "";
            }
            
            return attribute.ToString();
        }

        public void SetAttribute(string name, object value)
        {
            node.setAttribute(name, value, 0);
        }

        public bool Toggle()
        {
            Click();
            return Selected;
        }

        public bool Selected {
            get {
                if (node is IHTMLOptionElement)
                    return ((IHTMLOptionElement) node).selected;
                if (IsCheckBox()) 
                    return NullSafeAttributeEquality("checked", "true");
                return false;
            }
        }

        public void SetSelected()
        {
            if (IsCheckBox()) 
            {
                if (!Selected)
                    Click();
                SetAttribute("checked", true);
            }
            else if (node is IHTMLOptionElement)
                ((IHTMLOptionElement)node).selected = true;
            else
                throw new UnsupportedOperationException("Unable to select element. Tag name is: " + node.tagName);
        }

        public bool Enabled
        {
            get {
                return !NullSafeAttributeEquality("disabled", "true");
            }
        }

        private bool IsCheckBox()
        {
            return
                node.tagName.ToLower().Equals("input") &&
                GetAttribute("type").Equals("checkbox");
        }

        public void Click() {
            object refObj = null;
            IHTMLDocument4 document = node.document as IHTMLDocument4;
            IHTMLElement3 element = (IHTMLElement3) node;

            IHTMLEventObj eventObject = document.CreateEventObject(ref refObj);
            object eventRef = eventObject;

            //    this.browserbot.triggerMouseEvent(element, 'mousedown', true);
            //  this.browserbot.triggerMouseEvent(element, 'mouseup', true);
            
            element.FireEvent("onMouseDown", ref eventRef);
            element.FireEvent("onMouseUp", ref eventRef);
            node.click();
            parent.WaitForLoadToComplete();
        }

        public void Submit()
        {
            if (node is IHTMLFormElement)
            {
                ((IHTMLFormElement) node).submit();
            }
            else if (node is IHTMLInputElement)
            {
                string type = GetAttribute("type");
                if (type != null && ("submit".Equals(type.ToLower()) || "image".Equals(type.ToLower())))
                {
                    Click();
                }
                else
                {
                    ((IHTMLInputElement)node).form.submit();
                }
            }
            else
            {
                IHTMLFormElement form = FindParentForm();
                if (form == null)
                    throw new NoSuchElementException("Unable to find the containing form");
                form.submit();
            }

            parent.WaitForLoadToComplete();
        }

        public string Value
        {
            get { return GetAttribute("value"); }
            set
            {
                if (isTextInputElement(node))
                {
                    Type(value);
                }
                else
                {
                    throw new UnsupportedOperationException("You may only set the value of elements that are input elements");
                }
            }
        }

        private bool isTextInputElement(IHTMLElement element)
        {
            return element is IHTMLInputElement || element is IHTMLTextAreaElement;
        }

        private void Type(string value)
        {
            object refObj = null;
            IHTMLDocument4 document = node.document as IHTMLDocument4;
            IHTMLElement3 element = (IHTMLElement3) node;

            string val = "";

            foreach (char c in value)
            {
                IHTMLEventObj eventObject = document.CreateEventObject(ref refObj);
                eventObject.keyCode = c;
                object eventRef = eventObject;
                val += c;
                element.FireEvent("onKeyDown", ref eventRef);
                element.FireEvent("onKeyPress", ref eventRef);
                node.setAttribute("value", val, 0);
                element.FireEvent("onKeyUp", ref eventRef);
            }
        }

        public ArrayList GetChildrenOfType(string tagName)
        {
            ArrayList children = new ArrayList();
            IEnumerator allChildren = ((IHTMLElement2) node).getElementsByTagName(tagName).GetEnumerator();
            while (allChildren.MoveNext())
            {
                IHTMLDOMNode child = (IHTMLDOMNode) allChildren.Current;
                children.Add(new WrappedWebElement(parent, child));
            }
            return children;
        }
        
        private bool NullSafeAttributeEquality(string attributeName, string valueWhenTrue) {
            string value = GetAttribute(attributeName);
            return value != null && valueWhenTrue.Equals(value.ToLower());
        }

        private IHTMLFormElement FindParentForm() {
            IHTMLElement current = node;
            while (!(current == null || current is IHTMLFormElement))
            {
                current = current.parentElement;
            }
            return (IHTMLFormElement) current;
        }
    }
}