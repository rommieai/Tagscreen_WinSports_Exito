const scoreboardReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_GOAL':
      return { ...state, [action.team]: (state[action.team] || 0) + 1 };
    default:
      return state;
  }
};

export default scoreboardReducer;
