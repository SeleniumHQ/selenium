using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Provides comparison of proxied web elements.
    /// </summary>
    public class WebElementProxyComparer
    {
        /// <summary>
        /// Gets a value indicating whether two elements are equal.
        /// </summary>
        /// <param name="obj">An object representing a second element.</param>
        /// <returns><see langword="true"/> if the objects are equal; otherwise, <see langword="false"/>.</returns>
        public override bool Equals(object obj)
        {
            var wrapper = this as IWrapsElement;
            if (wrapper == null)
            {
                return base.Equals(obj);
            }

            return wrapper.WrappedElement.Equals(obj);
        }

        /// <summary>
        /// Gets a unique hash code for this object.
        /// </summary>
        /// <returns>A unique hash code for this object.</returns>
        public override int GetHashCode()
        {
            var wrapper = this as IWrapsElement;
            if (wrapper == null)
            {
                return base.GetHashCode();
            }

            return wrapper.WrappedElement.GetHashCode();
        }
    }
}
