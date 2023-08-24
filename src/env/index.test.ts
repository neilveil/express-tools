import env from './index'

const expectedValue = 'Express Tools'

describe('Test a dummy environment variable value', () => {
  test(`"JEST_TEST_VAR" env variable should be equal to "${expectedValue}"`, () => {
    env.refresh()
    expect(env('JEST_TEST_VAR')).toBe(expectedValue)
  })
})
