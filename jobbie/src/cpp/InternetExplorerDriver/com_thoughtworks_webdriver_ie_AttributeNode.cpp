#include "stdafx.h"
#include <ExDisp.h>
#include "utils.h"
#include "AttributeNode.h"

using namespace std;

AttributeNode* getAttributeNode(JNIEnv *env, jobject obj)
{
	jclass cls = env->GetObjectClass(obj);
	jfieldID fid = env->GetFieldID(cls, "nodePointer", "J");
	jlong value = env->GetLongField(obj, fid);

	return (AttributeNode *) value;
}

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_AttributeNode_getFirstAttribute
  (JNIEnv *env, jobject obj)
{
	AttributeNode* node = getAttributeNode(env, obj);
	Node* firstAttribute = node->getFirstAttribute();

	if (firstAttribute == NULL)
		return NULL;

	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/AttributeNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) firstAttribute);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_AttributeNode_getName
  (JNIEnv *env, jobject obj)
{
	AttributeNode* node = getAttributeNode(env, obj);
	const std::wstring name = node->name();

	jstring toReturn = env->NewString((const jchar*) name.c_str(), (jsize) name.length());
	return toReturn;
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_AttributeNode_getNextSibling
  (JNIEnv *env, jobject obj)
{
	AttributeNode* node = getAttributeNode(env, obj);
	Node* sibling = node->getNextSibling();

	if (sibling == NULL)
		return NULL;

	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/AttributeNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) sibling);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_AttributeNode_getText
  (JNIEnv *env, jobject obj)
{
	AttributeNode* node = getAttributeNode(env, obj);
	const wchar_t* text = node->getText();
	if (text == NULL)
		return NULL;

	jstring toReturn = env->NewString((const  jchar*) text, (jsize) wcslen(text));
	delete text;
	return toReturn;
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_AttributeNode_deleteStoredObject
  (JNIEnv *env, jobject obj)
{
	AttributeNode* node = getAttributeNode(env, obj);
	delete node;
}

#ifdef __cplusplus
}
#endif