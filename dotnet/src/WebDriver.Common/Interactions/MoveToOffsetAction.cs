using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    public class MoveToOffsetAction : MouseAction, IAction
    {
        private int xOffset;
        private int yOffset;

        public MoveToOffsetAction(IMouse mouse, ILocatable actionTarget, int xOffset, int yOffset)
            : base(mouse, actionTarget)
        {
            this.xOffset = xOffset;
            this.yOffset = yOffset;
        }

        #region IAction Members

        public void Perform()
        {
            this.Mouse.MouseMove(this.ActionLocation, xOffset, yOffset);
        }

        #endregion
    }
}
