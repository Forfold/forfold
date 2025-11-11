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
    window.matchMedia = () =>
      ({
        matches: false,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
  }
}
