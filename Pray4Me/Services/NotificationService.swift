import Foundation
import FirebaseFirestore
import FirebaseAuth
import UserNotifications

final class NotificationService {
    static let shared = NotificationService()

    private init() {}

    /// Update the user's FCM token in Firestore
    func updateFCMToken(_ token: String) async {
        guard let userId = Auth.auth().currentUser?.uid else { return }
        try? await FirebaseService.shared.updateFCMToken(userId: userId, token: token)
    }

    /// Send a local notification when someone makes dua for the user
    /// In production, this would be a Cloud Function sending FCM push notifications
    func sendDuaMadeNotification(to requesterId: String, makerName: String, category: DuaCategory) async {
        // For the MVP, we trigger a local notification if the user is the requester.
        // In production, a Firebase Cloud Function would send an FCM push notification
        // to the requester's device using their stored FCM token.
        //
        // Cloud Function pseudocode:
        // exports.onDuaMade = functions.firestore
        //     .document('duaMadeRecords/{recordId}')
        //     .onCreate(async (snap) => {
        //         const record = snap.data();
        //         const requester = await getUser(record.requesterId);
        //         await admin.messaging().send({
        //             token: requester.fcmToken,
        //             notification: {
        //                 title: "Someone made dua for you!",
        //                 body: "A Muslim at ${record.location} made dua for your ${record.category} request."
        //             }
        //         });
        //     });

        guard let currentUserId = Auth.auth().currentUser?.uid,
              currentUserId == requesterId else { return }

        let content = UNMutableNotificationContent()
        content.title = "Someone made dua for you!"
        content.body = "A Muslim at a holy site made dua for your \(category.displayName) request. May Allah accept it."
        content.sound = .default

        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil
        )

        try? await UNUserNotificationCenter.current().add(request)
    }
}
