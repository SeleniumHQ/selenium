#ifndef utils_h
#define utils_h

#include <jni.h>
#include <iostream>

void throwRunTimeException(JNIEnv *, const char *message);
void throwNoSuchElementException(JNIEnv *, const char *message);
void throwUnsupportedOperationException(JNIEnv *, const char *message);
void startCom();
const char *bstr2char(const BSTR toConvert);
const char *variant2char(const VARIANT toConvert);

#endif