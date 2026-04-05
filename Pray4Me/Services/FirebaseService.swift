import Foundation
import FirebaseFirestore
import FirebaseAuth

final class FirebaseService {
    static let shared = FirebaseService()
    private let db = Firestore.firestore()

    private init() {}

    // MARK: - Collections

    private var usersCollection: CollectionReference { db.collection("users") }
    private var duaRequestsCollection: CollectionReference { db.collection("duaRequests") }
    private var duaMadeRecordsCollection: CollectionReference { db.collection("duaMadeRecords") }

    // MARK: - User Operations

    func createOrUpdateUser(_ user: AppUser) async throws {
        guard let id = user.id else { return }
        try usersCollection.document(id).setData(from: user, merge: true)
    }

    func getUser(id: String) async throws -> AppUser? {
        let snapshot = try await usersCollection.document(id).getDocument()
        return try snapshot.data(as: AppUser.self)
    }

    func updateFCMToken(userId: String, token: String) async throws {
        try await usersCollection.document(userId).updateData(["fcmToken": token])
    }

    // MARK: - Dua Request Operations

    func createDuaRequest(_ request: DuaRequest) async throws -> String {
        let docRef = try duaRequestsCollection.addDocument(from: request)
        // Increment user's request count
        try await usersCollection.document(request.requesterId).updateData([
            "duasRequestedCount": FieldValue.increment(Int64(1))
        ])
        return docRef.documentID
    }

    func getActiveDuaRequests(limit: Int = 50) async throws -> [DuaRequest] {
        let snapshot = try await duaRequestsCollection
            .whereField("isActive", isEqualTo: true)
            .order(by: "duasMadeCount", descending: false)
            .order(by: "createdAt", descending: false)
            .limit(to: limit)
            .getDocuments()

        return snapshot.documents.compactMap { try? $0.data(as: DuaRequest.self) }
    }

    func getMyDuaRequests(userId: String) async throws -> [DuaRequest] {
        let snapshot = try await duaRequestsCollection
            .whereField("requesterId", isEqualTo: userId)
            .order(by: "createdAt", descending: true)
            .getDocuments()

        return snapshot.documents.compactMap { try? $0.data(as: DuaRequest.self) }
    }

    func markDuaAsMade(duaRequestId: String, makerId: String, makerName: String, location: HolySite) async throws {
        // Record the dua
        let record = DuaMadeRecord(
            duaRequestId: duaRequestId,
            makerId: makerId,
            makerName: makerName,
            location: location,
            madeAt: Date()
        )
        try duaMadeRecordsCollection.addDocument(from: record)

        // Update the request's count and timestamp (moves it to end of list)
        try await duaRequestsCollection.document(duaRequestId).updateData([
            "duasMadeCount": FieldValue.increment(Int64(1)),
            "lastDuaMadeAt": FieldValue.serverTimestamp()
        ])

        // Increment maker's dua count
        try await usersCollection.document(makerId).updateData([
            "duasMadeCount": FieldValue.increment(Int64(1))
        ])
    }

    func getDuaMadeCount(for duaRequestId: String) async throws -> Int {
        let snapshot = try await duaMadeRecordsCollection
            .whereField("duaRequestId", isEqualTo: duaRequestId)
            .getDocuments()
        return snapshot.documents.count
    }

    func deactivateDuaRequest(id: String) async throws {
        try await duaRequestsCollection.document(id).updateData(["isActive": false])
    }

    // MARK: - Real-time Listeners

    func listenToActiveDuaRequests(completion: @escaping ([DuaRequest]) -> Void) -> ListenerRegistration {
        return duaRequestsCollection
            .whereField("isActive", isEqualTo: true)
            .order(by: "duasMadeCount", descending: false)
            .order(by: "createdAt", descending: false)
            .limit(to: 100)
            .addSnapshotListener { snapshot, error in
                guard let documents = snapshot?.documents else { return }
                let requests = documents.compactMap { try? $0.data(as: DuaRequest.self) }
                completion(requests)
            }
    }

    func listenToMyDuaRequests(userId: String, completion: @escaping ([DuaRequest]) -> Void) -> ListenerRegistration {
        return duaRequestsCollection
            .whereField("requesterId", isEqualTo: userId)
            .order(by: "createdAt", descending: true)
            .addSnapshotListener { snapshot, error in
                guard let documents = snapshot?.documents else { return }
                let requests = documents.compactMap { try? $0.data(as: DuaRequest.self) }
                completion(requests)
            }
    }

    /// Get the requester's FCM token so we can notify them
    func getRequesterFCMToken(requesterId: String) async throws -> String? {
        let user = try await getUser(id: requesterId)
        return user?.fcmToken
    }
}
