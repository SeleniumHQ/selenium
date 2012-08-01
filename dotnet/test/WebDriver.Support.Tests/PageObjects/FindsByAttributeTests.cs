using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    public class FindsByAttributeTests
    {
        [Test]
        public void TestEquality()
        {
            FindsByAttribute first = new FindsByAttribute() { How = How.Id, Using = "Test" };
            FindsByAttribute second = new FindsByAttribute() { How = How.Id, Using = "Test" };
            Assert.IsTrue(first.Equals(second));
            Assert.IsFalse(object.ReferenceEquals(first, second));
            Assert.IsTrue(first == second);
            Assert.IsFalse(first != second);
        }

        [Test]
        public void TestSameInstanceEquality()
        {
            FindsByAttribute first = new FindsByAttribute() { How = How.Id, Using = "Test" };
            FindsByAttribute second = first;
            Assert.IsTrue(first == second);
            Assert.IsTrue(second == first);
            Assert.IsTrue(first.Equals(second));
            Assert.IsTrue(second.Equals(first));
            Assert.IsTrue(object.ReferenceEquals(first, second));
        }

        [Test]
        public void TestInequalityOfUsing()
        {
            FindsByAttribute first = new FindsByAttribute() { How = How.Id, Using = "Hello" };
            FindsByAttribute second = new FindsByAttribute() { How = How.Id, Using = "World" };
            Assert.IsFalse(first.Equals(second));
            Assert.IsFalse(first == second);
            Assert.IsTrue(first != second);
        }

        [Test]
        public void TestInequalityOfHow()
        {
            FindsByAttribute first = new FindsByAttribute() { How = How.Name, Using = "Test" };
            FindsByAttribute second = new FindsByAttribute() { How = How.Id, Using = "Test" };
            Assert.IsFalse(first.Equals(second));
            Assert.IsFalse(first == second);
            Assert.IsTrue(first != second);
        }

        [Test]
        public void TestInequalityOfPriority()
        {
            FindsByAttribute first = new FindsByAttribute() { How = How.Id, Using = "Test", Priority = 1 };
            FindsByAttribute second = new FindsByAttribute() { How = How.Id, Using = "Test", Priority = 2 };
            Assert.IsFalse(first.Equals(second));
            Assert.IsFalse(first == second);
            Assert.IsTrue(first != second);
        }

        [Test]
        public void TestInequalityOfNull()
        {
            FindsByAttribute first = new FindsByAttribute() { How = How.Id, Using = "Test" };
            FindsByAttribute second = null;
            Assert.IsFalse(first.Equals(second));

            // Must test order of arguments for overridden operators
            Assert.IsFalse(first == second);
            Assert.IsTrue(first != second);
            Assert.IsFalse(second == first);
            Assert.IsTrue(second != first);
        }

        [Test]
        public void TestEqualityOfTwoNullInstances()
        {
            FindsByAttribute first = null;
            FindsByAttribute second = null;

            // Must test order of arguments for overridden operators
            Assert.IsTrue(first == second);
            Assert.IsFalse(first != second);
            Assert.IsTrue(second == first);
            Assert.IsFalse(second != first);
        }

        [Test]
        public void TestComparison()
        {
            FindsByAttribute first = new FindsByAttribute() { How = How.Id, Using = "Test", Priority = 1 };
            FindsByAttribute second = new FindsByAttribute() { How = How.Id, Using = "Test", Priority = 2 };
            Assert.Less(first, second);
            Assert.Greater(second, first);
        }
    }
}
