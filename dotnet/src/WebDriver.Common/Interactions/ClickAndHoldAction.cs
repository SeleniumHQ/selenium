using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    internal class ClickAndHoldAction : MouseAction, IAction
    {
        public ClickAndHoldAction(IMouse mouse, ILocatable actionTarget)
            : base(mouse, actionTarget)
        {
        }

        #region IAction Members

        public void Perform()
        {
            this.MoveToLocation();
            this.Mouse.MouseDown(this.ActionLocation);
        }

        #endregion
    }
}
