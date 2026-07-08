export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  name: string;
}

export interface MedicalRecord {
  id: string;
  title: string;
  description: string;
  category: 'Lab Report' | 'Prescription' | 'Scan' | 'Discharge Summary' | 'Other';
  fileName: string;
  fileSize: string;
  fileContent: string;
  isSensitive: boolean;
  isLocked: boolean;
  trustBadge: 'verified_hospital' | 'patient_direct';
  uploadedByUserId: string;
  uploadedByUserName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
}

export interface Patient {
  userId: string;
  patientId: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  allergies: string;
  chronicDiseases: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  isEmergencyProfileComplete: boolean;
}

export interface Doctor {
  userId: string;
  hospitalId: string;
  hospitalName: string;
  specialization: string;
  licenseNumber: string;
  isVerified: boolean;
}
