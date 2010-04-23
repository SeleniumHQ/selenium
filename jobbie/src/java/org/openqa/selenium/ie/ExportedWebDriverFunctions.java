package org.openqa.selenium.ie;

import com.sun.jna.NativeLong;
import com.sun.jna.Pointer;
import com.sun.jna.PointerType;
import com.sun.jna.WString;
import com.sun.jna.ptr.ByReference;
import com.sun.jna.ptr.DoubleByReference;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.NativeLongByReference;
import com.sun.jna.ptr.PointerByReference;
import com.sun.jna.win32.StdCallLibrary;

interface ExportedWebDriverFunctions extends StdCallLibrary {
  int SUCCESS = 0;
  
  int wdNewDriverInstance(PointerByReference ptr);
  int wdFreeDriver(Pointer driver);
  int wdeFreeElement(Pointer element);
  int wdFreeElementCollection(Pointer collection, int alsoFreeElements);
  int wdFreeStringCollection(Pointer collection);
  int wdFreeScriptArgs(Pointer scriptArgs);
  int wdFreeScriptResult(Pointer scriptResult);

  int wdClose(Pointer driver);
  
  int wdGet(Pointer driver, WString string);
  int wdGetTitle(Pointer driver, PointerByReference ptr);
  int wdGetCurrentUrl(Pointer driver, PointerByReference ptr);
  int wdWaitForLoadToComplete(Pointer driver);
  int wdGetVisible(Pointer driver, IntByReference isVisible);
  int wdSetVisible(Pointer driver, int visible);
  int wdGetPageSource(Pointer driver, PointerByReference wrapper);
  
  int wdFindElementByClassName(Pointer driver, Pointer element, WString string, PointerByReference rawElement);
  int wdFindElementsByClassName(Pointer driver, Pointer element, WString string, PointerByReference elements);
  int wdFindElementById(Pointer driver, Pointer element, WString string, PointerByReference rawElement);
  int wdFindElementsById(Pointer driver, Pointer element, WString string, PointerByReference elements);
  int wdFindElementByLinkText(Pointer driver, Pointer element, WString string, PointerByReference rawElement);
  int wdFindElementsByLinkText(Pointer driver, Pointer element, WString string, PointerByReference elements);
  int wdFindElementByPartialLinkText(Pointer driver, Pointer element, WString string, PointerByReference rawElement);
  int wdFindElementsByPartialLinkText(Pointer driver, Pointer element, WString string, PointerByReference elements);
  int wdFindElementByName(Pointer driver, Pointer element, WString string, PointerByReference rawElement);
  int wdFindElementsByName(Pointer driver, Pointer element, WString string, PointerByReference elements);
  int wdFindElementByTagName(Pointer driver, Pointer element, WString string, PointerByReference rawElement);
  int wdFindElementsByTagName(Pointer driver, Pointer element, WString string, PointerByReference elements);
  int wdFindElementByXPath(Pointer driver, Pointer element, WString string, PointerByReference rawElement);
  int wdFindElementsByXPath(Pointer driver, Pointer element, WString string, PointerByReference elements);

  int wdeSubmit(Pointer element);
  int wdeClear(Pointer element);
  int wdeClick(Pointer element);
  int wdeIsEnabled(Pointer element, IntByReference selected);
  int wdeGetAttribute(Pointer driver, Pointer element, WString string, PointerByReference wrapper);
  int wdeGetValueOfCssProperty(Pointer element, WString name, PointerByReference wrapper);
  int wdeIsSelected(Pointer element, IntByReference selected);
  int wdeSetSelected(Pointer element);
  int wdeToggle(Pointer element, IntByReference toReturn);
  int wdeSendKeys(Pointer element, WString string);
  int wdeIsDisplayed(Pointer element, IntByReference displayed);
  int wdeGetText(Pointer element, PointerByReference wrapper);
  int wdeGetTagName(Pointer element, PointerByReference wrapper);
  
  int wdeGetDetailsOnceScrolledOnToScreen(Pointer element, HWNDByReference hwnd, NativeLongByReference x, NativeLongByReference y, NativeLongByReference width, NativeLongByReference height);
  int wdeGetLocation(Pointer element, NativeLongByReference x, NativeLongByReference y);
  int wdeGetSize(Pointer element, NativeLongByReference width, NativeLongByReference height);
  
  // Switching and navigation
  int wdSwitchToActiveElement(Pointer driver, PointerByReference result);
  int wdSwitchToWindow(Pointer driver, WString windowName);
  int wdSwitchToFrame(Pointer driver, WString string);
  int wdGoBack(Pointer driver);
  int wdGoForward(Pointer driver);
  int wdRefresh(Pointer driver);
  
  // Options
  int wdAddCookie(Pointer driver, WString string);
  int wdDeleteCookie(Pointer driver, WString string);
  int wdGetCookies(Pointer driver, PointerByReference wrapper);
  
  // Element collection functions
  int wdcGetElementCollectionLength(Pointer collection, IntByReference length);
  int wdcGetElementAtIndex(Pointer collection, int index, PointerByReference element);
  int wdcGetStringCollectionLength(Pointer collection, IntByReference length);
  int wdcGetStringAtIndex(Pointer rawStrings, int i, PointerByReference rawString);
  
  // String functions
  int wdStringLength(Pointer string, IntByReference length);
  int wdCopyString(Pointer string, int value, char[] rawString);
  int wdFreeString(Pointer string);
  
  // Javascript executing fu
  int wdNewScriptArgs(PointerByReference scriptArgsRef, int totalNumberOfArgs);
  int wdAddStringScriptArg(Pointer scriptArgs, WString string);
  int wdAddBooleanScriptArg(Pointer scriptArgs, int trueOrFalse);
  int wdAddNumberScriptArg(Pointer scriptArgs, NativeLong number);
  int wdAddDoubleScriptArg(Pointer scriptArgs, double number);
  int wdAddElementScriptArg(Pointer scriptArgs, Pointer element);
  int wdExecuteScript(Pointer driver, WString script, Pointer scriptArgs, PointerByReference scriptResultRef);
  int wdGetScriptResultType(Pointer driver, Pointer result, IntByReference type);
  int wdGetStringScriptResult(Pointer result, PointerByReference wrapper);
  int wdGetNumberScriptResult(Pointer result, NativeLongByReference value);
  int wdGetDoubleScriptResult(Pointer result, DoubleByReference value);
  int wdGetBooleanScriptResult(Pointer result, IntByReference value);
  int wdGetElementScriptResult(Pointer result, Pointer driver, PointerByReference element);
  int wdGetArrayLengthScriptResult(Pointer driver, Pointer result, IntByReference length);
  int wdGetArrayItemFromScriptResult(Pointer driver, Pointer result, int index,
      PointerByReference arrayItem);


  // Things that should be interactions
  int wdeMouseDownAt(HWND hwnd, NativeLong windowX, NativeLong windowY);
  int wdeMouseUpAt(HWND hwnd, NativeLong windowX, NativeLong windowY);
  int wdeMouseMoveTo(HWND hwnd, NativeLong duration, NativeLong fromX, NativeLong fromY, NativeLong toX, NativeLong toY);

  int wdGetAllWindowHandles(Pointer driver, PointerByReference rawHandles);
  int wdGetCurrentWindowHandle(Pointer driver, PointerByReference handle);

  // Screenshot capturing
  int wdCaptureScreenshotAsBase64(Pointer driver, PointerByReference string);

  int wdSetImplicitWaitTimeout(Pointer driver, NativeLong timeoutInMillis);

  public static class HWND extends PointerType { }
  
  public static class HWNDByReference extends ByReference {
      public HWNDByReference() {
          this(null);
      }
      public HWNDByReference(HWND h) {
          super(Pointer.SIZE);
          setValue(h);
      }
      public void setValue(HWND h) {
          getPointer().setPointer(0, h != null ? h.getPointer() : null);
      }
      public HWND getValue() {
          Pointer p = getPointer().getPointer(0);
          if (p == null)
              return null;
          HWND h = new HWND();
          h.setPointer(p);
          return h;
      }
  }
}
