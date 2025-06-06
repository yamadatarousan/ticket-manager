import '@testing-library/jest-dom';

const originalError = console.error;
console.error = (...args) => { if (args[0] && typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) { return; } originalError.call(console, ...args); };
const originalWarn = console.warn;
console.warn = (...args) => { if (args[0] && typeof args[0] === 'string' && (args[0].includes('React Router Future Flag Warning') || args[0].includes('v7_startTransition') || args[0].includes('v7_relativeSplatPath'))) { return; } originalWarn.call(console, ...args); };
console.error = (...args) => { if (args[0] && typeof args[0] === 'string' && (args[0].includes('React Router Future Flag Warning') || args[0].includes('not wrapped in act'))) { return; } originalError.call(console, ...args); };
