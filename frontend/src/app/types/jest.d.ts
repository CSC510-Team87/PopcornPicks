type MockResponse = {
    ok: boolean;
    json: () => Promise<any>;
    status?: number;
    statusText?: string;
    headers?: Headers;
  };
  
  declare global {
    namespace jest {
      interface Fetch extends Function {
        mockClear: () => void;
        mockReset: () => void;
        mockImplementation: (fn: () => Promise<MockResponse>) => Fetch;
        mockImplementationOnce: (fn: () => Promise<MockResponse>) => Fetch;
      }
    }
  
    var fetch: jest.Fetch;
  }
  
  export {};