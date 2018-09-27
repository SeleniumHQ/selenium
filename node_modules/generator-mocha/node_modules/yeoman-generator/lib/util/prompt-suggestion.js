'use strict';
var assert = require('assert');
var _ = require('lodash');

/**
 * @mixin
 * @alias util/prompt-suggestion
 */
var promptSuggestion = module.exports;

/**
 * Returns the default value for a checkbox.
 *
 * @param  {Object} question Inquirer prompt item
 * @param  {*} defaultValue  The stored default value
 * @return {*}               Default value to set
 * @private
 */
var getCheckboxDefault = function (question, defaultValue) {
  // For simplicity we uncheck all boxes and
  // use .default to set the active ones.
  _.each(question.choices, function (choice) {
    if (typeof choice === 'object') {
      choice.checked = false;
    }
  });

  return defaultValue;
};

/**
 * Returns the default value for a list.
 *
 * @param  {Object} question    Inquirer prompt item
 * @param  {*} defaultValue     The stored default value
 * @return {*}                  Default value to set
 * @private
 */
var getListDefault = function (question, defaultValue) {
  var choiceValues = _.map(question.choices, function (choice) {
    if (typeof choice === 'object') {
      return choice.value;
    }
    return choice;
  });

  return choiceValues.indexOf(defaultValue);
};

/**
 * Return true if the answer should be store in
 * the global store, otherwise false.
 *
 * @param  {Object}       question Inquirer prompt item
 * @param  {String|Array} answer   The inquirer answer
 * @param  {Boolean}      storeAll Should store default values
 * @return {Boolean}               Answer to be stored
 * @private
 */
var storeListAnswer = function (question, answer, storeAll) {
  var choiceValues = _.map(question.choices, function (choice) {
    if (Object.prototype.hasOwnProperty.call(choice, 'value')) {
      return choice.value;
    }
    return choice;
  });
  var choiceIndex = choiceValues.indexOf(answer);

  // Check if answer is not equal to default value
  if (storeAll || question.default !== choiceIndex) {
    return true;
  }

  return false;
};

/**
 * Return true if the answer should be store in
 * the global store, otherwise false.
 *
 * @param  {Object}       question Inquirer prompt item
 * @param  {String|Array} answer   The inquirer answer
 * @param  {Boolean}      storeAll Should store default values
 * @return {Boolean}               Answer to be stored
 * @private
 */
var storeAnswer = function (question, answer, storeAll) {
  // Check if answer is not equal to default value or is undefined
  if (answer !== undefined && (storeAll || question.default !== answer)) {
    return true;
  }

  return false;
};

/**
 * Prefill the defaults with values from the global store.
 *
 * @param  {Store}        store     `.yo-rc-global` global config
 * @param  {Array|Object} questions Original prompt questions
 * @return {Array}                  Prompt questions array with prefilled values.
 */
promptSuggestion.prefillQuestions = function (store, questions) {
  assert(store, 'A store parameter is required');
  assert(questions, 'A questions parameter is required');

  var promptValues = store.get('promptValues') || {};

  if (!Array.isArray(questions)) {
    questions = [questions];
  }

  questions = questions.map(_.clone);

  // Write user defaults back to prompt
  return questions.map(function (question) {
    if (question.store !== true) {
      return question;
    }

    var storedValue = promptValues[question.name];

    if (storedValue === undefined) {
      return question;
    }

    // Override prompt default with the user's default
    switch (question.type) {
      case 'rawlist':
      case 'expand':
        question.default = getListDefault(question, storedValue);
        break;
      case 'checkbox':
        question.default = getCheckboxDefault(question, storedValue);
        break;
      default:
        question.default = storedValue;
        break;
    }

    return question;
  });
};

/**
 * Store the answers in the global store.
 *
 * @param  {Store}        store     `.yo-rc-global` global config
 * @param  {Array|Object} questions Original prompt questions
 * @param  {Object}       answers   The inquirer answers
 * @param  {Boolean}      storeAll  Should store default values
 */
promptSuggestion.storeAnswers = function (store, questions, answers, storeAll) {
  assert(store, 'A store parameter is required');
  assert(answers, 'A answers parameter is required');
  assert(questions, 'A questions parameter is required');
  assert.ok(_.isObject(answers), 'answers must be a object');

  storeAll = storeAll || false;
  var promptValues = store.get('promptValues') || {};

  if (!Array.isArray(questions)) {
    questions = [questions];
  }

  _.each(questions, function (question) {
    if (question.store !== true) {
      return;
    }

    var saveAnswer;
    var key = question.name;
    var answer = answers[key];

    switch (question.type) {
      case 'rawlist':
      case 'expand':
        saveAnswer = storeListAnswer(question, answer, storeAll);
        break;

      default:
        saveAnswer = storeAnswer(question, answer, storeAll);
        break;
    }

    if (saveAnswer) {
      promptValues[key] = answer;
    }
  });

  if (Object.keys(promptValues).length) {
    store.set('promptValues', promptValues);
  }
};
