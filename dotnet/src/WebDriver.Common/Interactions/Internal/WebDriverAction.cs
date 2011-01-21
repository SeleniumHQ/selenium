using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Interactions.Internal
{
    internal abstract class WebDriverAction
    {
        private ILocatable where;

        /**
         * Common c'tor - a locatable element is provided.
         * @param actionLocation provider of coordinates for the action.
         */
        protected WebDriverAction(ILocatable actionLocation)
        {
            this.where = actionLocation;
        }

        /**
         * No locatable element provided - action in the context of the previous
         * action.
         */
        protected WebDriverAction()
        {
            this.where = null;
        }

        protected ILocatable ActionTarget
        {
            get { return where; }
        }
    }
}
