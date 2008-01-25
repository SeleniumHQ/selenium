#include "stdafx.h"
#include <ExDisp.h>
#include "utils.h"
#include "Node.h"
#include "AbstractNode.h"
#include "DocumentNode.h"

using namespace std;

AbstractNode* getAbstractNode(JNIEnv *env, jobject obj)
{
	jclass cls = env->GetObjectClass(obj);
	jfieldID fid = env->GetFieldID(cls, "nodePointer", "J");
	jlong value = env->GetLongField(obj, fid);

	return (AbstractNode *) value;
}

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobject JNICALL Java_com_googlecode_webdriver_ie_AbstractNode_getDocument
  (JNIEnv *env, jobject obj)
{
	AbstractNode* node = getAbstractNode(env, obj);
	DocumentNode* doc = (DocumentNode*)node->getDocument();

	jclass clazz = env->FindClass("com/googlecode/webdriver/ie/DocumentNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) doc);
}

JNIEXPORT jobject JNICALL Java_com_googlecode_webdriver_ie_AbstractNode_getParent
  (JNIEnv *env, jobject obj)
{
	AbstractNode* node = getAbstractNode(env, obj);
	Node* parent = node->getParent();

	return initJavaXPathNode(env, parent);
}

JNIEXPORT jobject JNICALL Java_com_googlecode_webdriver_ie_AbstractNode_getFirstChild
  (JNIEnv *env, jobject obj)
{
	AbstractNode* node = getAbstractNode(env, obj);
	Node* child = node->getFirstChild();

	return initJavaXPathNode(env, child);
}

JNIEXPORT jobject JNICALL Java_com_googlecode_webdriver_ie_AbstractNode_getNextSibling
  (JNIEnv *env, jobject obj)
{	
	AbstractNode* node = getAbstractNode(env, obj);
	Node* sibling = node->getNextSibling();

	return initJavaXPathNode(env, sibling);
}

JNIEXPORT jstring JNICALL Java_com_googlecode_webdriver_ie_AbstractNode_getNativeName
  (JNIEnv *env, jobject obj)
{
	AbstractNode* node = getAbstractNode(env, obj);
	const std::wstring name = node->name();

	return env->NewString((const jchar*) name.c_str(), (jsize) name.length());
}

JNIEXPORT jstring JNICALL Java_com_googlecode_webdriver_ie_AbstractNode_getText
  (JNIEnv *env, jobject obj)
{
	AbstractNode* node = getAbstractNode(env, obj);
	const wchar_t* text = node->getText();

	jstring toReturn = env->NewString((const jchar*) text, (jsize) wcslen(text));
	delete text;
	return toReturn;
}

JNIEXPORT void JNICALL Java_com_googlecode_webdriver_ie_AbstractNode_deleteStoredObject
  (JNIEnv *env, jobject obj)
{
	AbstractNode* node = getAbstractNode(env, obj);

	if (node)
		delete node;
}

#ifdef __cplusplus
}
#endif