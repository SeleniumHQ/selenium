using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    public class ButtonReleaseAction : MouseAction, IAction
    {
        public ButtonReleaseAction(IMouse mouse, ILocatable actionTarget)
            : base(mouse, actionTarget)
        {
        }

        #region IAction Members

        public void Perform()
        {
            //Releases the mouse button currently left held. This action can be called
            //for an element different than the one ClickAndHoldAction was called for.
            //However, if this action is performed out of sequence (without holding
            //down the mouse button, for example) the results will be different
            //between browsers.
            this.MoveToLocation();
            this.Mouse.MouseUp(this.ActionLocation);
        }

        #endregion
    }
}
