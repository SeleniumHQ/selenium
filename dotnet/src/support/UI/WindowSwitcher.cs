using System;
using OpenQA.Selenium.Support.Extensions;

namespace OpenQA.Selenium.Support.UI;

/// <summary>
/// Provides a mechanism to easily switch between two browser windows.
/// </summary>
public class WindowSwitcher
{
    private readonly IWebDriver driver;
    private readonly string newWindowHandle;
    private readonly string originalHandle;

    /// <summary>
    /// Initializes a new instance of the <see cref="WindowSwitcher"/> class.
    /// </summary>
    /// <param name="driver">The <see cref="IWebDriver"/> instance that controls the two windows.</param>
    /// <param name="newWindowHandle">The handle of the new window.</param>
    /// <remarks>
    /// <para>
    /// It is recommended to use the <see cref="WebDriverExtensions.WithWindowOpenedBy"/> to instantiate this
    /// class.
    /// </para>
    /// <para>
    /// The current driver window handle is used to identify the existing window, while
    /// <paramref name="newWindowHandle"/> should be the handle of another, newly opened, window.
    /// </para>
    /// </remarks>
    public WindowSwitcher(IWebDriver driver, string newWindowHandle)
    {
        this.driver = driver;
        this.newWindowHandle = newWindowHandle;
        originalHandle = this.driver.CurrentWindowHandle;
    }

    /// <summary>
    /// Performs the provided action on the newly opened window, and returns to use the original window afterward.
    /// </summary>
    /// <param name="action">The action to perform on the newly opened window.</param>
    /// <example>
    /// <code>
    /// driver.WithWindowOpenedBy(() => driver.FindElement(By.Id("openWindowId")).Click())
    ///     .Do(() => {
    ///         // Perform whatever you want with the new window, for example:
    ///         driver.FindElement(By.Id("anElementOnTheNewWindow").Click();
    ///         Assert.That(driver.Title, Is.EqualTo("The new window!"));
    ///     });
    /// // Then continue to do stuff on the original window:
    /// driver.FindElement(By.Id("anElementOnTheOriginalWindow").Click();
    /// </code>
    /// </example>
    public void Do(Action action)
    {
        SwitchToNewWindow();
        try
        {
            action();
        }
        finally
        {
            SwitchToOriginalWindow();
        }
    }

    /// <summary>
    /// Switches to the new window.
    /// </summary>
    /// <remarks>
    /// The following example shows how to use <see cref="SwitchToNewWindow"/> and <see cref="SwitchToOriginalWindow"/>
    /// to switch back and forth between the two windows:
    /// <example>
    /// <code>
    /// var switcher = driver.WithWindowOpenedBy(() => driver.FindElement(By.Id("openWindowId")).Click());
    /// // Do some stuff on the original window:
    /// driver.FindElement(By.Id("aButtonOnTheOriginalWindow")).Click();
    ///
    /// // Do some stuff on the new window:
    /// switcher.SwitchToNewWindow();
    /// driver.FindElement(By.Id("anInputOnTheNewWindow")).SendKeys("Hi");
    ///
    /// // Do some more stuff on the original window:
    /// switcher.SwitchToOriginalWindow();
    /// driver.FindElement(By.Id("aButtonOnTheOriginalWindow")).Click();
    ///
    /// // And you can continue switching between the windows as you need...
    /// </code>
    /// </example>
    /// </remarks>
    public void SwitchToNewWindow()
    {
        driver.SwitchTo().Window(newWindowHandle);
    }

    /// <summary>
    /// Switches to the original window.
    /// </summary>
    /// <inheritdoc cref="SwitchToNewWindow" path="/remarks" />
    public void SwitchToOriginalWindow()
    {
        driver.SwitchTo().Window(originalHandle);
    }
}
