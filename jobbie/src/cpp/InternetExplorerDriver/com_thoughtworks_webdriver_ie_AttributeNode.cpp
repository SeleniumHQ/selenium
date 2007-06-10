#include <ExDisp.h>
#include "stdafx.h"
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

	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/AttributeNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) firstAttribute);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_AttributeNode_getName
  (JNIEnv *env, jobject obj)
{
	AttributeNode* node = getAttributeNode(env, obj);
	const char* name = node->name();

	return env->NewStringUTF(name);
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_AttributeNode_getNextSibling
  (JNIEnv *env, jobject obj)
{
	AttributeNode* node = getAttributeNode(env, obj);
	Node* sibling = node->getNextSibling();

	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/AttributeNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) sibling);
}

JNIEXPORT jboolean JNICALL Java_com_thoughtworks_webdriver_ie_AttributeNode_hasNextSibling
  (JNIEnv *env, jobject obj)
{
	AttributeNode* node = getAttributeNode(env, obj);
	return (jboolean) node->hasNextSibling();
}

#ifdef __cplusplus
}
#endif