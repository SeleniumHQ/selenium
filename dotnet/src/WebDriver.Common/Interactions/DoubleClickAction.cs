using System;
using System.Collections.Generic;

using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    public class DoubleClickAction : MouseAction, IAction
    {
        public DoubleClickAction(IMouse mouse, ILocatable actionTarget)
            : base(mouse, actionTarget)
        {
        }

        #region IAction Members

        public void Perform()
        {
            this.MoveToLocation();
            this.Mouse.DoubleClick(this.ActionLocation);
        }

        #endregion
    }
}
