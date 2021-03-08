'use strict'

/**
 * Models a SELECT tag, providing helper methods to select and deselect options.
 *
 * @implements {ISelect}
 */
class Select {
  /**
   *
   * @param {!Promise<!WebElement>} el
   */
  constructor(el) {
    /** @private {!Promise<!WebElement>} */
    this.el_ = Promise.resolve(el)
  }

  /** @override */
  async isMultiple() {
    // TODO: Write tests for `Select.isMultiple()`.
    return (await this.el_.getAttribute('multiple')) != null
  }

  /** @override */
  async getOptions() {
    // TODO: Write tests for `Select.getOptions()`.
    return await this.el_.findElements({ tagName: 'option' })
  }

  /** @override */
  async getAllSelectedOptions() {
    // TODO: Please test and improve `Select.getAllSelectedOptions()`, probably won't work.
    return this.getOptions().filter((option) => option.getAttribute('selected'))
  }

  /** @override */
  async getFirstSelectedOption() {
    // TODO: Same for `Select.getFirstSelectedOption()`, probably won't work as expected.
    return this.getAllSelectedOptions()[0]
  }

  /** @override */
  async selectByVisibleText(text) {
    // TODO: Write tests for `Select.selectByVisibleText(text)`.
    const findIndex =
      '[...arguments[0].options].findIndex(o => o.text === arguments[1])'
    const setSelectedOption = `arguments[0].selectedIndex = ${findIndex};`
    const triggerOnChange = 'arguments[0].onchange();'
    const script = [setSelectedOption, triggerOnChange].join(' ')
    return await this.el_.getDriver().executeScript(script, this.el_, text)
  }

  /** @override */
  async selectByValue(value) {
    // TODO: Write tests for `Select.selectByValue(value)`.
    const setSelectedOption = 'arguments[0].value = arguments[1];'
    const triggerOnChange = 'arguments[0].onchange();'
    const script = [setSelectedOption, triggerOnChange].join(' ')
    await this.el_.getDriver().executeScript(script, this.el_, value)
  }

  /** @override */
  async selectByIndex(index) {
    // TODO: Write tests for `Select.selectByIndex(index)`.
    const setSelectedOption = 'arguments[0].selectedIndex = argument[1];'
    const triggerOnChange = 'arguments[0].onchange();'
    const script = [setSelectedOption, triggerOnChange].join(' ')
    return await this.el_.getDriver().executeScript(script, this.el_, index)
  }

  /** @override */
  async deselectAll() {
    // TODO: Please implement & test `Select.deselectAll`.
    throw new Error({ msg: 'Not implemented!', context: this })
  }

  /** @override */
  async deselectByVisibleText(text) {
    // TODO: Please implement & test `Select.deselectByVisibleText(text)`.
    throw new Error({
      msg: 'Not implemented!',
      params: { text },
      context: this,
    })
  }

  /** @override */
  async deselectByValue(value) {
    // TODO: Please implement & test `Select.deselectByValue(value)`.
    throw new Error({
      msg: 'Not implemented!',
      params: { value },
      context: this,
    })
  }

  /** @override */
  async deselectByIndex(index) {
    // TODO: Please implement & test `Select.deselectByIndex(index)`.
    throw new Error({
      msg: 'Not implemented!',
      params: { index },
      context: this,
    })
  }
}

exports.default = { Select }
