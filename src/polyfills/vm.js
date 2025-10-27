export function runInThisContext() {
  throw new Error('vm.runInThisContext is not supported in this environment');
}

export default {
  runInThisContext,
};
