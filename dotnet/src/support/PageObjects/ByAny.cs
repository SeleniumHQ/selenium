/*
Copyright 2015 Software Freedom Conservancy
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

using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>Mechanism used to locate elements within a document using a series of  lookups. This class will
    /// find all DOM elements that matches any of the locators in sequence, e.g.</summary>
    ///  <example><code>driver.findElements(new ByAny(by1, by2))</code>
    ///  will find all elements that match by1 and then all elements that match by2.
    ///  This means that the list of elements returned may not be in document order.</example>>
    public class ByAny : By
    {
        private readonly By[] _bys;

        public ByAny(params By[] bys)
        {
            _bys = bys;
        }

        public override IWebElement FindElement(ISearchContext context)
        {
            foreach (var @by in _bys)
            {
                var elems = @by.FindElements(context);
                if (elems.Any())
                {
                    return elems[0];
                }
            }
            throw new NoSuchElementException("Cannot locate an element using " + ToString());
        }

        public override ReadOnlyCollection<IWebElement> FindElements(ISearchContext context)
        {
            var elems = new List<IWebElement>();
            foreach (var @by in _bys)
            {
                elems.AddRange(@by.FindElements(context));
            }

            return elems.Distinct().ToList().AsReadOnly();
        }

        public override string ToString()
        {
            var stringBuilder = new StringBuilder("By.all(");
            stringBuilder.Append("{");

            var first = true;
            foreach (var by in _bys)
            {
                stringBuilder.Append((first ? "" : ",")).Append(by);
                first = false;
            }
            stringBuilder.Append("})");
            return stringBuilder.ToString();
        }

    }
}
