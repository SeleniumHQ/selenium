#ifndef utils_h
#define utils_h

#include <jni.h>
#include <iostream>
#include <string>
#include "InternetExplorerDriver.h"
#include "Node.h"

void throwRunTimeException(JNIEnv *, const char *message);
void throwNoSuchElementException(JNIEnv *, const char *message);
void throwUnsupportedOperationException(JNIEnv *, const char *message);

void startCom();

jobject newJavaInternetExplorerDriver(JNIEnv *, InternetExplorerDriver* driver);
jobject initJavaXPathNode(JNIEnv*, Node*);

const wchar_t *variant2wchar(const VARIANT toConvert);
wchar_t* bstr2wchar(BSTR from);
std::wstring bstr2wstring(BSTR from);

#endif