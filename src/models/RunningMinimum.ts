// This is convenient for computing unions/joins of sorted lists.
export class RunningMinimum {
  public value: string | null

  constructor() {
    // Using a getter for 'value' would just bloat the code.
    // You know better than to set it directly right?
    this.value = null
  }

  consider(value: string) {
    if (value === null || value === undefined) return
    if (this.value === null) {
      this.value = value
    } else if (value < this.value) {
      this.value = value
    }
  }

  reset() {
    this.value = null
  }
}
