// PIN Code data interface - India standard format
export interface ExtendedPinCodeData {
  state: string;
  district: string;
  mandal: string; // Mandal / Taluka / Tehsil / Block
  village: string;
  post_office: string;
  pincode: string;
}
