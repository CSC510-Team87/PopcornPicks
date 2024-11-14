declare namespace jest {
    interface MockedFunction<T extends (...args: any[]) => any> {
      (...args: Parameters<T>): ReturnType<T>
      mockClear: () => void
      mockReset: () => void
      mockImplementation: (fn: (...args: Parameters<T>) => ReturnType<T>) => this
      mockImplementationOnce: (fn: (...args: Parameters<T>) => ReturnType<T>) => this
      mockReturnValue: (value: ReturnType<T>) => this
      mockReturnValueOnce: (value: ReturnType<T>) => this
    }
  }