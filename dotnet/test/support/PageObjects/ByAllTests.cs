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
using NMock;
using NUnit.Framework;
using Is = NUnit.Framework.Is;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    class ByAllTests
    {
        [Test]
        public void FindElementZeroBy()
        {
            var mock = new MockFactory();
            var driver = mock.CreateMock<IAllDriver>();

            var by = new ByAll();

            Assert.Throws<NoSuchElementException>(() => by.FindElement(driver.MockObject));
            Assert.That(by.FindElements(driver.MockObject), Is.EqualTo(new List<IWebElement>().AsReadOnly()));
        }

        [Test]
        public void FindElementOneBy()
        {
            var mock = new MockFactory();
            var driver = mock.CreateMock<IAllDriver>();
            var elem1 = mock.CreateMock<IAllElement>();
            var elem2 = mock.CreateMock<IAllElement>();
            var elems12 = new List<IWebElement> { elem1.MockObject, elem2.MockObject }.AsReadOnly();
            driver.Expects.AtLeastOne.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems12);
            var by = new ByAll(By.Name("cheese"));

            // findElement
            Assert.AreEqual(by.FindElement(driver.MockObject), elem1.MockObject);
            //findElements
            Assert.That(by.FindElements(driver.MockObject), Is.EqualTo(elems12));

            mock.VerifyAllExpectationsHaveBeenMet();
        }
        
        [Test]
        public void FindElementOneByEmpty()
        {
            var mock = new MockFactory();
            var driver = mock.CreateMock<IAllDriver>();
            var empty = new List<IWebElement>().AsReadOnly();

            driver.Expects.AtLeastOne.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(empty);

            var by = new ByAll(By.Name("cheese"));

            // one element
            Assert.Throws<NoSuchElementException>(() => by.FindElement(driver.MockObject));
            Assert.That(by.FindElements(driver.MockObject), Is.EqualTo(empty));

            mock.VerifyAllExpectationsHaveBeenMet();
        }
        
        [Test]
        public void FindElementTwoBy()
        {
            var mocks = new MockFactory();
            var driver = mocks.CreateMock<IAllDriver>();

            var elem1 = mocks.CreateMock<IAllElement>();
            var elem2 = mocks.CreateMock<IAllElement>();
            var elem3 = mocks.CreateMock<IAllElement>();
            var elems12 = new List<IWebElement> { elem1.MockObject, elem2.MockObject }.AsReadOnly();
            var elems23 = new List<IWebElement> { elem2.MockObject, elem3.MockObject }.AsReadOnly();

            driver.Expects.AtLeastOne.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems12);
            driver.Expects.AtLeastOne.Method(_ => _.FindElementsByName(null)).With("photo").WillReturn(elems23);

            var by = new ByAll(By.Name("cheese"), By.Name("photo"));

            // findElement
            Assert.That(by.FindElement(driver.MockObject), Is.EqualTo(elem2.MockObject));

            //findElements
            var result = by.FindElements(driver.MockObject);
            Assert.That(result.Count, Is.EqualTo(1));
            Assert.That(result[0], Is.EqualTo(elem2.MockObject));

            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void FindElementDisjunct()
        {
            var mocks = new MockFactory();
            var driver = mocks.CreateMock<IAllDriver>();

            var elem1 = mocks.CreateMock<IAllElement>();
            var elem2 = mocks.CreateMock<IAllElement>();
            var elem3 = mocks.CreateMock<IAllElement>();
            var elem4 = mocks.CreateMock<IAllElement>();
            var elems12 = new List<IWebElement> { elem1.MockObject, elem2.MockObject }.AsReadOnly();
            var elems34 = new List<IWebElement> { elem3.MockObject, elem4.MockObject }.AsReadOnly();

            driver.Expects.AtLeastOne.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems12);
            driver.Expects.AtLeastOne.Method(_ => _.FindElementsByName(null)).With("photo").WillReturn(elems34);

            var by = new ByAll(By.Name("cheese"), By.Name("photo"));
            
            Assert.Throws<NoSuchElementException>(() => by.FindElement(driver.MockObject));

            var result = by.FindElements(driver.MockObject);
            Assert.That(result.Count, Is.EqualTo(0));
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

    }
}
