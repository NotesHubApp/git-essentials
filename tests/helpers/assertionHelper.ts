export async function expectToFailAsync(action: () => Promise<void>, matcher?: (err: any) => boolean) {
  let error: any

  try {
    await action()
  } catch (e: any) {
    error = e
  }

  expect(error).toBeDefined()
  if (matcher && !matcher(error)) {
    fail('The thrown error did not match the expectation.')
  }
}
