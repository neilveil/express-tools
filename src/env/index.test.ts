import './index'

const ET_VAR = process.env.ET_VAR

const expectedValue = 'Express Tools'

describe('Test a dummy environment variable value', () => {
  test(`"ET_VAR" should be equal to "expectedValue"`, () => {
    expect(ET_VAR).toBe(expectedValue)
  })
})
