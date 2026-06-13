import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore, collection, doc, addDoc, getDoc, getDocs, setDoc,
  updateDoc, query, where, orderBy, limit, onSnapshot, increment, serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-pray4me",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app, auth, db;
let isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  if (isDemoMode) {
    console.log("🕌 Pray4Me running in demo mode (no Firebase config). Using local storage.");
  }
} catch (e) {
  isDemoMode = true;
  console.log("🕌 Pray4Me running in demo mode. Using local storage.");
}

export { auth, db, isDemoMode };

// ============================================================
// DEMO MODE — local storage fallback
// ============================================================

const DEMO_STORAGE_KEY = 'pray4me_demo_data';
const DEMO_VERSION = 4; // bump to clear old cached data

function getDemoData() {
  const raw = localStorage.getItem(DEMO_STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed.__version === DEMO_VERSION) return parsed;
    // Version mismatch — clear stale data but preserve users
    const freshUsers = parsed.users || {};
    return { __version: DEMO_VERSION, users: freshUsers, duaRequests: [], duaMadeRecords: [] };
  }
  return { __version: DEMO_VERSION, users: {}, duaRequests: [], duaMadeRecords: [] };
}

function saveDemoData(data) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ ...data, __version: DEMO_VERSION }));
}

// Pre-seed some dua requests for demo
// holyOnly: true  → only people at holy sites can make dua
// holyOnly: false → anyone can make dua (default)
// holyDuasCount   → subset of duasMadeCount made specifically at holy sites
function seedDemoData(userId) {
  const data = getDemoData();
  if (data.duaRequests.length > 0) return;

  const now = Date.now();
  const seeds = [
    {
      id: 'seed1', requesterId: 'other1', requesterName: 'Ahmed', isAnonymous: false,
      category: 'health_and_healing', customText: 'My father has been ill for months. Please make dua that Allah grants him a full recovery and eases his pain.', suggestedDua: null,
      holyOnly: false, duasMadeCount: 3, holyDuasCount: 2,
      lastDuaMadeAt: null, createdAt: now - 86400000, isActive: true
    },
    {
      id: 'seed2', requesterId: 'other2', requesterName: 'Fatima', isAnonymous: false,
      category: 'forgiveness', customText: 'Please make dua that Allah forgives me and my parents. They are getting old and I want the best for them in the akhirah.', suggestedDua: null,
      holyOnly: false, duasMadeCount: 7, holyDuasCount: 4,
      lastDuaMadeAt: null, createdAt: now - 172800000, isActive: true
    },
    {
      id: 'seed3', requesterId: 'other3', requesterName: 'Omar', isAnonymous: true,
      category: 'guidance', customText: 'Please ask Allah to guide me back to the straight path. I have been struggling with my deen and feel lost.', suggestedDua: null,
      holyOnly: true, duasMadeCount: 5, holyDuasCount: 5,
      lastDuaMadeAt: null, createdAt: now - 43200000, isActive: true
    },
    {
      id: 'seed4', requesterId: 'other4', requesterName: 'Khadija', isAnonymous: false,
      category: 'marriage', customText: 'Please make dua that Allah blesses me with a righteous and kind spouse who will help me grow closer to Him. I have been waiting a long time.', suggestedDua: null,
      holyOnly: false, duasMadeCount: 12, holyDuasCount: 8,
      lastDuaMadeAt: null, createdAt: now - 259200000, isActive: true
    },
    {
      id: 'seed5', requesterId: 'other5', requesterName: 'Yusuf', isAnonymous: false,
      category: 'deceased_loved_ones', customText: 'My mother passed away last month. Please make dua for her — her name was Amina bint Ibrahim. May Allah have mercy on her soul.', suggestedDua: null,
      holyOnly: true, duasMadeCount: 25, holyDuasCount: 25,
      lastDuaMadeAt: null, createdAt: now - 3600000, isActive: true
    },
    {
      id: 'seed6', requesterId: 'other6', requesterName: 'Aisha', isAnonymous: false,
      category: 'rizq', customText: 'My family is going through financial hardship. Please make dua that Allah opens doors of halal rizq and removes this burden from us.', suggestedDua: null,
      holyOnly: false, duasMadeCount: 5, holyDuasCount: 3,
      lastDuaMadeAt: null, createdAt: now - 600000, isActive: true
    },
    {
      id: 'seed7', requesterId: 'other7', requesterName: 'Ibrahim', isAnonymous: false,
      category: 'jannah', customText: 'Please make dua that Allah grants my whole family Jannatul Firdaus. We all try our best but we know only His mercy can save us.', suggestedDua: null,
      holyOnly: false, duasMadeCount: 9, holyDuasCount: 6,
      lastDuaMadeAt: null, createdAt: now - 7200000, isActive: true
    },
    {
      id: 'seed8', requesterId: 'other8', requesterName: 'Maryam', isAnonymous: true,
      category: 'patience_and_strength', customText: 'Going through a very difficult time — please ask Allah to give me sabr and ease. I trust in His plan but my heart is heavy.', suggestedDua: null,
      holyOnly: true, duasMadeCount: 14, holyDuasCount: 14,
      lastDuaMadeAt: null, createdAt: now - 1800000, isActive: true
    },
    {
      id: 'seed9', requesterId: 'other9', requesterName: 'Zainab', isAnonymous: false,
      category: 'studies_and_work', customText: 'I have my final exams next week. Please make dua that Allah grants me focus, retention, and success. I want to make my parents proud.', suggestedDua: null,
      holyOnly: false, duasMadeCount: 2, holyDuasCount: 1,
      lastDuaMadeAt: null, createdAt: now - 300000, isActive: true
    },
    {
      id: 'seed10', requesterId: 'other10', requesterName: 'Hassan', isAnonymous: false,
      category: 'family_and_children', customText: 'Please make dua for my children — that Allah keeps them steadfast on the deen, protects them from harm, and makes them among the righteous.', suggestedDua: null,
      holyOnly: false, duasMadeCount: 18, holyDuasCount: 10,
      lastDuaMadeAt: null, createdAt: now - 10800000, isActive: true
    },
    {
      id: 'seed11', requesterId: 'other11', requesterName: 'Safiya', isAnonymous: false,
      category: 'protection', customText: 'Please make dua that Allah protects my family from the evil eye, envy, and any harm. We have been experiencing a lot of misfortune lately.', suggestedDua: null,
      holyOnly: true, duasMadeCount: 6, holyDuasCount: 6,
      lastDuaMadeAt: null, createdAt: now - 21600000, isActive: true
    },
    {
      id: 'seed12', requesterId: 'other12', requesterName: 'Bilal', isAnonymous: false,
      category: 'ummah', customText: 'Please make dua for the entire Ummah — for those suffering in war, poverty, and oppression. May Allah ease their hardship and grant them victory.', suggestedDua: null,
      holyOnly: true, duasMadeCount: 31, holyDuasCount: 31,
      lastDuaMadeAt: null, createdAt: now - 900000, isActive: true
    },
    {
      id: 'seed13', requesterId: 'other13', requesterName: 'Nour', isAnonymous: true,
      category: 'health_and_healing', customText: 'I have been struggling with my mental health for a long time. Please make dua that Allah heals my heart and mind, and fills me with hope.', suggestedDua: null,
      holyOnly: false, duasMadeCount: 8, holyDuasCount: 4,
      lastDuaMadeAt: null, createdAt: now - 14400000, isActive: true
    },
    {
      id: 'seed14', requesterId: 'other14', requesterName: 'Adam', isAnonymous: false,
      category: 'guidance', customText: 'I am a new Muslim, alhamdulillah. Please make dua that Allah keeps me firm on this path and helps me learn my deen properly.', suggestedDua: null,
      holyOnly: false, duasMadeCount: 19, holyDuasCount: 12,
      lastDuaMadeAt: null, createdAt: now - 32400000, isActive: true
    },
    {
      id: 'seed15', requesterId: 'other15', requesterName: 'Ruqayyah', isAnonymous: false,
      category: 'deceased_loved_ones', customText: 'My grandmother passed away peacefully last year, alhamdulillah. Her name was Hajja Ruqayyah. Please remember her in your duas at the Haram.', suggestedDua: null,
      holyOnly: true, duasMadeCount: 22, holyDuasCount: 22,
      lastDuaMadeAt: null, createdAt: now - 54000000, isActive: true
    },
  ];

  data.duaRequests = seeds;
  saveDemoData(data);
}

// ============================================================
// FIREBASE SERVICE (with demo mode fallback)
// ============================================================

export const FirebaseService = {
  // -- User Operations --
  async createOrUpdateUser(user) {
    if (isDemoMode) {
      const data = getDemoData();
      data.users[user.id] = { ...data.users[user.id], ...user };
      saveDemoData(data);
      return;
    }
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  },

  async getUser(id) {
    if (isDemoMode) {
      const data = getDemoData();
      return data.users[id] || null;
    }
    const snap = await getDoc(doc(db, 'users', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  // -- Dua Request Operations --
  async createDuaRequest(request) {
    if (isDemoMode) {
      const data = getDemoData();
      const newReq = {
        ...request,
        id: 'req_' + Date.now(),
        createdAt: Date.now(),
        duasMadeCount: 0,
        holyDuasCount: 0,
        isActive: true
      };
      data.duaRequests.unshift(newReq);
      if (data.users[request.requesterId]) {
        data.users[request.requesterId].duasRequestedCount = (data.users[request.requesterId].duasRequestedCount || 0) + 1;
      }
      saveDemoData(data);
      return newReq.id;
    }
    const docRef = await addDoc(collection(db, 'duaRequests'), request);
    await updateDoc(doc(db, 'users', request.requesterId), { duasRequestedCount: increment(1) });
    return docRef.id;
  },

  getActiveDuaRequests() {
    if (isDemoMode) {
      const data = getDemoData();
      return data.duaRequests
        .filter(r => r.isActive)
        .sort((a, b) => a.duasMadeCount - b.duasMadeCount || a.createdAt - b.createdAt);
    }
    return null;
  },

  getMyDuaRequests(userId) {
    if (isDemoMode) {
      const data = getDemoData();
      return data.duaRequests
        .filter(r => r.requesterId === userId)
        .sort((a, b) => b.createdAt - a.createdAt);
    }
    return null;
  },

  // location: holy site ID string if at holy site, null if making dua from elsewhere
  async markDuaAsMade(duaRequestId, makerId, makerName, location) {
    const isHolySiteDua = !!location;
    if (isDemoMode) {
      const data = getDemoData();
      const req = data.duaRequests.find(r => r.id === duaRequestId);
      if (req) {
        req.duasMadeCount += 1;
        if (isHolySiteDua) {
          req.holyDuasCount = (req.holyDuasCount || 0) + 1;
        }
        req.lastDuaMadeAt = Date.now();
      }
      data.duaMadeRecords.push({
        duaRequestId, makerId, makerName,
        location: location || 'non_holy',
        isHolySite: isHolySiteDua,
        madeAt: Date.now()
      });
      if (data.users[makerId]) {
        data.users[makerId].duasMadeCount = (data.users[makerId].duasMadeCount || 0) + 1;
      }
      saveDemoData(data);
      return;
    }
    const record = {
      duaRequestId, makerId, makerName,
      location: location || null,
      isHolySite: isHolySiteDua,
      madeAt: serverTimestamp()
    };
    await addDoc(collection(db, 'duaMadeRecords'), record);
    const updates = {
      duasMadeCount: increment(1),
      lastDuaMadeAt: serverTimestamp()
    };
    if (isHolySiteDua) {
      updates.holyDuasCount = increment(1);
    }
    await updateDoc(doc(db, 'duaRequests', duaRequestId), updates);
    await updateDoc(doc(db, 'users', makerId), { duasMadeCount: increment(1) });
  },

  async deactivateDuaRequest(id) {
    if (isDemoMode) {
      const data = getDemoData();
      const req = data.duaRequests.find(r => r.id === id);
      if (req) req.isActive = false;
      saveDemoData(data);
      return;
    }
    await updateDoc(doc(db, 'duaRequests', id), { isActive: false });
  },

  // -- Listeners --
  listenToActiveRequests(callback) {
    if (isDemoMode) {
      const poll = () => {
        const data = getDemoData();
        const requests = data.duaRequests
          .filter(r => r.isActive)
          .sort((a, b) => a.duasMadeCount - b.duasMadeCount || a.createdAt - b.createdAt);
        callback(requests);
      };
      poll();
      const interval = setInterval(poll, 2000);
      return () => clearInterval(interval);
    }
    const q = query(
      collection(db, 'duaRequests'),
      where('isActive', '==', true),
      orderBy('duasMadeCount', 'asc'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    return onSnapshot(q, (snap) => {
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(requests);
    });
  },

  listenToMyRequests(userId, callback) {
    if (isDemoMode) {
      const poll = () => {
        const data = getDemoData();
        const requests = data.duaRequests
          .filter(r => r.requesterId === userId)
          .sort((a, b) => b.createdAt - a.createdAt);
        callback(requests);
      };
      poll();
      const interval = setInterval(poll, 2000);
      return () => clearInterval(interval);
    }
    const q = query(
      collection(db, 'duaRequests'),
      where('requesterId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(requests);
    });
  },

  // -- Auth --
  // -- Pilgrimage Collections --
  async createPilgrimageCollection(data) {
    if (isDemoMode) {
      const d = getDemoData();
      if (!d.pilgrimageCollections) d.pilgrimageCollections = {};
      if (!d.collectionRequests) d.collectionRequests = {};
      const id = 'pilgrim_' + Date.now();
      d.pilgrimageCollections[id] = { id, ...data, requestCount: 0, createdAt: Date.now() };
      saveDemoData(d);
      return id;
    }
    const docRef = await addDoc(collection(db, 'pilgrimageCollections'), { ...data, createdAt: serverTimestamp() });
    return docRef.id;
  },

  async getPilgrimageCollection(id) {
    if (isDemoMode) {
      const d = getDemoData();
      return d.pilgrimageCollections?.[id] || null;
    }
    const snap = await getDoc(doc(db, 'pilgrimageCollections', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async updatePilgrimageCollection(id, updates) {
    if (isDemoMode) {
      const d = getDemoData();
      if (d.pilgrimageCollections?.[id]) Object.assign(d.pilgrimageCollections[id], updates);
      saveDemoData(d);
      return;
    }
    await updateDoc(doc(db, 'pilgrimageCollections', id), updates);
  },

  async submitDuaToCollection(collectionId, request) {
    if (isDemoMode) {
      const d = getDemoData();
      if (!d.collectionRequests) d.collectionRequests = {};
      if (!d.collectionRequests[collectionId]) d.collectionRequests[collectionId] = [];
      const newReq = { id: 'creq_' + Date.now(), collectionId, ...request, isMade: false, createdAt: Date.now() };
      d.collectionRequests[collectionId].unshift(newReq);
      if (d.pilgrimageCollections?.[collectionId]) d.pilgrimageCollections[collectionId].requestCount = (d.collectionRequests[collectionId] || []).length;
      saveDemoData(d);
      return newReq.id;
    }
    const docRef = await addDoc(collection(db, 'collectionRequests'), { collectionId, ...request, isMade: false, createdAt: serverTimestamp() });
    await updateDoc(doc(db, 'pilgrimageCollections', collectionId), { requestCount: increment(1) });
    return docRef.id;
  },

  async markCollectionRequestMade(collectionId, requestId) {
    if (isDemoMode) {
      const d = getDemoData();
      const req = (d.collectionRequests?.[collectionId] || []).find(r => r.id === requestId);
      if (req) req.isMade = true;
      saveDemoData(d);
      return;
    }
    await updateDoc(doc(db, 'collectionRequests', requestId), { isMade: true });
  },

  listenToMyCollections(userId, callback) {
    if (isDemoMode) {
      const poll = () => {
        const d = getDemoData();
        const cols = Object.values(d.pilgrimageCollections || {}).filter(c => c.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
        callback(cols);
      };
      poll();
      const interval = setInterval(poll, 2000);
      return () => clearInterval(interval);
    }
    const q = query(collection(db, 'pilgrimageCollections'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },

  listenToCollectionRequests(collectionId, callback) {
    if (isDemoMode) {
      const poll = () => {
        const d = getDemoData();
        callback((d.collectionRequests?.[collectionId] || []).sort((a, b) => b.createdAt - a.createdAt));
      };
      poll();
      const interval = setInterval(poll, 2000);
      return () => clearInterval(interval);
    }
    const q = query(collection(db, 'collectionRequests'), where('collectionId', '==', collectionId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },

  async signInWithGoogle() {
    if (isDemoMode) {
      const demoUser = {
        id: 'demo_user_1',
        email: 'demo@pray4me.app',
        displayName: 'Abdullah',
        photoURL: null,
        duasMadeCount: 0,
        duasRequestedCount: 0,
        joinedAt: Date.now(),
        authProvider: 'google'
      };
      const data = getDemoData();
      if (!data.users[demoUser.id]) {
        data.users[demoUser.id] = demoUser;
        saveDemoData(data);
      }
      seedDemoData(demoUser.id);
      return { ...data.users[demoUser.id] };
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  },

  async signOut() {
    if (isDemoMode) return;
    await signOut(auth);
  }
};
