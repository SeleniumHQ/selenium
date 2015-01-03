using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects.Interfaces
{
    /// <summary>
    ///Allows the PageFactory to decorate fields.
    /// </summary>
    public interface IFieldDecorator
    {
        /// <summary>
        /// This method is called by PageFactory on all fields to decide how to decorate the field.
        /// </summary>
        /// <param name="member"> It is a a field OR property that is supposed to be decorated</param>
        /// <returns>An object that should be set up to</returns>
        Object Decorate(MemberInfo member);
    }
}
