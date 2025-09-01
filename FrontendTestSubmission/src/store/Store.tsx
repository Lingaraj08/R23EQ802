import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { withLogging } from '../logger/LoggingMiddleware';

export type ClickDetail = {
  timestamp: number;
  referrer: string | null;
  source: string | null;
  geo: { country?: string; city?: string } | null;
};

export type LinkItem = {
  id: string;
  original: string;
  createdAt: number;
  expiresAt: number | null;
  clicks: number;
  clickDetails: ClickDetail[];
};

type State = {
  links: LinkItem[];
};

type Action =
  | { type: 'ADD_LINK'; payload: LinkItem }
  | { type: 'INCREMENT_CLICK'; payload: { id: string; detail: ClickDetail } }
  | { type: 'REMOVE_EXPIRED' };

const STORAGE_KEY = 'short_links_v1';

const initialState: State = {
  links: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_LINK': {
      // ensure uniqueness server-side fallback: if id exists, append suffix
      let id = action.payload.id;
      const exists = new Set(state.links.map(l => l.id));
      if (exists.has(id)) {
        id = id + '-' + Math.random().toString(36).slice(2, 6);
      }
      const item = { ...action.payload, id };
      const next = { ...state, links: [item, ...state.links] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.links));
      return next;
    }
    case 'INCREMENT_CLICK': {
      const next = {
        ...state,
        links: state.links.map(l =>
          l.id === action.payload.id
            ? { ...l, clicks: l.clicks + 1, clickDetails: [action.payload.detail, ...l.clickDetails] }
            : l
        ),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.links));
      return next;
    }
    case 'REMOVE_EXPIRED': {
      const now = Date.now();
      const next = { ...state, links: state.links.filter(l => !l.expiresAt || l.expiresAt > now) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.links));
      return next;
    }
    default:
      return state;
  }
}

const StoreContext = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export const StoreProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [state, baseDispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // base dispatch wrapper for middleware
  const dispatchBase = (action: Action) => baseDispatch(action);
  const dispatch = withLogging<Action, State>(dispatchBase, () => stateRef.current, 'Store');

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'REMOVE_EXPIRED' }), 30_000);
    return () => clearInterval(id);
  }, [dispatch]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}