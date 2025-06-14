import React, { createContext, useReducer, useContext, Dispatch, ReactNode } from "react";

// Define role types
type RoleType = "client" | "artisan" | 'corperate' |null;

// State type
interface RoleState {
  role: RoleType;
}

// Action type
type RoleAction =
  | { type: "SET_ROLE"; payload: RoleType }
  | { type: "RESET_ROLE" };

// Context type
interface RoleContextType {
  state: RoleState;
  dispatch: Dispatch<RoleAction>;
}

// Initial state
const initialState: RoleState = {
  role: null,
};

// Reducer function
function roleReducer(state: RoleState, action: RoleAction): RoleState {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "RESET_ROLE":
      return { ...state, role: null };
    default:
      return state;
  }
}

// Create context with proper types
const RoleContext = createContext<RoleContextType>({
  state: initialState,
  dispatch: () => null, // dummy dispatch, satisfies Dispatch<RoleAction>
});

// Provider
export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(roleReducer, initialState);
  return (
    <RoleContext.Provider value={{ state, dispatch }}>
      {children}
    </RoleContext.Provider>
  );
};

// Hook
export const useRole = () => useContext(RoleContext);
