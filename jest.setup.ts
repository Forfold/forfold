import '@testing-library/jest-dom'

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined') {
  if (!('ResizeObserver' in window)) {
    // @ts-expect-error - assigning to window for test env
    window.ResizeObserver = ResizeObserverStub
  }

  if (!window.matchMedia) {
    window.matchMedia = (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: (
        _type: string,
        _listener: EventListenerOrEventListenerObject | null,
        _options?: boolean | AddEventListenerOptions
      ) => undefined,
      removeEventListener: (
        _type: string,
        _listener: EventListenerOrEventListenerObject | null,
        _options?: boolean | EventListenerOptions
      ) => undefined,
      dispatchEvent: (_event: Event) => false,
    })
  }
}
