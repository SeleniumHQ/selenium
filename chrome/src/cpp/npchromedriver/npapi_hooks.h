#ifndef WEBDRIVER_NPAPI_HOOKS_H_
#define WEBDRIVER_NPAPI_HOOKS_H_

//Method to call on the embed to type (pass as argument one string to type)
static const char *kSendKeysJavascriptCommand = "sendKeys";
//Method to call on the embed to click (pass as argument two int32s, x and y)
static const char *kClickJavascriptCommand = "clickAt";
//Method to call on the embed to move the mouse
//(pass as argument five int32s: duration in ms, oldX, oldY, newX and newY)
static const char *kMouseMoveJavascriptCommand = "mouseMoveTo";

#endif //WEBDRIVER_NPAPI_HOOKS_H_
