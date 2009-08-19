#ifndef WEBDRIVER_NPAPI_HOOKS_H_
#define WEBDRIVER_NPAPI_HOOKS_H_

//Method to call on the embed to type (pass as argument one string to type)
static const char *kSendKeysJavascriptCommand = "sendKeys";
//Method to call on the embed to click (pass as argument two int32s, x and y)
static const char *kClickJavascriptCommand = "clickAt";

//Method in the calling page which will be called if a call was successful
static const char *kSuccessfulJavascriptResponse = "nativeWebdriverSuccess()";
//Method in the calling page which will be called if a call failed
static const char *kFailureJavascriptResponse = "nativeWebdriverFailure()";

#endif //WEBDRIVER_NPAPI_HOOKS_H_
