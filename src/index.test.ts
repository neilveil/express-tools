import * as modules from './index'

describe('Integrated modules exported', () => {
  test('Axios exported', () => ('$axios' in modules ? undefined : false))
  test('Express exported', () => ('$express' in modules ? undefined : false))
  test('Joi exported', () => ('$joi' in modules ? undefined : false))
})
