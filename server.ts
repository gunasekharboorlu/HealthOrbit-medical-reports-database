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
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, role, name, extraData } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const users = db.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter (A-Z)' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase letter (a-z)' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number (0-9)' });
    }
    if (!/[!@#$%^&*()]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one special character (!@#$%^&*())' });
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
      db.addAuditLog(userId, name, 'patient', 'PATIENT_REGISTER', `Patient registered with ID ${patientId}`);

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
      db.addAuditLog(userId, name, 'doctor', 'DOCTOR_REGISTER', `Doctor registered with license ${newDoctor.licenseNumber}. Pending verification.`);

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
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
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
    res.status(500).json({ error: err.message });
  }
});

// Me Profile
app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const user = db.getUsers().find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
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
});

// --- PATIENT ROUTES ---

// Patient Dashboard State
app.get('/api/patient/dashboard', authenticateToken, requireRole(['patient']), (req: any, res) => {
  const patient = db.getPatients().find(p => p.userId === req.user.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient profile not found' });
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
});

// Update Profile
app.put('/api/patient/profile', authenticateToken, requireRole(['patient']), (req: any, res) => {
  try {
    const { dob, gender, bloodGroup, allergies, chronicDiseases, emergencyContactName, emergencyContactPhone, emergencyContactRelation } = req.body;

    const patient = db.getPatients().find(p => p.userId === req.user.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
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
    res.status(500).json({ error: err.message });
  }
});

// Upload Medical Record
app.post('/api/patient/upload-record', authenticateToken, requireRole(['patient', 'doctor']), (req: any, res) => {
  try {
    const { title, description, category, fileName, fileSize, fileContent, isSensitive, targetPatientId } = req.body;

    if (!title || !category || !fileName || !fileContent) {
      return res.status(400).json({ error: 'Title, category, filename, and file are required' });
    }

    let finalPatientId = '';
    if (req.user.role === 'patient') {
      const patient = db.getPatients().find(p => p.userId === req.user.id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }
      finalPatientId = patient.patientId;
    } else {
      // Doctor uploading for patient
      if (!targetPatientId) {
        return res.status(400).json({ error: 'Patient ID is required for medical uploads' });
      }
      const patient = db.getPatients().find(p => p.patientId === targetPatientId);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      finalPatientId = targetPatientId;
    }

    const fileHash = computeHash(fileContent);

    // 4. Duplicate Record Detection
    const existingRecords = db.getMedicalRecords().filter(r => r.patientId === finalPatientId);
    const duplicate = existingRecords.find(r => r.fileHash === fileHash);

    if (duplicate) {
      return res.status(409).json({
        error: 'Duplicate file detected!',
        message: `This exact file was already uploaded as "${duplicate.title}" on ${new Date(duplicate.createdAt).toLocaleDateString()}.`
      });
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
      fileName,
      fileSize: fileSize || 'Unknown Size',
      fileContent,
      fileHash,
      isSensitive: !!isSensitive,
      createdAt: new Date().toISOString(),
      trustBadge: (req.user.role === 'doctor' && docProfile?.isVerified) ? 'verified_hospital' : 'patient_direct'
    };

    db.addMedicalRecord(newRecord);

    // Audit Log
    db.addAuditLog(req.user.id, req.user.name, req.user.role, 'RECORD_UPLOAD', `Uploaded record: "${title}" for patient ${finalPatientId}`);

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
    res.status(500).json({ error: err.message });
  }
});

// Delete Record
app.delete('/api/patient/delete-record/:id', authenticateToken, requireRole(['patient']), (req: any, res) => {
  try {
    const recordId = req.params.id;
    const record = db.getMedicalRecords().find(r => r.id === recordId);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Patient can only delete their own records
    const patient = db.getPatients().find(p => p.userId === req.user.id);
    if (!patient || record.patientId !== patient.patientId) {
      return res.status(403).json({ error: 'Unauthorized to delete this record' });
    }

    db.deleteMedicalRecord(recordId);

    // Audit Log
    db.addAuditLog(req.user.id, req.user.name, 'patient', 'RECORD_DELETE', `Deleted record: "${record.title}"`);

    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Respond to access request (Approve / Reject)
app.post('/api/patient/respond-access/:id', authenticateToken, requireRole(['patient']), (req: any, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status response' });
    }

    const request = db.getAccessRequests().find(r => r.id === requestId);
    if (!request) {
      return res.status(404).json({ error: 'Access request not found' });
    }

    const patient = db.getPatients().find(p => p.userId === req.user.id);
    if (!patient || request.patientId !== patient.patientId) {
      return res.status(403).json({ error: 'Unauthorized to respond to this request' });
    }

    const updated = db.updateAccessRequest(requestId, status);

    // Audit Log
    db.addAuditLog(
      req.user.id,
      req.user.name,
      'patient',
      status === 'approved' ? 'ACCESS_APPROVE' : 'ACCESS_REJECT',
      `Responded to access request from Dr. ${request.doctorName} for record: "${request.recordTitle || 'All Records'}"`
    );

    // Notification to Doctor
    db.addNotification({
      id: generateId('NOT-'),
      userId: request.doctorId,
      title: `Access Request ${status.toUpperCase()}`,
      message: `Patient John Doe has ${status} your access request to view "${request.recordTitle || 'All Records'}".`,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Access History for Patient
app.get('/api/patient/access-history', authenticateToken, requireRole(['patient']), (req: any, res) => {
  const patient = db.getPatients().find(p => p.userId === req.user.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const requests = db.getAccessRequests().filter(r => r.patientId === patient.patientId);
  res.json(requests);
});

// Emergency Profile endpoint (Accessible without login to save lives, but only basic info!)
app.get('/api/patient/emergency-profile/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  const patient = db.getPatients().find(p => p.patientId === patientId);

  if (!patient) {
    return res.status(404).json({ error: 'Emergency profile not found' });
  }

  const user = db.getUsers().find(u => u.id === patient.userId);
  if (!user) {
    return res.status(404).json({ error: 'Patient user account not found' });
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
});

// Notifications List
app.get('/api/patient/notifications', authenticateToken, (req: any, res) => {
  const notifications = db.getNotifications().filter(n => n.userId === req.user.id);
  res.json(notifications);
});

// Mark Notification as read
app.post('/api/patient/notifications/read/:id', authenticateToken, (req: any, res) => {
  const success = db.markNotificationAsRead(req.params.id);
  res.json({ success });
});

// Mark all Notifications as read
app.post('/api/patient/notifications/read-all', authenticateToken, (req: any, res) => {
  db.markAllNotificationsAsRead(req.user.id);
  res.json({ success: true });
});


// --- DOCTOR ROUTES ---

// Doctor Dashboard Data
app.get('/api/doctor/dashboard', authenticateToken, requireRole(['doctor']), (req: any, res) => {
  const doctor = db.getDoctors().find(d => d.userId === req.user.id);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor profile not found' });
  }

  // Doctor gets stats
  const pendingRequests = db.getAccessRequests().filter(r => r.doctorId === req.user.id && r.status === 'pending');
  const pastRequests = db.getAccessRequests().filter(r => r.doctorId === req.user.id && r.status !== 'pending');
  const recentPrescriptions = db.getPrescriptions().filter(p => p.doctorId === req.user.id).slice(0, 10);

  res.json({
    doctor,
    pendingRequests,
    pastRequests,
    recentPrescriptions
  });
});

// Search Patient by Patient ID
app.post('/api/doctor/search-patient', authenticateToken, requireRole(['doctor']), (req: any, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    const patient = db.getPatients().find(p => p.patientId.toUpperCase() === patientId.toUpperCase());
    if (!patient) {
      return res.status(404).json({ error: 'No patient found with this ID' });
    }

    const user = db.getUsers().find(u => u.id === patient.userId);
    if (!user) {
      return res.status(404).json({ error: 'Patient account details not found' });
    }

    // Get medical records: Non-sensitive are accessible directly; sensitive are privacy-locked
    const allRecords = db.getMedicalRecords().filter(r => r.patientId === patient.patientId);
    
    // Check which sensitive records the doctor has active approved access for
    const approvedAccessRequests = db.getAccessRequests().filter(
      r => r.patientId === patient.patientId && r.doctorId === req.user.id && r.status === 'approved'
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

    const prescriptions = db.getPrescriptions().filter(prsc => prsc.patientId === patient.patientId);

    // Log the search
    db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PATIENT_SEARCH', `Searched for patient ${patientId}`);

    res.json({
      patient: {
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
      },
      records: accessibleRecords,
      prescriptions
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Request access to sensitive record
app.post('/api/doctor/request-access', authenticateToken, requireRole(['doctor']), (req: any, res) => {
  try {
    const { patientId, recordId } = req.body;

    if (!patientId || !recordId) {
      return res.status(400).json({ error: 'Patient ID and Record ID are required' });
    }

    const patient = db.getPatients().find(p => p.patientId === patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const record = db.getMedicalRecords().find(r => r.id === recordId);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Check if an active request already exists
    const existing = db.getAccessRequests().find(
      r => r.patientId === patientId && r.doctorId === req.user.id && r.recordId === recordId && r.status === 'pending'
    );

    if (existing) {
      return res.status(400).json({ error: 'An access request is already pending for this record' });
    }

    const doctorProfile = db.getDoctors().find(d => d.userId === req.user.id);

    const newRequest: AccessRequest = {
      id: generateId('REQ-'),
      patientId,
      doctorId: req.user.id,
      doctorName: req.user.name,
      doctorSpecialization: doctorProfile?.specialization || 'General Practitioner',
      hospitalName: doctorProfile?.hospitalName || 'Health Center',
      recordId,
      recordTitle: record.title,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    db.addAccessRequest(newRequest);

    // Audit Log
    db.addAuditLog(req.user.id, req.user.name, 'doctor', 'ACCESS_REQUEST', `Requested access to record: "${record.title}" for patient ${patientId}`);

    // Create Notification for Patient
    db.addNotification({
      id: generateId('NOT-'),
      userId: patient.userId,
      title: 'Privacy Unlock Request',
      message: `Dr. ${req.user.name} at ${doctorProfile?.hospitalName} requested permission to view sensitive report: "${record.title}".`,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(newRequest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add Diagnosis & Prescription
app.post('/api/doctor/add-prescription', authenticateToken, requireRole(['doctor']), (req: any, res) => {
  try {
    const { patientId, diagnosis, medications } = req.body;

    if (!patientId || !diagnosis || !medications || !Array.isArray(medications)) {
      return res.status(400).json({ error: 'Patient ID, diagnosis, and medications array are required' });
    }

    const patient = db.getPatients().find(p => p.patientId === patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const doctorProfile = db.getDoctors().find(d => d.userId === req.user.id);

    const newPrescription: Prescription = {
      id: generateId('PRSC-'),
      patientId,
      doctorId: req.user.id,
      doctorName: req.user.name,
      hospitalName: doctorProfile?.hospitalName || 'Health Center',
      diagnosis,
      medications,
      createdAt: new Date().toISOString()
    };

    db.addPrescription(newPrescription);

    // Audit Log
    db.addAuditLog(req.user.id, req.user.name, 'doctor', 'PRESCRIPTION_ADD', `Added diagnosis & prescription for patient ${patientId}`);

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
    res.status(500).json({ error: err.message });
  }
});


// --- ADMIN ROUTES ---

// Admin Dashboard Data
app.get('/api/admin/dashboard', authenticateToken, requireRole(['admin']), (req: any, res) => {
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
});

// Verify Doctor Accounts
app.post('/api/admin/verify-doctor/:userId', authenticateToken, requireRole(['admin']), (req: any, res) => {
  try {
    const { userId } = req.params;
    const { verify } = req.body; // true or false

    const doc = db.getDoctors().find(d => d.userId === userId);
    if (!doc) {
      return res.status(404).json({ error: 'Doctor not found' });
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
      `${verify ? 'Verified' : 'Revoked verification for'} Dr. ${doctorName}`
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
    res.status(500).json({ error: err.message });
  }
});


// Add Hospital
app.post('/api/admin/add-hospital', authenticateToken, requireRole(['admin']), (req: any, res) => {
  try {
    const { name, address } = req.body;
    if (!name || !address) {
      return res.status(400).json({ error: 'Hospital name and address are required' });
    }

    const id = generateId('HOSP-');
    const newHospital = { id, name, address, verified: true };
    db.addHospital(newHospital);

    // Audit Log
    db.addAuditLog(req.user.id, req.user.name, 'admin', 'HOSPITAL_ADD', `Added verified partner hospital: ${name}`);

    res.status(201).json(newHospital);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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
