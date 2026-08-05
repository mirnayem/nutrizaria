export interface UserAccount {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  googleId?: string;
  firebaseUid?: string;
  createdAt?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface ProfileInput {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface AddressInput {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}
