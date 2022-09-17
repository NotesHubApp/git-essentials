type VerifyResult = {
  valid: string[]
  invalid: string[]
}

function createSignature(payload: string, secretKey: string) {
  return `${payload}-${secretKey}`
}

export class PgpMock {
  private readonly publicKey: string
  private readonly keyId: string
  private signature?: string

  constructor(publicKey: string, keyId: string) {
    this.publicKey = publicKey
    this.keyId = keyId
  }

  sign(params: { payload: string, secretKey: string }): { signature: string } {
    this.signature = createSignature(params.payload, params.secretKey)
    return { signature: this.signature }
  }

  async verify(params: { payload: string, publicKey: string, signature?: string }): Promise<VerifyResult> {
    const sigValid = this.signature && this.publicKey === params.publicKey && params.signature === this.signature
    const invalid: string[] = []
    const valid: string[] = []
    ;(sigValid ? valid : invalid).push(this.keyId)

    return { valid, invalid }
  }
}

