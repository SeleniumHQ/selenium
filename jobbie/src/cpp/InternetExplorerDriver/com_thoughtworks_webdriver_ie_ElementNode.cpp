#include "stdafx.h"
#include <ExDisp.h>
#include "utils.h"
#include "ElementNode.h"
#include "DocumentNode.h"

using namespace std;

ElementNode* getElementNode(JNIEnv *env, jobject obj)
{
	jclass cls = env->GetObjectClass(obj);
	jfieldID fid = env->GetFieldID(cls, "nodePointer", "J");
	jlong value = env->GetLongField(obj, fid);

	return (ElementNode *) value;
}

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_getDocument
  (JNIEnv *env, jobject obj)
{
	ElementNode* node = getElementNode(env, obj);
	DocumentNode* doc = (DocumentNode*)node->getDocument();

	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/DocumentNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) doc);
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_getParent
  (JNIEnv *env, jobject obj)
{
	ElementNode* node = getElementNode(env, obj);
	ElementNode* parent = node->getParent();

	if (parent == NULL)
		return NULL;

	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/ElementNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) parent);
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_getFirstChild
  (JNIEnv *env, jobject obj)
{
	ElementNode* node = getElementNode(env, obj);
	Node* child = node->getFirstChild();
	if (child == NULL)
		return NULL;

	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/ElementNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) child);
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_getNextSibling
  (JNIEnv *env, jobject obj)
{	
	ElementNode* node = getElementNode(env, obj);
	Node* sibling = node->getNextSibling();

	if (sibling == NULL)
		return NULL;

	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/ElementNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) sibling);
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_getFirstAttribute
  (JNIEnv *env, jobject obj)
{
	ElementNode* node = getElementNode(env, obj);
	try {
		Node* attribute = node->getFirstAttribute();

		jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/AttributeNode");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
		return env->NewObject(clazz, cId, (jlong) attribute);
	} catch (const char* message) {
		throwNoSuchElementException(env, message);
	}
	return NULL;
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_getNativeName
  (JNIEnv *env, jobject obj)
{
	ElementNode* node = getElementNode(env, obj);
	const wchar_t* name = node->name();

	jstring toReturn = env->NewString((const jchar*) name, (jsize) wcslen(name));
	delete name;
	return toReturn;
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_getText
  (JNIEnv *env, jobject obj)
{
	ElementNode* node = getElementNode(env, obj);
	const wchar_t* text = node->getText();

	jstring toReturn = env->NewString((const jchar*) text, (jsize) wcslen(text));
	delete text;
	return toReturn;
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_deleteStoredObject
  (JNIEnv *env, jobject obj)
{
	ElementNode* node = getElementNode(env, obj);
	delete node;
}

#ifdef __cplusplus
}
#endif