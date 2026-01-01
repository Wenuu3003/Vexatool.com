// PIN Code data interface
export interface ExtendedPinCodeData {
  pincode: string;
  state: string;
  district: string;
  taluk?: string; // Mandal / Taluka / Tehsil
  area: string;
  postOffice: string;
  officeType: 'BO' | 'SO' | 'HO' | 'GPO'; // Branch Office, Sub Office, Head Office, General Post Office
  region?: string;
}
