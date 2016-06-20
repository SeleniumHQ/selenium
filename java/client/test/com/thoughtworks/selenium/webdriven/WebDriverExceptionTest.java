package com.thoughtworks.selenium.webdriven;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.anyVararg;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.thoughtworks.selenium.webdriven.commands.*;

import com.google.common.base.Charsets;
import com.google.common.io.Files;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;

public class WebDriverExceptionTest {

  private RemoteWebDriver driver;
  private JavascriptLibrary library = new JavascriptLibrary();
  private ElementFinder finder;
  private Windows windows;
  private AlertOverride alertOverride = new AlertOverride(true);
  private SeleniumMutator mutator = new SeleniumMutator("", "");
  private KeyState state = new KeyState();
  private String[] args = {"", ""};

  @Before
  public void setUp() {
    driver = mock(RemoteWebDriver.class);
    when(driver.executeScript(anyString(), anyVararg())).thenThrow(new WebDriverException());
    when(driver.findElement(any(By.class))).thenThrow(new WebDriverException());
    when(driver.findElements(any(By.class))).thenThrow(new WebDriverException());
    when(driver.getTitle()).thenThrow(new WebDriverException());
    when(driver.getPageSource()).thenThrow(new WebDriverException());
    when(driver.getMouse()).thenThrow(new WebDriverException());
    when(driver.getKeyboard()).thenThrow(new WebDriverException());
    when(driver.manage()).thenThrow(new WebDriverException());
    when(driver.navigate()).thenThrow(new WebDriverException());
    when(driver.switchTo()).thenThrow(new WebDriverException());
    when(driver.getScreenshotAs(any(OutputType.class))).thenThrow(new WebDriverException());
    doThrow(new WebDriverException()).when(driver).close();
    doThrow(new WebDriverException()).when(driver).get(anyString());

    when(driver.getWindowHandles()).thenReturn(new HashSet<String>(){{add("a"); add("b");}});
    when(driver.getWindowHandle()).thenReturn("");

    windows = new Windows(driver);
    finder = new ElementFinder(library);
  }

  @Test
  public void canCatchCauseInFindElement() {
    try {
      finder.findElement(driver, "name=a");
      Assert.fail();
    } catch (RuntimeException e) {
    }
  }

  @Test(expected = WebDriverException.class)
  public void canCatchCauseInSelectWindow() {
    windows.selectWindow(driver, "");
  }

  @Test(expected = WebDriverException.class)
  public void canCatchCauseInSelectPopUp() {
    windows.selectPopUp(driver, "");
  }

  @Test(expected = WebDriverException.class)
  public void canCatchCauseInSelectFrame() {
    windows.selectPopUp(driver, "");
  }

  @Test(expected = WebDriverException.class)
  public void canCatchCauseInSelectBlankWindow() {
    windows.selectBlankWindow(driver);
  }

  @Test
  public void canCatchCauseInAddSelectionCommand() {
    try {
      new AddSelection(library, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInAssignIdCommand() {
    try {
      new AssignId(library, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInAttachFileCommand() throws IOException {
    File f = File.createTempFile("webdriver", "tmp");
    f.deleteOnExit();
    Files.write("", f, Charsets.UTF_8);
    String[] args = {"", f.toURI().toURL().toString()};
    try {
      new AttachFile(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInCaptureScreenshotToStringCommand() {
    try {
      new CaptureScreenshotToString().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInCheckCommand() {
    try {
      new Check(alertOverride, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInClickCommand() {
    try {
      new Click(alertOverride, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInClickAtCommand() {
    try {
      new ClickAt(alertOverride, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInCloseCommand() {
    try {
      new Close().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInCreateCookieCommand() {
    String[] args = {"name=value", ""};
    try {
      new CreateCookie().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInDeleteAllVisibleCookiesCommand() {
    try {
      new DeleteAllVisibleCookies().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInDeleteCookieCommand() {
    try {
      new DeleteCookie().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInDeselectPopUpCommand() {
    try {
      new DeselectPopUp(windows).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInDoubleClickCommand() {
    try {
      new DoubleClick(alertOverride, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInDragAndDropCommand() {
    String[] args = {"", "0,0"};
    try {
      new DragAndDrop(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInDragAndDropToObjectCommand() {
    try {
      new DragAndDropToObject(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInFindFirstSelectecOptionPropertyCommand() {
    try {
      new FindFirstSelectedOptionProperty(library, finder, "").apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInFindSelectedOptionPropertyCommand() {
    try {
      new FindFirstSelectedOptionProperty(library, finder, "").apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInFireEventCommand() {
    try {
      new FireEvent(finder, library).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInFireNamedEventCommand() {
    try {
      new FireNamedEvent(finder, library, "").apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetAlertCommand() {
    try {
      new GetAlert(alertOverride).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetAllButtonsCommand() {
    try {
      new GetAllButtons().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetAllFieldsCommand() {
    try {
      new GetAllFields().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetAllLinksCommand() {
    try {
      new GetAllLinks().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetAllWindowNamesCommand() {
    try {
      new GetAllWindowNames().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetAllWindowTitlesCommand() {
    try {
      new GetAllWindowTitles().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetAttributeCommand() {
    String[] args = {"id1@class", ""};
    try {
      new GetAttribute(library, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetAttributeFromAllWindowsCommand() {
    try {
      new GetAttributeFromAllWindows().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetBodyTextCommand() {
    try {
      new GetBodyText().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetConfirmationCommand() {
    try {
      new GetConfirmation(alertOverride).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetCookieCommand() {
    try {
      new GetCookie().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetCookieByNameCommand() {
    try {
      new GetCookieByName().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetCssCountCommand() {
    try {
      new GetCssCount().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetElementHeightCommand() {
    try {
      new GetElementHeight(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetElementIndexCommand() {
    try {
      new GetElementIndex(finder, library).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetElementPositionLeftCommand() {
    try {
      new GetElementPositionLeft(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetElementPositionTopCommand() {
    try {
      new GetElementPositionTop(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetElementWidthCommand() {
    try {
      new GetElementWidth(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetEvalCommand() {
    try {
      new GetEval(mutator).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetHtmlSourceCommand() {
    try {
      new GetHtmlSource().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetLocationCommand() {
    try {
      new GetLocation().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetSelectOptionsCommand() {
    try {
      new GetSelectOptions(library, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetTableCommand() {
    String[] args = {"table.0.0", ""};
    try {
      new GetTable(finder, library).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetTextCommand() {
    try {
      new GetText(library, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetTitleCommand() {
    try {
      new GetTitle().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetValueCommand() {
    try {
      new GetValue(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGetXpathCountCommand() {
    try {
      new GetXpathCount().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInGoBackCommand() {
    try {
      new GoBack().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInHighlightCommand() {
    try {
      new Highlight(finder, library).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInIsAlertPresentCommand() {
    try {
      new IsAlertPresent(alertOverride).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInIsCheckedCommand() {
    try {
      new IsChecked(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInIsConfirmationPresentCommand() {
    try {
      new IsConfirmationPresent(alertOverride).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInIsCookiePresentCommand() {
    try {
      new IsCookiePresent().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInIsEditableCommand() {
    try {
      new IsEditable(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  //@Test
  //public void canCatchCauseInIsElementPresentCommand() {
  //  try {
  //    new IsElementPresent(finder).apply(driver, args);
  //    Assert.fail("aaaa");
  //  } catch (RuntimeException e) {
  //    Assert.assertTrue(e.getCause() instanceof WebDriverException);
  //  }
  //}

  @Test
  public void canCatchCauseInIsOrderedCommand() {
    try {
      new IsOrdered(finder, library).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInIsSomethingSelectedCommand() {
    try {
      new IsSomethingSelected(library).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInIsTextPresentCommand() {
    try {
      new IsTextPresent(library).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInIsVisibleCommand() {
    try {
      new IsVisible(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInKeyDownNativeCommand() {
    String[] args = {"65", ""};
    try {
      new KeyDownNative().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInKeyEventCommand() {
    try {
      new KeyEvent(finder, library, state, "").apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInKeyPressNativeCommand() {
    String[] args = {"65", ""};
    try {
      new KeyPressNative().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInKeyUpNativeCommand() {
    String[] args = {"65", ""};
    try {
      new KeyUpNative().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInMouseEventCommand() {
    try {
      new MouseEvent(finder, library, "").apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInMouseEventAtCommand() {
    try {
      new MouseEventAt(finder, library, "").apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInOpenCommand() {
    try {
      new Open("http://example.com/").apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInOpenWindowCommand() {
    try {
      new OpenWindow("http://example.com", new GetEval(mutator)).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInRefreshCommand() {
    try {
      new Refresh().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInRemoveAllSelectionsCommand() {
    try {
      new RemoveAllSelections(finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInRemoveSelectionCommand() {
    try {
      new RemoveSelection(library, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInRunScriptCommand() {
    try {
      new RunScript(mutator).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInSelectFrameCommand() {
    try {
      new SelectFrame(windows).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInSelectOptionCommand() {
    try {
      new SelectOption(alertOverride, library, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInSelectPopupCommand() {
    try {
      new SelectPopUp(windows).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInSelectWindowCommand() {
    try {
      new SelectWindow(windows).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInSetNextConfirmationStateCommand() {
    try {
      new SetNextConfirmationState(true).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInSubmitCommand() {
    try {
      new Submit(alertOverride, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInTypeCommand() {
    try {
      new Type(alertOverride, library, finder, state).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInCommandTypeKeys() {
    try {
      new TypeKeys(alertOverride, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInUncheckCommand() {
    try {
      new Uncheck(alertOverride, finder).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInWaitForConditionCommand() {
    String[] args = {"", "1000"};
    try {
      new WaitForCondition(mutator).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInWaitForPageToLoadCommand() {
    String[] args = {"1000", ""};
    try {
      new WaitForPageToLoad().apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInWaitForPopupCommand() {
    String[] args = {"", "1000"};
    try {
      new WaitForPopup(windows).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInWindowFocusCommand() {
    try {
      new WindowFocus(library).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }

  @Test
  public void canCatchCauseInWindowMaximizeCommand() {
    try {
      new WindowMaximize(library).apply(driver, args);
      Assert.fail();
    } catch (RuntimeException e) {
      Assert.assertTrue(e.getCause() instanceof WebDriverException);
    }
  }
}
