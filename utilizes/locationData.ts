// Location data for dropdowns
export const countries = [
  { label: "Select Country", value: "" },
  { label: "Nigeria", value: "NG" },
  { label: "Ghana", value: "GH" },
  { label: "Kenya", value: "KE" },
  { label: "South Africa", value: "ZA" },
  { label: "United States", value: "US" },
  { label: "United Kingdom", value: "GB" },
  { label: "Canada", value: "CA" },
  { label: "Australia", value: "AU" },
  { label: "Germany", value: "DE" },
  { label: "France", value: "FR" },
  { label: "India", value: "IN" },
  { label: "China", value: "CN" },
  { label: "Japan", value: "JP" },
  { label: "Brazil", value: "BR" },
  { label: "Mexico", value: "MX" },
];

export const statesByCountry: { [key: string]: { label: string; value: string }[] } = {
  NG: [
    { label: "Select State", value: "" },
    { label: "Lagos", value: "Lagos" },
    { label: "Abuja", value: "Abuja" },
    { label: "Kano", value: "Kano" },
    { label: "Ibadan", value: "Ibadan" },
    { label: "Kaduna", value: "Kaduna" },
    { label: "Port Harcourt", value: "Port Harcourt" },
    { label: "Benin City", value: "Benin City" },
    { label: "Maiduguri", value: "Maiduguri" },
    { label: "Zaria", value: "Zaria" },
    { label: "Aba", value: "Aba" },
    { label: "Jos", value: "Jos" },
    { label: "Ilorin", value: "Ilorin" },
    { label: "Oyo", value: "Oyo" },
    { label: "Enugu", value: "Enugu" },
    { label: "Abeokuta", value: "Abeokuta" },
    { label: "Onitsha", value: "Onitsha" },
  ],
  GH: [
    { label: "Select State", value: "" },
    { label: "Greater Accra", value: "Greater Accra" },
    { label: "Ashanti", value: "Ashanti" },
    { label: "Western", value: "Western" },
    { label: "Eastern", value: "Eastern" },
    { label: "Northern", value: "Northern" },
    { label: "Volta", value: "Volta" },
    { label: "Central", value: "Central" },
    { label: "Upper East", value: "Upper East" },
    { label: "Upper West", value: "Upper West" },
  ],
  KE: [
    { label: "Select State", value: "" },
    { label: "Nairobi", value: "Nairobi" },
    { label: "Mombasa", value: "Mombasa" },
    { label: "Kisumu", value: "Kisumu" },
    { label: "Nakuru", value: "Nakuru" },
    { label: "Eldoret", value: "Eldoret" },
    { label: "Kisii", value: "Kisii" },
    { label: "Thika", value: "Thika" },
    { label: "Kitale", value: "Kitale" },
  ],
  ZA: [
    { label: "Select State", value: "" },
    { label: "Gauteng", value: "Gauteng" },
    { label: "Western Cape", value: "Western Cape" },
    { label: "KwaZulu-Natal", value: "KwaZulu-Natal" },
    { label: "Eastern Cape", value: "Eastern Cape" },
    { label: "Free State", value: "Free State" },
    { label: "Mpumalanga", value: "Mpumalanga" },
    { label: "Limpopo", value: "Limpopo" },
    { label: "North West", value: "North West" },
    { label: "Northern Cape", value: "Northern Cape" },
  ],
  US: [
    { label: "Select State", value: "" },
    { label: "Alabama", value: "AL" },
    { label: "Alaska", value: "AK" },
    { label: "Arizona", value: "AZ" },
    { label: "Arkansas", value: "AR" },
    { label: "California", value: "CA" },
    { label: "Colorado", value: "CO" },
    { label: "Connecticut", value: "CT" },
    { label: "Delaware", value: "DE" },
    { label: "Florida", value: "FL" },
    { label: "Georgia", value: "GA" },
    { label: "Hawaii", value: "HI" },
    { label: "Idaho", value: "ID" },
    { label: "Illinois", value: "IL" },
    { label: "Indiana", value: "IN" },
    { label: "Iowa", value: "IA" },
    { label: "Kansas", value: "KS" },
    { label: "Kentucky", value: "KY" },
    { label: "Louisiana", value: "LA" },
    { label: "Maine", value: "ME" },
    { label: "Maryland", value: "MD" },
    { label: "Massachusetts", value: "MA" },
    { label: "Michigan", value: "MI" },
    { label: "Minnesota", value: "MN" },
    { label: "Mississippi", value: "MS" },
    { label: "Missouri", value: "MO" },
    { label: "Montana", value: "MT" },
    { label: "Nebraska", value: "NE" },
    { label: "Nevada", value: "NV" },
    { label: "New Hampshire", value: "NH" },
    { label: "New Jersey", value: "NJ" },
    { label: "New Mexico", value: "NM" },
    { label: "New York", value: "NY" },
    { label: "North Carolina", value: "NC" },
    { label: "North Dakota", value: "ND" },
    { label: "Ohio", value: "OH" },
    { label: "Oklahoma", value: "OK" },
    { label: "Oregon", value: "OR" },
    { label: "Pennsylvania", value: "PA" },
    { label: "Rhode Island", value: "RI" },
    { label: "South Carolina", value: "SC" },
    { label: "South Dakota", value: "SD" },
    { label: "Tennessee", value: "TN" },
    { label: "Texas", value: "TX" },
    { label: "Utah", value: "UT" },
    { label: "Vermont", value: "VT" },
    { label: "Virginia", value: "VA" },
    { label: "Washington", value: "WA" },
    { label: "West Virginia", value: "WV" },
    { label: "Wisconsin", value: "WI" },
    { label: "Wyoming", value: "WY" },
  ],
  GB: [
    { label: "Select State", value: "" },
    { label: "England", value: "England" },
    { label: "Scotland", value: "Scotland" },
    { label: "Wales", value: "Wales" },
    { label: "Northern Ireland", value: "Northern Ireland" },
  ],
  CA: [
    { label: "Select State", value: "" },
    { label: "Ontario", value: "ON" },
    { label: "Quebec", value: "QC" },
    { label: "British Columbia", value: "BC" },
    { label: "Alberta", value: "AB" },
    { label: "Manitoba", value: "MB" },
    { label: "Saskatchewan", value: "SK" },
    { label: "Nova Scotia", value: "NS" },
    { label: "New Brunswick", value: "NB" },
    { label: "Newfoundland and Labrador", value: "NL" },
    { label: "Prince Edward Island", value: "PE" },
  ],
};

// Function to get states for a country
export const getStatesForCountry = (countryCode: string) => {
  return statesByCountry[countryCode] || [{ label: "Select State", value: "" }];
};

// Function to validate city name
export const validateCity = (city: string): string | null => {
  if (!city || city.trim().length === 0) {
    return "City is required";
  }
  
  if (city.trim().length < 2) {
    return "City name must be at least 2 characters";
  }
  
  if (city.trim().length > 50) {
    return "City name must be less than 50 characters";
  }
  
  // Allow letters, spaces, hyphens, and apostrophes
  const cityRegex = /^[a-zA-Z\s\-']+$/;
  if (!cityRegex.test(city.trim())) {
    return "City name can only contain letters, spaces, hyphens, and apostrophes";
  }
  
  return null;
};
