#ifndef utils_h
#define utils_h

#include <iostream>
#include <string>

#include <jni.h>

#include "InternetExplorerDriver.h"

void throwRunTimeException(JNIEnv *, const char *message);
void throwNoSuchElementException(JNIEnv *, const char *message);
void throwUnsupportedOperationException(JNIEnv *, const char *message);

void startCom();

jobject newJavaInternetExplorerDriver(JNIEnv *, InternetExplorerDriver* driver);

void wait(long millis);
std::wstring variant2wchar(const VARIANT toConvert);
std::wstring bstr2wstring(BSTR from);
jstring wstring2jstring(JNIEnv *env, const std::wstring& text);

#endif
