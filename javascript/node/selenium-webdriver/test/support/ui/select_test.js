'use strict'

const assert = require('assert')
const { Select, By } = require('../../..')
const { Pages, suite } = require('../../../lib/test')

suite(function (env) {
  let driver

  before(async function () {
    driver = await env.builder().build()
  })

  after(function () {
    return driver.quit()
  })

  describe('test Select.isMultiple()', function () {
    it('should be false when no multiple attribute is set', async function () {
      await driver.get(Pages.selectPage)
      const target = await driver.findElement(By.id('selectWithoutMultiple'))
      const actual = await new Select(target).isMultiple()
      assert.strictEqual(actual, false)
    })

    it('should be true when the multiple attribute is set to "multiple"', async function () {
      await driver.get(Pages.selectPage)
      const target = await driver.findElement(
        By.id('selectWithMultipleEqualsMultiple')
      )
      const actual = await new Select(target).isMultiple()
      assert.strictEqual(actual, true)
    })

    it('should be true when the multiple attribute is set to ""', async function () {
      await driver.get(Pages.selectPage)
      const target = await driver.findElement(
        By.id('selectWithEmptyStringMultiple')
      )
      const actual = await new Select(target).isMultiple()
      assert.strictEqual(actual, true)
    })

    it('should be true when the multiple attribute is set without a value', async function () {
      await driver.get(Pages.selectPage)
      const target = await driver.findElement(
        By.id('selectWithMultipleWithoutValue')
      )
      const actual = await new Select(target).isMultiple()
      assert.strictEqual(actual, true)
    })

    it('should be true when the multiple attribute is set to something random', async function () {
      await driver.get(Pages.selectPage)
      const target = await driver.findElement(
        By.id('selectWithRandomMultipleValue')
      )
      const actual = await new Select(target).isMultiple()
      assert.strictEqual(actual, true)
    })
  })
})
