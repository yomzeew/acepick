interface Profile {
  firstName: string;
  lastName: string;
}

export function getInitials(profile: Profile | null | undefined): string {
  if (!profile?.firstName || !profile?.lastName) return "";
  
  const firstInitial = profile.firstName.charAt(0).toUpperCase();
  const lastInitial = profile.lastName.charAt(0).toUpperCase();
  
  return firstInitial + lastInitial;
}
  
  