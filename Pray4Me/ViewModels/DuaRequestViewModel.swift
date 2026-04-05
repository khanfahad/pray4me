import Foundation
import FirebaseFirestore
import FirebaseAuth

@MainActor
final class DuaRequestViewModel: ObservableObject {
    @Published var activeDuaRequests: [DuaRequest] = []
    @Published var myDuaRequests: [DuaRequest] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var successMessage: String?
    @Published var duaJustMade: String? // ID of request just prayed for (for animation)

    private var activeListener: ListenerRegistration?
    private var myListener: ListenerRegistration?

    // MARK: - Create Request

    func createDuaRequest(
        category: DuaCategory,
        customText: String?,
        suggestedDua: String?,
        isAnonymous: Bool
    ) async -> Bool {
        guard let user = Auth.auth().currentUser else {
            errorMessage = "Please sign in to request a dua."
            return false
        }

        isLoading = true
        defer { isLoading = false }

        let request = DuaRequest.new(
            requesterId: user.uid,
            requesterName: user.displayName ?? "Muslim",
            isAnonymous: isAnonymous,
            category: category,
            customText: customText,
            suggestedDua: suggestedDua
        )

        do {
            _ = try await FirebaseService.shared.createDuaRequest(request)
            successMessage = "Your dua request has been submitted. May Allah answer it."
            return true
        } catch {
            errorMessage = "Failed to submit request: \(error.localizedDescription)"
            return false
        }
    }

    // MARK: - Make Dua

    func makeDua(for request: DuaRequest, at site: HolySite) async {
        guard let user = Auth.auth().currentUser,
              let requestId = request.id else {
            errorMessage = "Unable to record dua."
            return
        }

        // Prevent making dua for your own request
        if request.requesterId == user.uid {
            errorMessage = "You cannot make dua for your own request here, but you can always make dua for yourself directly!"
            return
        }

        do {
            try await FirebaseService.shared.markDuaAsMade(
                duaRequestId: requestId,
                makerId: user.uid,
                makerName: user.displayName ?? "A Muslim",
                location: site
            )

            duaJustMade = requestId

            // Notify the requester
            await NotificationService.shared.sendDuaMadeNotification(
                to: request.requesterId,
                makerName: user.displayName ?? "A Muslim",
                category: request.category
            )

            // Clear animation after delay
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            duaJustMade = nil
        } catch {
            errorMessage = "Failed to record dua: \(error.localizedDescription)"
        }
    }

    // MARK: - Deactivate

    func deactivateRequest(_ request: DuaRequest) async {
        guard let id = request.id else { return }
        do {
            try await FirebaseService.shared.deactivateDuaRequest(id: id)
        } catch {
            errorMessage = "Failed to remove request."
        }
    }

    // MARK: - Listeners

    func startListeningToActiveRequests() {
        activeListener = FirebaseService.shared.listenToActiveDuaRequests { [weak self] requests in
            Task { @MainActor in
                self?.activeDuaRequests = requests
            }
        }
    }

    func startListeningToMyRequests() {
        guard let userId = Auth.auth().currentUser?.uid else { return }
        myListener = FirebaseService.shared.listenToMyDuaRequests(userId: userId) { [weak self] requests in
            Task { @MainActor in
                self?.myDuaRequests = requests
            }
        }
    }

    func stopListening() {
        activeListener?.remove()
        myListener?.remove()
        activeListener = nil
        myListener = nil
    }

    deinit {
        activeListener?.remove()
        myListener?.remove()
    }
}
