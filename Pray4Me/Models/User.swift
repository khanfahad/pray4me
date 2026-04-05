import Foundation
import FirebaseFirestore

struct AppUser: Codable, Identifiable {
    @DocumentID var id: String?
    let email: String
    var displayName: String
    var photoURL: String?
    var fcmToken: String?
    var duasMadeCount: Int
    var duasRequestedCount: Int
    var joinedAt: Date
    var authProvider: AuthProvider

    enum AuthProvider: String, Codable {
        case google
        case facebook
        case apple
    }

    static func new(id: String, email: String, displayName: String, photoURL: String?, provider: AuthProvider) -> AppUser {
        AppUser(
            id: id,
            email: email,
            displayName: displayName,
            photoURL: photoURL,
            fcmToken: nil,
            duasMadeCount: 0,
            duasRequestedCount: 0,
            joinedAt: Date(),
            authProvider: provider
        )
    }
}
