import nigeriaData from './statelga.json'
/**
 * Get the list of all states.
 * @returns {string[]} Array of state names
 */
export const getAllStates = () => {
    return nigeriaData.states.map(state => state.name);
};

/**
 * Get the list of Local Government Areas (LGAs) based on state name or state code.
 * @param {string} stateIdentifier - The state name or code.
 * @returns {string[]} Array of LGA names
 */
export const getLgasByState = (stateIdentifier:string) => {
    const state = nigeriaData.states.find(s => 
        s.name.toLowerCase() === stateIdentifier.toLowerCase() || 
        s.code.toLowerCase() === stateIdentifier.toLowerCase()
    );

    return state ? state.local_government_areas.map(lga => lga.name) : [];
};

