using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides methods for selecting options based on the label of the option.
    /// </summary>
    internal class LabelOptionSelectStrategy : BaseOptionSelectStrategy
    {
        /// <summary>
        /// Gets a value indicating whether an option has the specified label.
        /// </summary>
        /// <param name="optionElement">The candidate option element to select.</param>
        /// <param name="selectThis">The label of the option to select.</param>
        /// <returns><see langword="true"/> if the option meets the criteria; otherwise, <see langword="false"/>.</returns>
        protected override bool SelectOption(IWebElement optionElement, string selectThis)
        {
            return selectThis.Equals(optionElement.Text);
        }
    }
}