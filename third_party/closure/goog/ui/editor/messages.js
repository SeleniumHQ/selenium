// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Messages common to Editor UI components.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.ui.editor.messages');


/** @desc Link button / bubble caption. */
goog.ui.editor.messages.MSG_LINK_CAPTION = goog.getMsg('Link');


/** @desc Title for the dialog that edits a link. */
goog.ui.editor.messages.MSG_EDIT_LINK = goog.getMsg('Edit Link');


/** @desc Prompt the user for the text of the link they've written. */
goog.ui.editor.messages.MSG_TEXT_TO_DISPLAY = goog.getMsg('Text to display:');


/** @desc Prompt the user for the URL of the link they've created. */
goog.ui.editor.messages.MSG_LINK_TO = goog.getMsg('Link to:');


/** @desc Prompt the user to type a web address for their link. */
goog.ui.editor.messages.MSG_ON_THE_WEB = goog.getMsg('Web address');


/** @desc More details on what linking to a web address involves.. */
goog.ui.editor.messages.MSG_ON_THE_WEB_TIP = goog.getMsg(
    'Link to a page or file somewhere else on the web');


/**
 * @desc Text for a button that allows the user to test the link that
 *     they created.
 */
goog.ui.editor.messages.MSG_TEST_THIS_LINK = goog.getMsg('Test this link');


/**
 * @desc Explanation for how to create a link with the link-editing dialog.
 */
goog.ui.editor.messages.MSG_TR_LINK_EXPLANATION = goog.getMsg(
    '{$startBold}Not sure what to put in the box?{$endBold} ' +
    'First, find the page on the web that you want to ' +
    'link to. (A {$searchEngineLink}search engine{$endLink} ' +
    'might be useful.) Then, copy the web address from ' +
    "the box in your browser's address bar, and paste it into " +
    'the box above.',
    {'startBold': '<b>',
     'endBold': '</b>',
     'searchEngineLink': "<a href='http://www.google.com/' target='_new'>",
     'endLink': '</a>'});


/** @desc Prompt for the URL of a link that the user is creating. */
goog.ui.editor.messages.MSG_WHAT_URL = goog.getMsg(
    'To what URL should this link go?');


/**
 * @desc Prompt for an email address, so that the user can create a link
 *    that sends an email.
 */
goog.ui.editor.messages.MSG_EMAIL_ADDRESS = goog.getMsg('Email address');


/**
 * @desc Explanation of the prompt for an email address in a link.
 */
goog.ui.editor.messages.MSG_EMAIL_ADDRESS_TIP = goog.getMsg(
    'Link to an email address');


/** @desc Error message when the user enters an invalid email address. */
goog.ui.editor.messages.MSG_INVALID_EMAIL = goog.getMsg(
    'Invalid email address');


/**
 * @desc When the user creates a mailto link, asks them what email
 *     address clicking on this link will send mail to.
 */
goog.ui.editor.messages.MSG_WHAT_EMAIL = goog.getMsg(
    'To what email address should this link?');


/**
 * @desc Warning about the dangers of creating links with email
 *     addresses in them.
 */
goog.ui.editor.messages.MSG_EMAIL_EXPLANATION = goog.getMsg(
    '{$preb}Be careful.{$postb} ' +
    'Remember that any time you include an email address on a web page, ' +
    'nasty spammers can find it too.', {'preb': '<b>', 'postb': '</b>'});


/**
 * @desc Label for the checkbox that allows the user to specify what when this
 *     link is clicked, it should be opened in a new window.
 */
goog.ui.editor.messages.MSG_OPEN_IN_NEW_WINDOW = goog.getMsg(
    'Open this link in a new window');


/** @desc Image bubble caption. */
goog.ui.editor.messages.MSG_IMAGE_CAPTION = goog.getMsg('Image');
