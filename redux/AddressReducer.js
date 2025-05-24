const initialState = {
    defaultAddress: null,
  };
  
  export const addressReducer = (state = initialState, action) => {
    switch (action.type) {
      case "SET_DEFAULT_ADDRESS":
        return {
          ...state,
          defaultAddress: action.payload,
        };
      default:
        return state;
    }
  };
  