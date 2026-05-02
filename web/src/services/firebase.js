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
const DEMO_VERSION = 3; // bump to clear old cached data

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

  const seeds = [
    {
      id: 'seed1', requesterId: 'other1', requesterName: 'Ahmed', isAnonymous: false,
      category: 'health_and_healing', customText: null, suggestedDua: null,
      holyOnly: false, duasMadeCount: 3, holyDuasCount: 2,
      lastDuaMadeAt: null, createdAt: Date.now() - 86400000, isActive: true
    },
    {
      id: 'seed2', requesterId: 'other2', requesterName: 'Fatima', isAnonymous: false,
      category: 'forgiveness', customText: 'Please make dua that Allah forgives me and my parents. They are getting old and I want the best for them in the akhirah.', suggestedDua: null,
      holyOnly: false, duasMadeCount: 7, holyDuasCount: 4,
      lastDuaMadeAt: null, createdAt: Date.now() - 172800000, isActive: true
    },
    {
      id: 'seed3', requesterId: 'other3', requesterName: 'Omar', isAnonymous: true,
      category: 'guidance', customText: null, suggestedDua: 'Guide us to the straight path.',
      holyOnly: true, duasMadeCount: 5, holyDuasCount: 5,
      lastDuaMadeAt: null, createdAt: Date.now() - 43200000, isActive: true
    },
    {
      id: 'seed4', requesterId: 'other4', requesterName: 'Khadija', isAnonymous: false,
      category: 'marriage', customText: 'Please make dua that Allah blesses me with a righteous and kind spouse who will help me grow closer to Allah.', suggestedDua: null,
      holyOnly: false, duasMadeCount: 12, holyDuasCount: 8,
      lastDuaMadeAt: null, createdAt: Date.now() - 259200000, isActive: true
    },
    {
      id: 'seed5', requesterId: 'other5', requesterName: 'Yusuf', isAnonymous: false,
      category: 'deceased_loved_ones', customText: 'My mother passed away last month. Please make dua for her — her name was Amina.', suggestedDua: null,
      holyOnly: true, duasMadeCount: 25, holyDuasCount: 25,
      lastDuaMadeAt: null, createdAt: Date.now() - 3600000, isActive: true
    },
    {
      id: 'seed6', requesterId: 'other6', requesterName: 'Aisha', isAnonymous: false,
      category: 'rizq', customText: null, suggestedDua: 'O Allah, suffice me with what You have allowed instead of what You have forbidden, and make me independent of all others besides You.',
      holyOnly: false, duasMadeCount: 5, holyDuasCount: 3,
      lastDuaMadeAt: null, createdAt: Date.now() - 600000, isActive: true
    },
    {
      id: 'seed7', requesterId: 'other7', requesterName: 'Ibrahim', isAnonymous: false,
      category: 'jannah', customText: 'Please make dua that Allah grants my whole family Jannatul Firdaus. We all try our best but we know only His mercy can save us.',
      holyOnly: false, duasMadeCount: 9, holyDuasCount: 6,
      lastDuaMadeAt: null, createdAt: Date.now() - 7200000, isActive: true
    },
    {
      id: 'seed8', requesterId: 'other8', requesterName: 'Maryam', isAnonymous: true,
      category: 'patience_and_strength', customText: 'Going through a very difficult time. Please ask Allah to give me patience and ease. Ameen.',
      holyOnly: true, duasMadeCount: 14, holyDuasCount: 14,
      lastDuaMadeAt: null, createdAt: Date.now() - 1800000, isActive: true
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
