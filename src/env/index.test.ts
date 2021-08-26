import './index'

const SFE_VAR = process.env.SFE_VAR

const expectedValue = 'Fast Express'

describe('Test a dummy environment variable value', () => {
  test(`"SFE_VAR" should be equal to "expectedValue"`, () => {
    expect(SFE_VAR).toBe(expectedValue)
  })
})
