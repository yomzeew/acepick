export function getInitials(profile:any) {
    if (!profile || !profile.firstName || !profile.lastName) return "";
  
    const firstInitial = profile.firstName.charAt(0).toUpperCase();
    const lastInitial = profile.lastName.charAt(0).toUpperCase();
  
    return firstInitial + lastInitial;
  }
  
  