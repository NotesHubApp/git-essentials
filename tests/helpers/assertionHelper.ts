export async function expectToFailAsync(action: () => Promise<void>, predicate?: (thrown: any) => boolean) {
  let error: any

  try {
    await action()
  } catch (e: any) {
    error = e
  }

  expect(error).toBeDefined()
  if (predicate && !predicate(error)) {
    throw new Error('The thrown error did not match the expectation.')
  }
}

export async function expectToFailWithTypeAsync(action: () => Promise<void>, type: any) {
  let error: any

  try {
    await action()
  } catch (e: any) {
    error = e
  }

  expect(error).toBeDefined()
  expect(error).toBeInstanceOf(type)
}

export async function expectToFailWithErrorAsync(action: () => Promise<void>, err: Error) {
  let error: any

  try {
    await action()
  } catch (e: any) {
    error = e
  }

  expect(error).toBeDefined()
  expect(error).toEqual(err)
}

