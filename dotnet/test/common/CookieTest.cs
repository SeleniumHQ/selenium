using System;
using NUnit.Framework;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class CookieTest
    {
        [Test]
        public void CanCreateAWellFormedCookie()
        {
            new ReturnedCookie("Fish", "cod", "", "", DateTime.Now, false, false);
        }

        [Test]
        public void ShouldThrowAnExceptionWhenSemiColonExistsInTheCookieAttribute()
        {
            Assert.That(() => new ReturnedCookie("hi;hi", "value", null, null, DateTime.Now, false, false), Throws.InstanceOf<ArgumentException>());
        }

        [Test]
        public void ShouldThrowAnExceptionWhenTheNameIsNull()
        {
            Assert.That(() => new ReturnedCookie(null, "value", null, null, DateTime.Now, false, false), Throws.InstanceOf<ArgumentException>());
        }

        [Test]
        public void CookiesShouldAllowSecureToBeSet()
        {
            Cookie cookie = new ReturnedCookie("name", "value", "", "/", DateTime.Now, true, false);
            Assert.That(cookie.Secure, Is.True);
        }

        [Test]
        public void SecureDefaultsToFalse()
        {
            Cookie cookie = new Cookie("name", "value");
            Assert.That(cookie.Secure, Is.False);
        }

        [Test]
        public void CookiesShouldAllowHttpOnlyToBeSet()
        {
            Cookie cookie = new ReturnedCookie("name", "value", "", "/", DateTime.Now, false, true);
            Assert.That(cookie.IsHttpOnly, Is.True);
        }

        [Test]
        public void HttpOnlyDefaultsToFalse()
        {
            Cookie cookie = new Cookie("name", "value");
            Assert.That(cookie.IsHttpOnly, Is.False);
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        public void ShouldThrowAnExceptionWhenTheValueIsNull()
        {
            Assert.That(() => new ReturnedCookie("name", null, null, null, DateTime.Now, false, false), Throws.InstanceOf<ArgumentNullException>());
        }

        [Test]
        public void ShouldAllowExpiryToBeNull()
        {
            Cookie cookie = new ReturnedCookie("name", "value", "", "/", null, false, false);
        }
    }
}
