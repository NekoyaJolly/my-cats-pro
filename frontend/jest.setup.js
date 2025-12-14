import '@testing-library/jest-dom'

// Mantine / UIコンポーネントが参照するブラウザAPIのポリフィル

const win = typeof globalThis.window !== 'undefined' ? globalThis.window : undefined

if (win && !win.matchMedia) {
	Object.defineProperty(win, 'matchMedia', {
		writable: true,
		value: (query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}),
	})
}

if (!('ResizeObserver' in globalThis)) {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
}

if (!('IntersectionObserver' in globalThis)) {
	globalThis.IntersectionObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
}
