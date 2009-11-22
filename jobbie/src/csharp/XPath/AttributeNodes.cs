/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
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

using System.Collections;
using System.Collections.Generic;
using System.Xml.XPath;
using mshtml;

namespace WebDriver.XPath
{
    internal class AttributeNodes : IEnumerator<IHTMLDOMAttribute>
    {
        private int index;
        private IEnumerator attributeEnumerator;
        private IHTMLDOMNode node;

        public AttributeNodes(IHTMLDOMNode node)
        {
            this.node = node;
            if (node != null)
            {
                InitialiseAttributeEnumerator();
            }
        }

        private void InitialiseAttributeEnumerator()
        {
            IHTMLAttributeCollection collection = (IHTMLAttributeCollection) node.attributes;
            if (collection != null)
                attributeEnumerator = collection.GetEnumerator();
        }

        public AttributeNodes(AttributeNodes other)
        {
            node = other.node;
            if (node != null)
            {
                InitialiseAttributeEnumerator();
                index = other.index;
                ResetToCurrentLocation();
            }
        }

        public IHTMLDOMAttribute Current
        {
            get { return attributeEnumerator.Current as IHTMLDOMAttribute; }
        }

        object IEnumerator.Current
        {
            get { return attributeEnumerator.Current; }
        }

        public XPathNodeType NodeType
        {
            get { return XPathNodeType.Attribute; }
        }

        public string NodeValue
        {
            get { return (string) Current.nodeValue; }
        }

        public string NodeName
        {
            get { return Current.nodeName; }
        }

        public bool MoveNext()
        {
            if (attributeEnumerator == null)
            {
                return false;
            }


            bool result = attributeEnumerator.MoveNext();
            if (result)
            {
                index++;
                if (!Current.specified)
                    return MoveNext();
            }
            return result;
        }

        public void Reset()
        {
            attributeEnumerator.Reset();
        }

        public void ResetToCurrentLocation()
        {
            if (attributeEnumerator == null)
                return;

            for (int i = 0; i < index; i++)
                attributeEnumerator.MoveNext();
        }

        public void Dispose()
        {
            // No-op
        }

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            AttributeNodes attributeNodes = obj as AttributeNodes;
            if (attributeNodes == null) return false;
            return index == attributeNodes.index && Equals(node, attributeNodes.node);
        }

        public override int GetHashCode()
        {
            return index + 29*node.GetHashCode();
        }
    }
}