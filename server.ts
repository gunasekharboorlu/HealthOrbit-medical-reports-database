import express from 'express';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, generateId, generatePatientId, computeHash, User, Patient, Doctor, MedicalRecord, Prescription, AccessRequest, Notification, AuditLog } from './server-db';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sihrms_secret_key_102938';

app.use(cors());
// Support large body sizes for mock PDF/image base64 files
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- CENTRALIZED ERROR HANDLING SYSTEM ---
export class ApiError extends Error {
  statusCode: number;
  code: string;
  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// --- SECURITY MIDDLEWARE ---
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireRole(roles: ('patient' | 'doctor' | 'admin')[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized role access' });
    }
    next();
  };
}

// --- SYSTEM HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- AUTHENTICATION ENDPOINTS ---

// Register
app.post('/api/auth/register', (req, res, next) => {
  try {
    const { email, password, role, name, extraData } = req.body;

    if (!email || !password || !role || !name) {
      return next(new ApiError(400, 'BAD_REQUEST', 'All fields are required'));
    }

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return next(new ApiError(400, 'BAD_REQUEST', 'Invalid role specified'));
    }

    const users = db.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return next(new ApiError(400, 'AUTH_EMAIL_ALREADY_REGISTERED', 'Email already registered'));
    }

    if (password.length < 8) {
      return next(new ApiError(400, 'BAD_REQUEST', 'Password must be at least 8 characters long'));
    }
    if (!/[A-Z]/.test(password)) {
      return next(new ApiError(400, 'BAD_REQUEST', 'Password must contain at least one uppercase letter (A-Z)'));
    }
    if (!/[a-z]/.test(password)) {
      return next(new ApiError(400, 'BAD_REQUEST', 'Password must contain at least one lowercase letter (a-z)'));
    }
    if (!/[0-9]/.test(password)) {
      return next(new ApiError(400, 'BAD_REQUEST', 'Password must contain at least one number (0-9)'));
    }
    if (!/[!@#$%^&*()]/.test(password)) {
      return next(new ApiError(400, 'BAD_REQUEST', 'Password must contain at least one special character (!@#$%^&*())'));
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = generateId('USR-');

    const newUser: User = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash,
      role,
      name,
      createdAt: new Date().toISOString()
    };

    db.addUser(newUser);

    if (role === 'patient') {
      const patientId = generatePatientId();
      const newPatient: Patient = {
        userId,
        patientId,
        dob: extraData?.dob || '',
        gender: extraData?.gender || '',
        bloodGroup: extraData?.bloodGroup || '',
        allergies: extraData?.allergies || '',
        chronicDiseases: extraData?.chronicDiseases || '',
        emergencyContactName: extraData?.emergencyContactName || '',
        emergencyContactPhone: extraData?.emergencyContactPhone || '',
        emergencyContactRelation: extraData?.emergencyContactRelation || '',
        isEmergencyProfileComplete: !!(extraData?.bloodGroup && extraData?.emergencyContactName && extraData?.emergencyContactPhone)
      };
      db.addPatient(newPatient);

      // Audit Log
      db.addAuditLog(userId, name, 'patient', 'PATIENT_REGISTER', `Resource ID: ${userId} | IP: ${req.ip} | Result: Success | Patient registered with ID ${patientId}`);

      // Notification
      db.addNotification({
        id: generateId('NOT-'),
        userId,
        title: 'Welcome to SIHRMS!',
        message: `Your account has been registered successfully. Your Patient ID is ${patientId}. Keep this secure!`,
        read: false,
        createdAt: new Date().toISOString()
      });
    } else if (role === 'doctor') {
      const hospitalId = extraData?.hospitalId || 'HOSP-1';
      const selectedHospital = db.getHospitals().find(h => h.id === hospitalId) || db.getHospitals()[0];

      const newDoctor: Doctor = {
        userId,
        specialization: extraData?.specialization || 'General Physician',
        licenseNumber: extraData?.licenseNumber || '',
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        isVerified: false // Admin must verify doctor
      };
      db.addDoctor(newDoctor);

      // Audit Log
      db.addAuditLog(userId, name, 'doctor', 'DOCTOR_REGISTER', `Resource ID: ${userId} | IP: ${req.ip} | Result: Success | Doctor registered with license ${newDoctor.licenseNumber}. Pending verification.`);

      // Notification
      db.addNotification({
        id: generateId('NOT-'),
        userId,
        title: 'Account Registered',
        message: 'Your credentials have been submitted. An administrator will verify your profile shortly.',
        read: false,
        createdAt: new Date().toISOString()
      });

      // Admin Notification
      const admins = db.getUsers().filter(u => u.role === 'admin');
      admins.forEach(admin => {
        db.addNotification({
          id: generateId('NOT-'),
          userId: admin.id,
          title: 'Pending Doctor Verification',
          message: `Dr. ${name} registered and is pending verification.`,
          read: false,
          createdAt: new Date().toISOString()
        });
      });
    } else {
      // Admin
      db.addAuditLog(userId, name, 'admin', 'ADMIN_REGISTER', `New system administrator registered`);
    }

    const token = jwt.sign({ id: userId, role, name, email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: { id: userId, email, role, name }
    });
  } catch (err: any) {
    next(err);
  }
});

// Login
app.post('/api/auth/login', (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, 'BAD_REQUEST', 'Email and password are required'));
    }

    const user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return next(new ApiError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid credentials'));
    }

    if (role && user.role !== role) {
      return next(new ApiError(401, 'AUTH_ROLE_MISMATCH', `This account is registered as a ${user.role.toUpperCase()}. Please select the correct tab.`));
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return next(new ApiError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid credentials'));
    }

    // Check if doctor is verified before giving doctor tools (we will allow login but limit dashboard access)
    let isDoctorVerified = true;
    if (user.role === 'doctor') {
      const doc = db.getDoctors().find(d => d.userId === user.id);
      isDoctorVerified = doc ? doc.isVerified : false;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Audit Log
    db.addAuditLog(user.id, user.name, user.role, 'USER_LOGIN', `User logged in from ${req.ip}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isDoctorVerified
      }
    });
  } catch (err: any) {
    next(err);
  }
});

// Me Profile
app.get('/api/auth/me', authenticateToken, (req: any, res, next) => {
  try {
    const user = db.getUsers().find(u => u.id === req.user.id);
    if (!user) {
      return next(new ApiError(404, 'USER_NOT_FOUND', 'User not found'));
    }

    let extraProfile: any = {};
    if (user.role === 'patient') {
      extraProfile = db.getPatients().find(p => p.userId === user.id) || {};
    } else if (user.role === 'doctor') {
      extraProfile = db.getDoctors().find(d => d.userId === user.id) || {};
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      createdAt: user.createdAt,
      ...extraProfile
    });
  } catch (err: any) {
    next(err);
  }
});

// --- PATIENT ROUTES ---

// Patient Dashboard State
app.get('/api/patient/dashboard', authenticateToken, requireRole(['patient']), (req: any, res, next) => {
  try {
    const patient = db.getPatients().find(p => p.userId === req.user.id);
    if (!patient) {
      return next(new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient profile not found'));
    }

    const records = db.getMedicalRecords().filter(r => r.patientId === patient.patientId);
    const prescriptions = db.getPrescriptions().filter(p => p.patientId === patient.patientId);
    const pendingRequests = db.getAccessRequests().filter(r => r.patientId === patient.patientId && r.status === 'pending');
    const accessHistory = db.getAccessRequests().filter(r => r.patientId === patient.patientId && r.status !== 'pending');
    const notifications = db.getNotifications().filter(n => n.userId === req.user.id).slice(0, 10);

    res.json({
      patient,
      records,
      prescriptions,
      pendingRequests,
      accessHistory,
      notifications
    });
  } catch (err: any) {
    next(err);
  }
});

// Update Profile
app.put('/api/patient/profile', authenticateToken, requireRole(['patient']), (req: any, res, next) => {
  try {
    const { dob, gender, bloodGroup, allergies, chronicDiseases, emergencyContactName, emergencyContactPhone, emergencyContactRelation } = req.body;

    const patient = db.getPatients().find(p => p.userId === req.user.id);
    if (!patient) {
      return next(new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient profile not found'));
    }

    const isComplete = !!(bloodGroup && emergencyContactName && emergencyContactPhone);

    const updated = db.updatePatient(req.user.id, {
      dob: dob ?? patient.dob,
      gender: gender ?? patient.gender,
      bloodGroup: bloodGroup ?? patient.bloodGroup,
      allergies: allergies ?? patient.allergies,
      chronicDiseases: chronicDiseases ?? patient.chronicDiseases,
      emergencyContactName: emergencyContactName ?? patient.emergencyContactName,
      emergencyContactPhone: emergencyContactPhone ?? patient.emergencyContactPhone,
      emergencyContactRelation: emergencyContactRelation ?? patient.emergencyContactRelation,
      isEmergencyProfileComplete: isComplete
    });

    db.addAuditLog(req.user.id, req.user.name, 'patient', 'PROFILE_UPDATE', 'Updated patient medical details and emergency contact');

    res.json(updated);
  } catch (err: any) {
    next(err);
  }
});

// Upload Medical Record
app.post('/api/patient/upload-record', authenticateToken, requireRole(['patient', 'doctor']), (req: any, res, next) => {
  try {
    const { title, description, category, fileName, fileSize, fileContent, isSensitive, targetPatientId } = req.body;

    if (!title || !category || !fileName || !fileContent) {
      return next(new ApiError(400, 'BAD_REQUEST', 'Title, category, filename, and file are required'));
    }

    // 1. Backend File Size Verification (10MB Max calculated from base64)
    const base64Parts = fileContent.split(';base64,');
    const base64Data = base64Parts.pop() || '';
    const calculatedSize = base64Data.length * 0.75;
    if (calculatedSize > 10 * 1024 * 1024) {
      db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: File too large`);
      return next(new ApiError(400, 'UPLOAD_FILE_TOO_LARGE', 'Security rejection: Uploaded file exceeds the 10MB limit'));
    }

    // 2. Backend Filename Sanitization & Length Checks
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9.\-_]/g, '-')
      .replace(/\.{2,}/g, '.')
      .trim();
    if (!sanitizedFileName || sanitizedFileName.length > 80) {
      db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Malformed or long filename`);
      return next(new ApiError(400, 'UPLOAD_INVALID_FILE', 'Security rejection: Malformed or excessively long filename'));
    }

    // 3. Backend File Extension Verification
    const fileExt = '.' + sanitizedFileName.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    if (!allowedExtensions.includes(fileExt)) {
      db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Unsupported extension ${fileExt}`);
      return next(new ApiError(400, 'UPLOAD_INVALID_FILE', 'Security rejection: Unsupported file extension. Only PDF, PNG, JPG, JPEG are allowed.'));
    }

    // 4. Backend MIME Type Extraction & Verification from Base64 Data URI
    const mimeMatch = fileContent.match(/^data:([^;]+);base64,/);
    if (!mimeMatch) {
      db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Malformed file payload format`);
      return next(new ApiError(400, 'UPLOAD_INVALID_FILE', 'Security rejection: Malformed file payload format'));
    }
    const mimeType = mimeMatch[1].toLowerCase();
    const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedMimes.includes(mimeType)) {
      db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Unsupported mime type ${mimeType}`);
      return next(new ApiError(400, 'UPLOAD_INVALID_FILE', 'Security rejection: Unsupported file MIME type.'));
    }

    let finalPatientId = '';
    if (req.user.role === 'patient') {
      const patient = db.getPatients().find(p => p.userId === req.user.id);
      if (!patient) {
        db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Patient profile not found`);
        return next(new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient profile not found'));
      }
      finalPatientId = patient.patientId;
    } else {
      // Doctor uploading for patient
      const docProfile = db.getDoctors().find(d => d.userId === req.user.id);
      if (!docProfile || !docProfile.isVerified) {
        db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Doctor account is pending verification`);
        return next(new ApiError(403, 'UNAUTHORIZED_DOCTOR', 'Doctor account is pending verification'));
      }

      if (!targetPatientId) {
        db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Patient ID is required`);
        return next(new ApiError(400, 'BAD_REQUEST', 'Patient ID is required for medical uploads'));
      }
      const patient = db.getPatients().find(p => p.patientId === targetPatientId);
      if (!patient) {
        db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Patient not found`);
        return next(new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient not found'));
      }
      finalPatientId = targetPatientId;
    }

    const fileHash = computeHash(fileContent);

    // Duplicate Record Detection
    const existingRecords = db.getMedicalRecords().filter(r => r.patientId === finalPatientId);
    const duplicate = existingRecords.find(r => r.fileHash === fileHash);

    if (duplicate) {
      db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Duplicate file detected`);
      return next(new ApiError(409, 'UPLOAD_DUPLICATE_FILE', `Duplicate file detected! This exact file was already uploaded as "${duplicate.title}" on ${new Date(duplicate.createdAt).toLocaleDateString()}.`));
    }

    const docProfile = req.user.role === 'doctor' ? db.getDoctors().find(d => d.userId === req.user.id) : null;

    const newRecord: MedicalRecord = {
      id: generateId('REC-'),
      patientId: finalPatientId,
      uploadedByUserId: req.user.id,
      uploadedByRole: req.user.role,
      uploadedByName: req.user.name,
      uploadedByHospitalId: docProfile?.hospitalId,
      title,
      description: description || '',
      category,
      fileName: sanitizedFileName,
      fileSize: fileSize || 'Unknown Size',
      fileContent,
      fileHash,
      isSensitive: !!isSensitive,
      createdAt: new Date().toISOString(),
      trustBadge: (req.user.role === 'doctor' && docProfile?.isVerified) ? 'verified_hospital' : 'patient_direct'
    };

    db.addMedicalRecord(newRecord);

    // Audit Log
    db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD', `Resource ID: ${newRecord.id} | IP: ${req.ip} | Result: Success | Uploaded record: "${title}" for patient ${finalPatientId}`);

    // Notification to Patient if uploaded by Doctor
    if (req.user.role === 'doctor') {
      const patUser = db.getPatients().find(p => p.patientId === finalPatientId);
      if (patUser) {
        db.addNotification({
          id: generateId('NOT-'),
          userId: patUser.userId,
          title: 'New Medical Record Uploaded',
          message: `Dr. ${req.user.name} uploaded a new record "${title}" to your timeline.`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    res.status(201).json(newRecord);
  } catch (err: any) {
    next(err);
  }
});

// Delete Record
app.delete('/api/patient/delete-record/:id', authenticateToken, requireRole(['patient']), (req: any, res) => {
  try {
    const recordId = req.params.id;
    const record = db.getMedicalRecords().find(r => r.id === recordId);

    if (!record) {
      db.addAuditLog(req.user.id, req.user.name, 'patient', 'RECORD_DELETE_FAIL', `Resource ID: ${recordId} | IP: ${req.ip} | Result: Failure | Error: Record not found`);
      return res.status(404).json({ error: 'Record not found' });
    }

    // Patient can only delete their own records
    const patient = db.getPatients().find(p => p.userId === req.user.id);
    if (!patient || record.patientId !== patient.patientId) {
      db.addAuditLog(req.user.id, req.user.name, 'patient', 'RECORD_DELETE_FAIL', `Resource ID: ${recordId} | IP: ${req.ip} | Result: Failure | Error: Unauthorized to delete this record`);
      return res.status(403).json({ error: 'Unauthorized to delete this record' });
    }

    db.deleteMedicalRecord(recordId);

    // Audit Log
    db.addAuditLog(req.user.id, req.user.name, 'patient', 'RECORD_DELETE', `Resource ID: ${recordId} | IP: ${req.ip} | Result: Success | Deleted record: "${record.title}"`);

    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err: any) {
    db.addAuditLog(req.user.id, req.user.name, 'patient', 'RECORD_DELETE_FAIL', `Resource ID: ${req.params.id} | IP: ${req.ip} | Result: Failure | Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Respond to access request (Approve / Reject)
app.post('/api/patient/respond-access/:id', authenticateToken, requireRole(['patient']), (req: any, res, next) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      db.addAuditLog(req.user.id, req.user.name, 'patient', 'ACCESS_RESPONSE_FAIL', `Resource ID: ${requestId} | IP: ${req.ip} | Result: Failure | Error: Invalid status response`);
      return next(new ApiError(400, 'BAD_REQUEST', 'Invalid status response'));
    }

    const request = db.getAccessRequests().find(r => r.id === requestId);
    if (!request) {
      db.addAuditLog(req.user.id, req.user.name, 'patient', 'ACCESS_RESPONSE_FAIL', `Resource ID: ${requestId} | IP: ${req.ip} | Result: Failure | Error: Access request not found`);
      return next(new ApiError(404, 'ACCESS_REQUEST_NOT_FOUND', 'Access request not found'));
    }

    const patient = db.getPatients().find(p => p.userId === req.user.id);
    if (!patient || request.patientId !== patient.patientId) {
      db.addAuditLog(req.user.id, req.user.name, 'patient', 'ACCESS_RESPONSE_FAIL', `Resource ID: ${requestId} | IP: ${req.ip} | Result: Failure | Error: Unauthorized to respond to this request`);
      return next(new ApiError(403, 'ACCESS_REQUEST_DENIED', 'Unauthorized to respond to this request'));
    }

    const updated = db.updateAccessRequest(requestId, status);

    // Audit Log
    db.addAuditLog(
      req.user.id,
      req.user.name,
      'patient',
      status === 'approved' ? 'ACCESS_APPROVE' : 'ACCESS_REJECT',
      `Resource ID: ${requestId} | IP: ${req.ip} | Result: Success | Responded ${status} to Dr. ${request.doctorName} for record: "${request.recordTitle || 'All Records'}"`
    );

    // Notification to Doctor
    db.addNotification({
      id: generateId('NOT-'),
      userId: request.doctorId,
      title: `Access Request ${status.toUpperCase()}`,
      message: `Patient ${req.user.name} has ${status} your access request to view "${request.recordTitle || 'All Records'}".`,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (err: any) {
    db.addAuditLog(req.user.id, req.user.name, 'patient', 'ACCESS_RESPONSE_FAIL', `Resource ID: ${req.params.id} | IP: ${req.ip} | Result: Failure | Error: ${err.message}`);
    next(err);
  }
});

// Get Access History for Patient
app.get('/api/patient/access-history', authenticateToken, requireRole(['patient']), (req: any, res, next) => {
  try {
    const patient = db.getPatients().find(p => p.userId === req.user.id);
    if (!patient) {
      return next(new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient not found'));
    }

    const requests = db.getAccessRequests().filter(r => r.patientId === patient.patientId);
    res.json(requests);
  } catch (err: any) {
    next(err);
  }
});

// Emergency Profile endpoint (Accessible without login to save lives, but only basic info!)
app.get('/api/patient/emergency-profile/:patientId', (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    const patient = db.getPatients().find(p => p.patientId.toUpperCase() === (patientId || '').trim().toUpperCase());

    if (!patient) {
      return next(new ApiError(404, 'PATIENT_NOT_FOUND', 'Emergency profile not found'));
    }

    const user = db.getUsers().find(u => u.id === patient.userId);
    if (!user) {
      return next(new ApiError(404, 'USER_NOT_FOUND', 'Patient user account not found'));
    }

    res.json({
      patientId: patient.patientId,
      name: user.name,
      dob: patient.dob,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      allergies: patient.allergies,
      chronicDiseases: patient.chronicDiseases,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      emergencyContactRelation: patient.emergencyContactRelation
    });
  } catch (err: any) {
    next(err);
  }
});

// Notifications List
app.get('/api/patient/notifications', authenticateToken, (req: any, res, next) => {
  try {
    const notifications = db.getNotifications().filter(n => n.userId === req.user.id);
    res.json(notifications);
  } catch (err: any) {
    next(err);
  }
});

// Mark Notification as read
app.post('/api/patient/notifications/read/:id', authenticateToken, (req: any, res, next) => {
  try {
    const notifId = req.params.id;
    const notif = db.getNotifications().find(n => n.id === notifId);
    if (!notif) {
      db.addAuditLog(req.user.id, req.user.name, req.user.role, 'NOTIFICATION_READ_FAIL', `Resource ID: ${notifId} | IP: ${req.ip} | Result: Failure | Error: Notification not found`);
      return next(new ApiError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found'));
    }
    if (notif.userId !== req.user.id) {
      db.addAuditLog(req.user.id, req.user.name, req.user.role, 'NOTIFICATION_READ_FAIL', `Resource ID: ${notifId} | IP: ${req.ip} | Result: Failure | Error: Unauthorized to read this notification`);
      return next(new ApiError(403, 'ACCESS_REQUEST_DENIED', 'Unauthorized to access this notification'));
    }
    db.markNotificationAsRead(notifId);
    db.addAuditLog(req.user.id, req.user.name, req.user.role, 'NOTIFICATION_READ', `Resource ID: ${notifId} | IP: ${req.ip} | Result: Success | Marked notification read`);
    res.json({ success: true });
  } catch (err: any) {
    db.addAuditLog(req.user.id, req.user.name, req.user.role, 'NOTIFICATION_READ_FAIL', `Resource ID: ${req.params.id} | IP: ${req.ip} | Result: Failure | Error: ${err.message}`);
    next(err);
  }
});

// Mark all Notifications as read
app.post('/api/patient/notifications/read-all', authenticateToken, (req: any, res, next) => {
  try {
    db.markAllNotificationsAsRead(req.user.id);
    res.json({ success: true });
  } catch (err: any) {
    next(err);
  }
});


// --- DOCTOR ROUTES ---

// Doctor Dashboard Data
app.get('/api/doctor/dashboard', authenticateToken, requireRole(['doctor']), (req: any, res, next) => {
  try {
    const doctor = db.getDoctors().find(d => d.userId === req.user.id);
    if (!doctor) {
      return next(new ApiError(404, 'DOCTOR_NOT_FOUND', 'Doctor profile not found'));
    }

    // Doctor details from User
    const user = db.getUsers().find(u => u.id === req.user.id);

    // Doctor gets stats
    const pendingRequests = db.getAccessRequests().filter(r => r.doctorId === req.user.id && r.status === 'pending');
    
    // Calculate active approved requests (checking 24-hour expiry!)
    const activeApprovedRequests = db.getAccessRequests().filter(
      r => r.doctorId === req.user.id && 
           r.status === 'approved' && 
           r.respondedAt && (Date.now() - new Date(r.respondedAt).getTime() < 24 * 60 * 60 * 1000)
    );

    const pastRequests = db.getAccessRequests().filter(r => r.doctorId === req.user.id && r.status !== 'pending');
    const recentPrescriptions = db.getPrescriptions().filter(p => p.doctorId === req.user.id).slice(0, 10);

    // Calculate unique patients viewed/accessed
    const doctorPrescriptions = db.getPrescriptions().filter(p => p.doctorId === req.user.id);
    const doctorRequests = db.getAccessRequests().filter(r => r.doctorId === req.user.id);
    const searchLogs = db.getAuditLogs().filter(l => l.userId === req.user.id && l.action === 'PATIENT_SEARCH');
    
    const viewedPatientIds = new Set<string>();
    doctorPrescriptions.forEach(p => viewedPatientIds.add(p.patientId.toUpperCase()));
    doctorRequests.forEach(r => viewedPatientIds.add(r.patientId.toUpperCase()));
    searchLogs.forEach(l => {
      const match = l.details.match(/PAT-\d+/i);
      if (match) viewedPatientIds.add(match[0].toUpperCase());
    });
    
    const totalPatientsViewed = viewedPatientIds.size;

    // Calculate today's prescriptions
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayPrescriptions = db.getPrescriptions().filter(
      p => p.doctorId === req.user.id && p.createdAt.startsWith(todayStr)
    );

    // Recent doctor-specific activities from audit logs
    const recentActivity = db.getAuditLogs().filter(
      l => l.userId === req.user.id
    ).reverse().slice(0, 15);

    // Directory of all patients
    const allPatients = db.getPatients().map(p => {
      const u = db.getUsers().find(userObj => userObj.id === p.userId);
      // Find last visit by checking reports and prescriptions
      const patientRecords = db.getMedicalRecords().filter(r => r.patientId === p.patientId);
      const patientPrescriptions = db.getPrescriptions().filter(prsc => prsc.patientId === p.patientId);
      
      let lastVisit = 'No visits yet';
      const dates = [
        ...patientRecords.map(r => r.createdAt),
        ...patientPrescriptions.map(prsc => prsc.createdAt)
      ].sort();
      
      if (dates.length > 0) {
        lastVisit = new Date(dates[dates.length - 1]).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }

      return {
        patientId: p.patientId,
        name: u?.name || 'Patient',
        email: u?.email || 'N/A',
        age: p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : 'N/A',
        gender: p.gender || 'N/A',
        bloodGroup: p.bloodGroup || 'N/A',
        phone: p.phone || p.emergencyContactPhone || 'N/A',
        dob: p.dob || 'N/A',
        allergies: p.allergies || 'None',
        chronicDiseases: p.chronicDiseases || 'None',
        lastVisit
      };
    });

    res.json({
      doctor: {
        ...doctor,
        name: user?.name || req.user.name,
        email: user?.email || req.user.email
      },
      stats: {
        totalPatientsViewed,
        pendingAccessRequests: pendingRequests.length,
        approvedAccessRequests: activeApprovedRequests.length,
        todayPrescriptions: todayPrescriptions.length,
        recentActivity
      },
      pendingRequests,
      pastRequests,
      recentPrescriptions,
      allPatients
    });
  } catch (err: any) {
    next(err);
  }
});

// Update Doctor Profile
app.put('/api/doctor/profile', authenticateToken, requireRole(['doctor']), (req: any, res, next) => {
  try {
    const { name, phone, profilePicture, about, experience, department, specialization } = req.body;

    const doctor = db.getDoctors().find(d => d.userId === req.user.id);
    if (!doctor) {
      return next(new ApiError(404, 'DOCTOR_NOT_FOUND', 'Doctor profile not found'));
    }

    // Update User Name if modified
    if (name) {
      db.updateUser(req.user.id, { name });
    }

    // Update Doctor record
    const updated = db.updateDoctor(req.user.id, {
      phone: phone !== undefined ? phone : doctor.phone,
      profilePicture: profilePicture !== undefined ? profilePicture : doctor.profilePicture,
      about: about !== undefined ? about : doctor.about,
      experience: experience !== undefined ? experience : doctor.experience,
      department: department !== undefined ? department : doctor.department,
      specialization: specialization !== undefined ? specialization : doctor.specialization
    });

    db.addAuditLog(req.user.id, name || req.user.name, 'doctor', 'PROFILE_UPDATE', 'Updated doctor details');

    res.json({ success: true, doctor: updated });
  } catch (err: any) {
    next(err);
  }
});

// Custom Log Action Endpoint (For UI audits)
app.post('/api/audit/log-action', authenticateToken, (req: any, res, next) => {
  try {
    const { action, details } = req.body;
    if (!action || !details) {
      return next(new ApiError(400, 'BAD_REQUEST', 'Action and details are required'));
    }
    db.addAuditLog(req.user.id, req.user.name, req.user.role, action, details);
    res.json({ success: true });
  } catch (err: any) {
    next(err);
  }
});

// Search Patient by Patient ID, Name, or Mobile Number
app.post('/api/doctor/search-patient', authenticateToken, requireRole(['doctor']), (req: any, res, next) => {
  try {
    const { patientId, query } = req.body;
    const searchQuery = (query || patientId || '').trim();

    // 1. Doctor Verification Check
    const doctorProfile = db.getDoctors().find(d => d.userId === req.user.id);
    if (!doctorProfile || !doctorProfile.isVerified) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PATIENT_SEARCH_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Doctor account is pending verification`);
      return next(new ApiError(403, 'UNAUTHORIZED_DOCTOR', 'Doctor account is pending verification'));
    }

    if (!searchQuery) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PATIENT_SEARCH_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Search query is empty`);
      return next(new ApiError(400, 'BAD_REQUEST', 'Please enter a Patient ID, Name, or Mobile Number'));
    }

    const allPatients = db.getPatients();
    const allUsers = db.getUsers();

    // Matching:
    // 1. Patient ID (exact or partial case-insensitive)
    // 2. Patient Name (partial case-insensitive)
    // 3. Mobile Number (patient phone or emergency contact phone)
    const matchedPatients = allPatients.filter(p => {
      const user = allUsers.find(u => u.id === p.userId);
      const nameMatches = user ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const idMatches = p.patientId.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatches = (p.phone || '').includes(searchQuery) || 
                           (p.emergencyContactPhone || '').includes(searchQuery);
      return idMatches || nameMatches || phoneMatches;
    });

    if (matchedPatients.length === 0) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PATIENT_SEARCH_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: No patients found matching query "${searchQuery}"`);
      return next(new ApiError(404, 'PATIENT_NOT_FOUND', 'No patients found matching your search query'));
    }

    // If an exact Patient ID match exists, let's treat that as the primary selected patient (for backward compatibility!)
    const exactPatient = matchedPatients.find(p => p.patientId.toUpperCase() === searchQuery.toUpperCase()) || matchedPatients[0];

    const user = db.getUsers().find(u => u.id === exactPatient.userId);
    if (!user) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PATIENT_SEARCH_FAIL', `Resource ID: ${exactPatient.patientId} | IP: ${req.ip} | Result: Failure | Error: Patient account details not found`);
      return next(new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient account details not found'));
    }

    // Get medical records: Non-sensitive are accessible directly; sensitive are privacy-locked
    const allRecords = db.getMedicalRecords().filter(r => r.patientId === exactPatient.patientId);
    
    // Check which sensitive records the doctor has active approved access for (enforcing 24-hour expiry!)
    const approvedAccessRequests = db.getAccessRequests().filter(
      r => r.patientId === exactPatient.patientId && 
           r.doctorId === req.user.id && 
           r.status === 'approved' &&
           r.respondedAt && (Date.now() - new Date(r.respondedAt).getTime() < 24 * 60 * 60 * 1000)
    );

    const allowedRecordIds = new Set(approvedAccessRequests.map(r => r.recordId).filter(Boolean));

    // Map records, obscuring content for locked records
    const accessibleRecords = allRecords.map(rec => {
      const hasAccess = !rec.isSensitive || allowedRecordIds.has(rec.id);
      return {
        id: rec.id,
        patientId: rec.patientId,
        uploadedByName: rec.uploadedByName,
        uploadedByRole: rec.uploadedByRole,
        title: rec.title,
        description: hasAccess ? rec.description : '[SENSITIVE REPORT: PRIVACY LOCKED]',
        category: rec.category,
        fileName: hasAccess ? rec.fileName : 'Privacy Locked',
        fileSize: rec.fileSize,
        isSensitive: rec.isSensitive,
        createdAt: rec.createdAt,
        trustBadge: rec.trustBadge,
        isLocked: !hasAccess,
        // Send actual content only if has access
        fileContent: hasAccess ? rec.fileContent : null
      };
    });

    const prescriptions = db.getPrescriptions().filter(prsc => prsc.patientId === exactPatient.patientId);

    // Log the search action
    db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PATIENT_SEARCH', `Resource ID: ${exactPatient.patientId} | IP: ${req.ip} | Result: Success | Searched query: "${searchQuery}"`);

    // Prepare search results
    const results = matchedPatients.map(p => {
      const u = allUsers.find(userObj => userObj.id === p.userId);
      // Find last visit
      const patientRecords = db.getMedicalRecords().filter(r => r.patientId === p.patientId);
      const patientPrescriptions = db.getPrescriptions().filter(prsc => prsc.patientId === p.patientId);
      let lastVisit = 'No visits yet';
      const dates = [
        ...patientRecords.map(r => r.createdAt),
        ...patientPrescriptions.map(prsc => prsc.createdAt)
      ].sort();
      if (dates.length > 0) {
        lastVisit = new Date(dates[dates.length - 1]).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }

      return {
        patientId: p.patientId,
        name: u?.name || 'Patient',
        age: p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : 'N/A',
        gender: p.gender || 'N/A',
        bloodGroup: p.bloodGroup || 'N/A',
        phone: p.phone || p.emergencyContactPhone || 'N/A',
        dob: p.dob || 'N/A',
        lastVisit
      };
    });

    res.json({
      patient: {
        patientId: exactPatient.patientId,
        name: user.name,
        dob: exactPatient.dob,
        gender: exactPatient.gender,
        bloodGroup: exactPatient.bloodGroup,
        allergies: exactPatient.allergies,
        chronicDiseases: exactPatient.chronicDiseases,
        emergencyContactName: exactPatient.emergencyContactName,
        emergencyContactPhone: exactPatient.emergencyContactPhone,
        emergencyContactRelation: exactPatient.emergencyContactRelation,
        phone: exactPatient.phone,
        height: exactPatient.height,
        weight: exactPatient.weight,
        currentMedications: exactPatient.currentMedications
      },
      records: accessibleRecords,
      prescriptions,
      matchedResults: results
    });
  } catch (err: any) {
    db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PATIENT_SEARCH_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: ${err.message}`);
    next(err);
  }
});

// Request access to sensitive record
app.post('/api/doctor/request-access', authenticateToken, requireRole(['doctor']), (req: any, res, next) => {
  try {
    const { patientId, recordId } = req.body;

    // 1. Doctor Verification Check
    const doctorProfile = db.getDoctors().find(d => d.userId === req.user.id);
    if (!doctorProfile || !doctorProfile.isVerified) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'ACCESS_REQUEST_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Doctor account is pending verification`);
      return next(new ApiError(403, 'UNAUTHORIZED_DOCTOR', 'Doctor account is pending verification'));
    }

    if (!patientId || !recordId) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'ACCESS_REQUEST_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Patient ID and Record ID are required`);
      return next(new ApiError(400, 'BAD_REQUEST', 'Patient ID and Record ID are required'));
    }

    const patient = db.getPatients().find(p => p.patientId === patientId);
    if (!patient) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'ACCESS_REQUEST_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Patient not found`);
      return next(new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient not found'));
    }

    const record = db.getMedicalRecords().find(r => r.id === recordId);
    if (!record) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'ACCESS_REQUEST_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Record not found`);
      return next(new ApiError(404, 'RECORD_NOT_FOUND', 'Record not found'));
    }

    // 2. Resource Alignment check (prevent requesting access for Patient B's file mapped to Patient A)
    if (record.patientId !== patient.patientId) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'ACCESS_REQUEST_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Record ownership mismatch`);
      return next(new ApiError(400, 'ACCESS_REQUEST_DENIED', 'Security violation: Record ownership mismatch'));
    }

    // Check if an active request already exists
    const existing = db.getAccessRequests().find(
      r => r.patientId === patientId && r.doctorId === req.user.id && r.recordId === recordId && r.status === 'pending'
    );

    if (existing) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'ACCESS_REQUEST_FAIL', `Resource ID: ${existing.id} | IP: ${req.ip} | Result: Failure | Error: Access request is already pending`);
      return next(new ApiError(400, 'ACCESS_ALREADY_GRANTED', 'An access request is already pending for this record'));
    }

    const newRequest: AccessRequest = {
      id: generateId('REQ-'),
      patientId,
      doctorId: req.user.id,
      doctorName: req.user.name,
      doctorSpecialization: doctorProfile.specialization || 'General Practitioner',
      hospitalName: doctorProfile.hospitalName || 'Health Center',
      recordId,
      recordTitle: record.title,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    db.addAccessRequest(newRequest);

    // Audit Log
    db.addAuditLog(req.user.id, req.user.name, 'doctor', 'ACCESS_REQUEST', `Resource ID: ${newRequest.id} | IP: ${req.ip} | Result: Success | Requested access to record: "${record.title}" for patient ${patientId}`);

    // Create Notification for Patient
    db.addNotification({
      id: generateId('NOT-'),
      userId: patient.userId,
      title: 'Privacy Unlock Request',
      message: `Dr. ${req.user.name} at ${doctorProfile.hospitalName} requested permission to view sensitive report: "${record.title}".`,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(newRequest);
  } catch (err: any) {
    next(err);
  }
});

// Add Diagnosis & Prescription
app.post('/api/doctor/add-prescription', authenticateToken, requireRole(['doctor']), (req: any, res, next) => {
  try {
    const { patientId, diagnosis, medications } = req.body;

    // 1. Doctor Verification Check
    const doctorProfile = db.getDoctors().find(d => d.userId === req.user.id);
    if (!doctorProfile || !doctorProfile.isVerified) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PRESCRIPTION_ADD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Doctor account is pending verification`);
      return next(new ApiError(403, 'UNAUTHORIZED_DOCTOR', 'Doctor account is pending verification'));
    }

    if (!patientId || !diagnosis || !medications || !Array.isArray(medications)) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PRESCRIPTION_ADD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Missing required fields`);
      return next(new ApiError(400, 'BAD_REQUEST', 'Patient ID, diagnosis, and medications array are required'));
    }

    const patient = db.getPatients().find(p => p.patientId === patientId);
    if (!patient) {
      db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PRESCRIPTION_ADD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Patient not found`);
      return next(new ApiError(404, 'PATIENT_NOT_FOUND', 'Patient not found'));
    }

    const newPrescription: Prescription = {
      id: generateId('PRSC-'),
      patientId,
      doctorId: req.user.id,
      doctorName: req.user.name,
      hospitalName: doctorProfile.hospitalName || 'Health Center',
      diagnosis,
      medications,
      createdAt: new Date().toISOString()
    };

    db.addPrescription(newPrescription);

    // Audit Log
    db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PRESCRIPTION_ADD', `Resource ID: ${newPrescription.id} | IP: ${req.ip} | Result: Success | Added diagnosis & prescription for patient ${patientId}`);

    // Notify Patient
    db.addNotification({
      id: generateId('NOT-'),
      userId: patient.userId,
      title: 'New Prescription Added',
      message: `Dr. ${req.user.name} added a prescription for "${diagnosis}".`,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(newPrescription);
  } catch (err: any) {
    db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PRESCRIPTION_ADD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: ${err.message}`);
    next(err);
  }
});


// --- ADMIN ROUTES ---

// Admin Dashboard Data
app.get('/api/admin/dashboard', authenticateToken, requireRole(['admin']), (req: any, res, next) => {
  try {
    const doctors = db.getDoctors();
    const patients = db.getPatients();
    const users = db.getUsers();
    const requests = db.getAccessRequests();
    const auditLogs = db.getAuditLogs().slice(0, 30);
    const hospitals = db.getHospitals();

    res.json({
      doctors,
      patients,
      users: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })),
      requests,
      auditLogs,
      hospitals
    });
  } catch (err: any) {
    next(err);
  }
});

// Verify Doctor Accounts
app.post('/api/admin/verify-doctor/:userId', authenticateToken, requireRole(['admin']), (req: any, res, next) => {
  try {
    const { userId } = req.params;
    const { verify } = req.body; // true or false

    const doc = db.getDoctors().find(d => d.userId === userId);
    if (!doc) {
      db.addAuditLog(req.user.id, req.user.name, 'admin', 'DOCTOR_VERIFY_FAIL', `Resource ID: ${userId} | IP: ${req.ip} | Result: Failure | Error: Doctor profile not found`);
      return next(new ApiError(404, 'DOCTOR_NOT_FOUND', 'Doctor not found'));
    }

    const user = db.getUsers().find(u => u.id === userId);
    const doctorName = user ? user.name : 'Unknown';

    db.updateDoctorVerification(userId, !!verify);

    // Audit Log
    db.addAuditLog(
      req.user.id,
      req.user.name,
      'admin',
      verify ? 'DOCTOR_VERIFY' : 'DOCTOR_REVOKE',
      `Resource ID: ${userId} | IP: ${req.ip} | Result: Success | ${verify ? 'Verified' : 'Revoked verification for'} Dr. ${doctorName}`
    );

    // Notify Doctor
    db.addNotification({
      id: generateId('NOT-'),
      userId,
      title: verify ? 'Account Verified!' : 'Verification Suspended',
      message: verify
        ? 'Your professional doctor account has been verified by the administrator. You can now access full features.'
        : 'Your verified status has been temporarily suspended by the administrator.',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, verified: !!verify });
  } catch (err: any) {
    db.addAuditLog(req.user.id, req.user.name, 'admin', 'DOCTOR_VERIFY_FAIL', `Resource ID: ${req.params.userId} | IP: ${req.ip} | Result: Failure | Error: ${err.message}`);
    next(err);
  }
});


// Add Hospital
app.post('/api/admin/add-hospital', authenticateToken, requireRole(['admin']), (req: any, res, next) => {
  try {
    const { name, address } = req.body;
    if (!name || !address) {
      db.addAuditLog(req.user.id, req.user.name, 'admin', 'HOSPITAL_ADD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: Missing required fields`);
      return next(new ApiError(400, 'BAD_REQUEST', 'Hospital name and address are required'));
    }

    const id = generateId('HOSP-');
    const newHospital = { id, name, address, verified: true };
    db.addHospital(newHospital);

    // Audit Log
    db.addAuditLog(req.user.id, req.user.name, 'admin', 'HOSPITAL_ADD', `Resource ID: ${id} | IP: ${req.ip} | Result: Success | Added verified partner hospital: ${name}`);

    res.status(201).json(newHospital);
  } catch (err: any) {
    db.addAuditLog(req.user.id, req.user.name, 'admin', 'HOSPITAL_ADD_FAIL', `Resource ID: N/A | IP: ${req.ip} | Result: Failure | Error: ${err.message}`);
    next(err);
  }
});


// Centralized Express Error Middleware
app.use((err: any, req: any, res: any, next: any) => {
  const errorId = 'ERR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const userId = req.user?.id || 'anonymous';
  const userRole = req.user?.role || 'none';
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // 1. Structured Logging internally (never output raw stack trace to user)
  console.error(`[${new Date().toISOString()}] [ERROR] [${errorId}] - ${req.method} ${req.originalUrl} - Status: ${statusCode} - Code: ${code} - User: ${userId} (${userRole}) - IP: ${ip} - Error:`, err);

  // 2. Client-Safe standardized JSON response (with root-level string fallback for backward compatibility)
  res.status(statusCode).json({
    error: statusCode === 500 
      ? `An unexpected error occurred. Please try again. (Error ID: ${errorId})` 
      : message,
    errorDetails: {
      id: errorId,
      code,
      message: statusCode === 500 ? 'An unexpected internal error occurred' : message,
      statusCode
    }
  });
});

// --- INTEGRATING VITE DEV SERVER / PRODUCTION SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom',
      });
      app.use(vite.middlewares);
      app.use('*', async (req, res, next) => {
        const url = req.originalUrl;
        try {
          let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e: any) {
          vite.ssrFixStacktrace(e);
          next(e);
        }
      });
      console.log('Vite loaded programmatically in development mode');
    } catch (e) {
      console.error('Failed to import Vite, starting standard API server only', e);
    }
  } else {
    // Production
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Interoperable Healthcare Record Management System (SIHRMS) running on port ${PORT}`);
  });
}

import fs from 'fs';
startServer();
