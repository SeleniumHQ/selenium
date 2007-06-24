#include "stdafx.h"
#include <ExDisp.h>
#include "utils.h"
#include "DocumentNode.h"
#include <iostream>

using namespace std;

DocumentNode* getDocumentNode(JNIEnv *env, jobject obj)
{
	jclass cls = env->GetObjectClass(obj);
	jfieldID fid = env->GetFieldID(cls, "nodePointer", "J");
	jlong value = env->GetLongField(obj, fid);

	return (DocumentNode *) value;
}

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_DocumentNode_getFirstChild
  (JNIEnv *env, jobject obj)
{
	DocumentNode* doc = getDocumentNode(env, obj);
	Node* child = doc->getFirstChild();

	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/ElementNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) child);
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_DocumentNode_deleteStoredObject
  (JNIEnv *env, jobject obj)
{
	DocumentNode* doc = getDocumentNode(env, obj);
	delete doc;
}

#ifdef __cplusplus
}
#endif