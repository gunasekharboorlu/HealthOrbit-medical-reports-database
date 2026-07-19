import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Types for SIHRMS Database
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'patient' | 'doctor' | 'admin';
  name: string;
  createdAt: string;
}

export interface Patient {
  userId: string;
  patientId: string; // e.g. PAT-102938
  dob: string;
  gender: string;
  bloodGroup: string;
  allergies: string;
  chronicDiseases: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  isEmergencyProfileComplete: boolean;
  phone?: string;
  height?: string;
  weight?: string;
  currentMedications?: string;
}

export interface Doctor {
  userId: string;
  specialization: string;
  licenseNumber: string;
  hospitalId: string;
  hospitalName: string;
  isVerified: boolean;
  phone?: string;
  profilePicture?: string;
  about?: string;
  experience?: string;
  department?: string;
  joinedDate?: string;
  patientsTreated?: number;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  verified: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: string; // The patientId (PAT-XXXXXX)
  uploadedByUserId: string;
  uploadedByRole: 'patient' | 'doctor';
  uploadedByName: string;
  uploadedByHospitalId?: string;
  title: string;
  description: string;
  category: 'Lab Report' | 'Prescription' | 'Scan' | 'Discharge Summary' | 'Other';
  fileName: string;
  fileSize: string;
  fileContent: string; // Base64 or mock file path
  fileHash: string; // md5/sha256 or simply computed from file content/size for duplicate detection
  isSensitive: boolean; // Privacy lock
  createdAt: string;
  trustBadge: 'verified_hospital' | 'patient_direct';
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  createdAt: string;
}

export interface AccessRequest {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  hospitalName: string;
  recordId?: string; // If requested for a specific sensitive record
  recordTitle?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  respondedAt?: string;
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

export interface DatabaseSchema {
  users: User[];
  patients: Patient[];
  doctors: Doctor[];
  hospitals: Hospital[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  accessRequests: AccessRequest[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

const DB_FILE = path.join(process.cwd(), 'db.json');

// Get a random ID helper
export function generateId(prefix: string = ''): string {
  return `${prefix}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

import crypto from 'crypto';

export function generatePatientId(): string {
  try {
    const patients = db.getPatients();
    if (patients && patients.length > 0) {
      let maxId = 100000;
      patients.forEach((p: any) => {
        if (p.patientId && p.patientId.startsWith('PAT-')) {
          const num = parseInt(p.patientId.replace('PAT-', ''), 10);
          if (!isNaN(num) && num > maxId) {
            maxId = num;
          }
        }
      });
      return `PAT-${maxId + 1}`;
    }
  } catch (e) {
    // ignore and fallback
  }
  return 'PAT-100001';
}

// Generate a cryptographic SHA-256 hash from content to detect duplicate file content
export function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content || '').digest('hex');
}

// Initial Seed Data
const getInitialDatabase = (): DatabaseSchema => {
  const salt = bcrypt.genSaltSync(10);
  
  // Create default passwords
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const doctor1PasswordHash = bcrypt.hashSync('doctor123', salt);
  const doctor2PasswordHash = bcrypt.hashSync('doctor123', salt);
  const patient1PasswordHash = bcrypt.hashSync('patient123', salt);

  const hospitals: Hospital[] = [
    { id: 'HOSP-1', name: 'Metro General Hospital', address: '123 Health Ave, Metro City', verified: true },
    { id: 'HOSP-2', name: 'Saint Jude Medical Center', address: '55 Medical Plaza, Green Hills', verified: true },
    { id: 'HOSP-3', name: 'Valley Childrens Clinic', address: '89 Hope Street, Riverdale', verified: false }
  ];

  const users: User[] = [
    { id: 'USR-ADMIN', email: 'admin@healthorbit.org', passwordHash: adminPasswordHash, role: 'admin', name: 'Sarah Jenkins', createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() },
    { id: 'USR-DOC1', email: 'dr.smith@metro.org', passwordHash: doctor1PasswordHash, role: 'doctor', name: 'Dr. Robert Smith', createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString() },
    { id: 'USR-DOC2', email: 'dr.chen@stjude.org', passwordHash: doctor2PasswordHash, role: 'doctor', name: 'Dr. Lisa Chen', createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() },
    { id: 'USR-PAT1', email: 'john.doe@gmail.com', passwordHash: patient1PasswordHash, role: 'patient', name: 'John Doe', createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() }
  ];

  const patients: Patient[] = [
    {
      userId: 'USR-PAT1',
      patientId: 'PAT-100001',
      dob: '1988-05-14',
      gender: 'Male',
      bloodGroup: 'O-Positive',
      allergies: 'Penicillin, Shellfish',
      chronicDiseases: 'Hypertension',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1 (555) 987-6543',
      emergencyContactRelation: 'Spouse',
      isEmergencyProfileComplete: true,
      phone: '+1 (555) 543-2109',
      height: '180 cm',
      weight: '78 kg',
      currentMedications: 'Lisinopril 10mg (once daily), Multivitamins'
    }
  ];

  const doctors: Doctor[] = [
    {
      userId: 'USR-DOC1',
      specialization: 'Cardiology',
      licenseNumber: 'LIC-774920',
      hospitalId: 'HOSP-1',
      hospitalName: 'Metro General Hospital',
      isVerified: true,
      phone: '+1 (555) 234-5678',
      profilePicture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      about: 'Senior Cardiologist with over 15 years of experience in cardiovascular diseases, cardiac imaging, and preventive medicine.',
      experience: '15 years',
      department: 'Cardiology Department',
      joinedDate: '2021-03-15',
      patientsTreated: 124
    },
    {
      userId: 'USR-DOC2',
      specialization: 'Neurology',
      licenseNumber: 'LIC-883019',
      hospitalId: 'HOSP-2',
      hospitalName: 'Saint Jude Medical Center',
      isVerified: false, // Requires admin verification!
      phone: '+1 (555) 876-5432',
      profilePicture: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300',
      about: 'Neurologist specialized in cognitive neurology, headache disorders, and neuro-rehabilitation.',
      experience: '8 years',
      department: 'Neurology Department',
      joinedDate: '2023-08-10',
      patientsTreated: 52
    }
  ];

  const medicalRecords: MedicalRecord[] = [
    {
      id: 'REC-1',
      patientId: 'PAT-100001',
      uploadedByUserId: 'USR-DOC1',
      uploadedByRole: 'doctor',
      uploadedByName: 'Dr. Robert Smith',
      uploadedByHospitalId: 'HOSP-1',
      title: 'Electrocardiogram (ECG) Report',
      description: 'Patient presented with mild chest tightness. ECG shows normal sinus rhythm with no ST elevation.',
      category: 'Lab Report',
      fileName: 'ecg_report_john_doe.pdf',
      fileSize: '145 KB',
      fileContent: 'MOCK_PDF_BASE64_ECG',
      fileHash: computeHash('MOCK_PDF_BASE64_ECG'),
      isSensitive: false,
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      trustBadge: 'verified_hospital'
    },
    {
      id: 'REC-2',
      patientId: 'PAT-100001',
      uploadedByUserId: 'USR-PAT1',
      uploadedByRole: 'patient',
      uploadedByName: 'John Doe',
      title: 'Blood Cholesterol Panel',
      description: 'Annual wellness checkup. Cholesterol level is slightly elevated at 210 mg/dL.',
      category: 'Lab Report',
      fileName: 'blood_cholesterol_results.png',
      fileSize: '312 KB',
      fileContent: 'MOCK_PNG_BASE64_BLOOD',
      fileHash: computeHash('MOCK_PNG_BASE64_BLOOD'),
      isSensitive: true, // Marked as sensitive! Requires privacy lock approval
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      trustBadge: 'patient_direct'
    },
    {
      id: 'REC-3',
      patientId: 'PAT-100001',
      uploadedByUserId: 'USR-DOC1',
      uploadedByRole: 'doctor',
      uploadedByName: 'Dr. Robert Smith',
      uploadedByHospitalId: 'HOSP-1',
      title: 'Brain MRI Scan',
      description: 'Post-concussion screening. High-resolution scan shows zero structural lesions or hemorrhage.',
      category: 'Scan',
      fileName: 'brain_mri_scan.pdf',
      fileSize: '1.2 MB',
      fileContent: 'MOCK_PDF_BASE64_MRI',
      fileHash: computeHash('MOCK_PDF_BASE64_MRI'),
      isSensitive: true, // Marked as sensitive! Requires privacy lock approval
      createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      trustBadge: 'verified_hospital'
    }
  ];

  const prescriptions: Prescription[] = [
    {
      id: 'PRSC-1',
      patientId: 'PAT-100001',
      doctorId: 'USR-DOC1',
      doctorName: 'Dr. Robert Smith',
      hospitalName: 'Metro General Hospital',
      diagnosis: 'Mild Hypertension & Fatigue',
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily in the morning', duration: '30 Days' },
        { name: 'Coenzyme Q10', dosage: '100mg', frequency: 'Once daily with meal', duration: '60 Days' }
      ],
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const accessRequests: AccessRequest[] = [
    {
      id: 'REQ-1',
      patientId: 'PAT-100001',
      doctorId: 'USR-DOC1',
      doctorName: 'Dr. Robert Smith',
      doctorSpecialization: 'Cardiology',
      hospitalName: 'Metro General Hospital',
      recordId: 'REC-3',
      recordTitle: 'Brain MRI Scan',
      status: 'approved',
      requestedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      respondedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'REQ-2',
      patientId: 'PAT-100001',
      doctorId: 'USR-DOC1',
      doctorName: 'Dr. Robert Smith',
      doctorSpecialization: 'Cardiology',
      hospitalName: 'Metro General Hospital',
      recordId: 'REC-2',
      recordTitle: 'Blood Cholesterol Panel',
      status: 'pending',
      requestedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'NOT-1',
      userId: 'USR-PAT1',
      title: 'New Access Request',
      message: 'Dr. Robert Smith is requesting access to your sensitive medical record: "Blood Cholesterol Panel".',
      read: false,
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'NOT-2',
      userId: 'USR-PAT1',
      title: 'Access Request Approved',
      message: 'You have granted Dr. Robert Smith access to your record: "Brain MRI Scan".',
      read: true,
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'NOT-3',
      userId: 'USR-DOC2',
      title: 'Account Registration Successful',
      message: 'Your doctor account has been registered and is pending verification from the Hospital Administrator.',
      read: false,
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'LOG-1',
      userId: 'USR-PAT1',
      userName: 'John Doe',
      userRole: 'patient',
      action: 'RECORD_UPLOAD',
      details: 'Uploaded self-recorded Lab Report: "Blood Cholesterol Panel" marked as Sensitive.',
      timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'LOG-2',
      userId: 'USR-DOC1',
      userName: 'Dr. Robert Smith',
      userRole: 'doctor',
      action: 'RECORD_VIEW',
      details: 'Viewed ECG Report for Patient PAT-100001.',
      timestamp: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'LOG-3',
      userId: 'USR-PAT1',
      userName: 'John Doe',
      userRole: 'patient',
      action: 'ACCESS_APPROVE',
      details: 'Approved Dr. Robert Smith access request for Brain MRI Scan.',
      timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    }
  ];

  return {
    users,
    patients,
    doctors,
    hospitals,
    medicalRecords,
    prescriptions,
    accessRequests,
    notifications,
    auditLogs
  };
};

// Database persistence wrapper
class DatabaseManager {
  private schema: DatabaseSchema;

  constructor() {
    this.schema = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to read database file, initializing fresh', e);
    }
    const fresh = getInitialDatabase();
    this.saveToDisk(fresh);
    return fresh;
  }

  private saveToDisk(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  private persist() {
    this.saveToDisk(this.schema);
  }

  // Getters
  getUsers() { return this.schema.users; }
  getPatients() { return this.schema.patients; }
  getDoctors() { return this.schema.doctors; }
  getHospitals() { return this.schema.hospitals; }
  getMedicalRecords() { return this.schema.medicalRecords; }
  getPrescriptions() { return this.schema.prescriptions; }
  getAccessRequests() { return this.schema.accessRequests; }
  getNotifications() { return this.schema.notifications; }
  getAuditLogs() { return this.schema.auditLogs; }

  // User Actions
  addUser(user: User) {
    this.schema.users.push(user);
    this.persist();
  }

  addPatient(patient: Patient) {
    this.schema.patients.push(patient);
    this.persist();
  }

  updatePatient(userId: string, updates: Partial<Patient>) {
    const idx = this.schema.patients.findIndex(p => p.userId === userId);
    if (idx !== -1) {
      this.schema.patients[idx] = { ...this.schema.patients[idx], ...updates };
      this.persist();
      return this.schema.patients[idx];
    }
    return null;
  }

  updateDoctor(userId: string, updates: Partial<Doctor>) {
    const idx = this.schema.doctors.findIndex(d => d.userId === userId);
    if (idx !== -1) {
      this.schema.doctors[idx] = { ...this.schema.doctors[idx], ...updates };
      this.persist();
      return this.schema.doctors[idx];
    }
    return null;
  }

  updateUser(userId: string, updates: Partial<User>) {
    const idx = this.schema.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      this.schema.users[idx] = { ...this.schema.users[idx], ...updates };
      this.persist();
      return this.schema.users[idx];
    }
    return null;
  }

  addDoctor(doctor: Doctor) {
    this.schema.doctors.push(doctor);
    this.persist();
  }

  updateDoctorVerification(userId: string, isVerified: boolean) {
    const idx = this.schema.doctors.findIndex(d => d.userId === userId);
    if (idx !== -1) {
      this.schema.doctors[idx].isVerified = isVerified;
      this.schema.medicalRecords.forEach(r => {
        if (r.uploadedByUserId === userId) {
          r.trustBadge = isVerified ? 'verified_hospital' : 'patient_direct';
        }
      });
      this.persist();
      return this.schema.doctors[idx];
    }
    return null;
  }

  addHospital(hospital: Hospital) {
    this.schema.hospitals.push(hospital);
    this.persist();
  }

  // Medical Records Actions
  addMedicalRecord(record: MedicalRecord) {
    this.schema.medicalRecords.push(record);
    this.persist();
  }

  deleteMedicalRecord(id: string) {
    const originalLen = this.schema.medicalRecords.length;
    this.schema.medicalRecords = this.schema.medicalRecords.filter(r => r.id !== id);
    this.persist();
    return this.schema.medicalRecords.length < originalLen;
  }

  // Prescriptions Actions
  addPrescription(prescription: Prescription) {
    this.schema.prescriptions.push(prescription);
    this.persist();
  }

  // Access Requests Actions
  addAccessRequest(request: AccessRequest) {
    this.schema.accessRequests.push(request);
    this.persist();
  }

  updateAccessRequest(id: string, status: 'approved' | 'rejected') {
    const idx = this.schema.accessRequests.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.schema.accessRequests[idx].status = status;
      this.schema.accessRequests[idx].respondedAt = new Date().toISOString();
      this.persist();
      return this.schema.accessRequests[idx];
    }
    return null;
  }

  // Notifications Actions
  addNotification(notification: Notification) {
    this.schema.notifications.push(notification);
    this.persist();
  }

  markNotificationAsRead(id: string) {
    const idx = this.schema.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.schema.notifications[idx].read = true;
      this.persist();
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(userId: string) {
    this.schema.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.persist();
  }

  // Audit Logs Actions
  addAuditLog(userId: string, userName: string, userRole: string, action: string, details: string) {
    const log: AuditLog = {
      id: generateId('LOG-'),
      userId,
      userName,
      userRole,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.schema.auditLogs.unshift(log); // newest first
    // Limit logs to keep file reasonable
    if (this.schema.auditLogs.length > 500) {
      this.schema.auditLogs = this.schema.auditLogs.slice(0, 500);
    }
    this.persist();
    return log;
  }
}

export const db = new DatabaseManager();
