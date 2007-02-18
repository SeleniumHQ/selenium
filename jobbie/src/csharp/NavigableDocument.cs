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
using System.Xml;
using System.Xml.XPath;
using mshtml;

namespace WebDriver
{
    internal class NavigableDocument : XPathNavigator
    {
        private IHTMLDocument2 document;
        private IHTMLDOMNode currentNode;
        private IEnumerator attributes;
        private int attributeIndex;

        public NavigableDocument(IHTMLDocument2 document)
        {
            currentNode = (IHTMLDOMNode) ((IHTMLDocument3)document).documentElement;
            this.document = document;
        }
        
        private NavigableDocument()
        {
        }
        
        public override XPathNavigator Clone()
        {
            NavigableDocument other = new NavigableDocument();
            other.document = document;
            other.MoveTo(this);
            return other;
        }

        public override bool MoveToFirstAttribute()
        {
            IHTMLAttributeCollection collection = (IHTMLAttributeCollection)CurrentNode.attributes;
            if (collection == null)
            {
                return false;
            }
            
            attributes = collection.GetEnumerator();
            if (!attributes.MoveNext())
            {
                attributes = null;
                return false;
            }
            attributeIndex = 1;
            return true;
        }

        public override bool MoveToNextAttribute()
        {
            if (!attributes.MoveNext())
            {
                ResetAttributesToCurrentIndex();
                return false;
            }
            attributeIndex++;
            if (!((IHTMLDOMAttribute)attributes.Current).specified)
                return MoveToNextAttribute();

            return true;
        }

        private void ResetAttributesToCurrentIndex()
        {
            attributes.Reset();
            for (int i = 0; i < attributeIndex; i++)
            {
                attributes.MoveNext();
            }
        }

        public override bool MoveToFirstNamespace(XPathNamespaceScope namespaceScope)
        {
            throw new NotImplementedException();
        }

        public override bool MoveToNextNamespace(XPathNamespaceScope namespaceScope)
        {
            throw new NotImplementedException();
        }

        public override bool MoveToNext()
        {
            IHTMLDOMNode sibling = CurrentNode.nextSibling;
            if (sibling == null)
            {
                return false;
            }
            currentNode = sibling;
            attributes = null;
            attributeIndex = 0;
            return true;
        }

        public override bool MoveToPrevious()
        {
            throw new NotImplementedException();
        }

        public override bool MoveToFirstChild()
        {
            IHTMLDOMNode child = currentNode.firstChild;
            if (child == null)
            {
                return false;
            }
            currentNode = child;
            return true;
        }

        public override bool MoveToParent()
        {
            if (attributes != null)
            {
                attributes = null;
                attributeIndex = 0;
            }
            IHTMLDOMNode parentNode = currentNode.parentNode;
            if (parentNode == null)
                return false;
            currentNode = parentNode;
            attributes = null;
            
            return true;
        }

        public override bool MoveTo(XPathNavigator other)
        {
            NavigableDocument o = other as NavigableDocument;
            if (o == null)
                return false;

            currentNode = o.currentNode;
            if (o.attributes != null)
            {
                MoveToFirstAttribute();
                attributeIndex = o.attributeIndex;
                ResetAttributesToCurrentIndex();
            }
            return true;
        }

        public override bool MoveToId(string id)
        {
            throw new NotImplementedException();
        }

        public override bool IsSamePosition(XPathNavigator other)
        {
            NavigableDocument o = other as NavigableDocument;
            if (o == null)
                return false;
            
            if (!document.Equals(o.document) || !currentNode.Equals(o.currentNode))
                return false;
            
            if (o.attributes == null && attributes == null)
                return true;

            return o.attributeIndex == attributeIndex;
        }

        public override XmlNameTable NameTable
        {
            get { throw new NotImplementedException(); }
        }

        public override XPathNodeType NodeType
        {
            get
            {
                if (attributes != null)
                    return XPathNodeType.Attribute;
                
                switch (currentNode.nodeType)
                {
                    case 1:
                        return XPathNodeType.Element;

                    case 3:
                        return XPathNodeType.Text;

                    case 8:
                        return XPathNodeType.Comment;
                        
                    case 9:
                        return XPathNodeType.Root;
                        
                    case 11: // Claims to be a document fragment
                        return XPathNodeType.Text;

                    default:
                        Console.WriteLine("Unknown type: " + currentNode.nodeName + " (" + currentNode.nodeType + ") " + currentNode.nodeValue);
                        break;
                }
                throw new ArgumentException("Cannot identify node type");
            }
        }

        public override string LocalName
        {
            get
            {
                if (attributes != null)
                {
                    string name = ((IHTMLDOMAttribute)attributes.Current).nodeName;
                    return name;
                }
                return currentNode.nodeName.ToLower();
            }
        }

        public override string Name
        {
            get { throw new NotImplementedException(); }
        }

        public override string NamespaceURI
        {
            get { return string.Empty; }
        }

        public override string Prefix
        {
            get { throw new NotImplementedException(); }
        }

        public override string BaseURI
        {
            get
            {
                return document.url;
            }
        }

        public override bool IsEmptyElement
        {
            get { throw new NotImplementedException(); }
        }

        public override string Value
        {
            get
            {
                if (attributes != null)
                {
                    string value = (string) ((IHTMLDOMAttribute)attributes.Current).nodeValue;
                    return value;
                }
                
                if (currentNode is IHTMLTitleElement)
                    return document.title;
                IHTMLElement element = currentNode as IHTMLElement;
                if (element != null)
                {
                    return element.innerText;
                }
                return currentNode.nodeValue.ToString();
            }
        }

        public IHTMLDOMNode CurrentNode
        {
            get { return currentNode; }
        }
    }
}