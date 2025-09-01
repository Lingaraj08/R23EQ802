import Log from './Log';

export function withLogging<TAction, TState>(
  dispatch: (action: TAction) => void,
  getState: () => TState,
  source = 'Store'
) {
  return (action: TAction) => {
    const before = getState();
    // use 'frontend' stack and 'api' package (allowed values)
    Log('frontend', 'info', 'api', JSON.stringify({ phase: 'before', source, action, before })).catch(() => {});

    dispatch(action);

    const after = getState();
    Log('frontend', 'info', 'api', JSON.stringify({ phase: 'after', source, action, after })).catch(() => {});
  };
}