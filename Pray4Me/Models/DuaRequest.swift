import Foundation
import FirebaseFirestore

struct DuaRequest: Codable, Identifiable {
    @DocumentID var id: String?
    let requesterId: String
    let requesterName: String
    let isAnonymous: Bool
    let category: DuaCategory
    let customText: String?
    let suggestedDua: String?
    var duasMadeCount: Int
    var lastDuaMadeAt: Date?
    let createdAt: Date
    var isActive: Bool

    /// Display name respects privacy — only revealed at holy sites
    func displayName(isAtHolySite: Bool) -> String {
        if isAnonymous {
            return "A Muslim Brother/Sister"
        }
        return isAtHolySite ? requesterName : "A Muslim"
    }

    var displayText: String {
        if let custom = customText, !custom.isEmpty {
            return custom
        }
        if let suggested = suggestedDua {
            return suggested
        }
        return category.defaultText
    }

    static func new(
        requesterId: String,
        requesterName: String,
        isAnonymous: Bool,
        category: DuaCategory,
        customText: String?,
        suggestedDua: String?
    ) -> DuaRequest {
        DuaRequest(
            requesterId: requesterId,
            requesterName: requesterName,
            isAnonymous: isAnonymous,
            category: category,
            customText: customText,
            suggestedDua: suggestedDua,
            duasMadeCount: 0,
            lastDuaMadeAt: nil,
            createdAt: Date(),
            isActive: true
        )
    }
}

struct DuaMadeRecord: Codable, Identifiable {
    @DocumentID var id: String?
    let duaRequestId: String
    let makerId: String
    let makerName: String
    let location: HolySite
    let madeAt: Date
}
