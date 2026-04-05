import SwiftUI

struct DuaRequestCard: View {
    let request: DuaRequest
    let isAtHolySite: Bool
    var showMakeDuaButton: Bool = true
    var onMakeDua: (() -> Void)?
    var isDuaJustMade: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header: Name + Category
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(request.displayName(isAtHolySite: isAtHolySite))
                        .font(AppTheme.subheading(15))
                        .foregroundColor(AppTheme.primaryGreen)

                    HStack(spacing: 6) {
                        Image(systemName: request.category.icon)
                            .font(.caption)
                        Text(request.category.displayName)
                            .font(AppTheme.caption(12))
                    }
                    .foregroundColor(AppTheme.accentGold)
                }

                Spacer()

                // Dua count badge
                VStack(spacing: 2) {
                    Text("\(request.duasMadeCount)")
                        .font(AppTheme.heading(18))
                        .foregroundColor(AppTheme.primaryGreen)
                    Text("duas")
                        .font(AppTheme.caption(10))
                        .foregroundColor(AppTheme.softGray)
                }
            }

            // Dua text
            Text(request.displayText)
                .font(AppTheme.body(14))
                .foregroundColor(AppTheme.charcoal)
                .lineLimit(3)

            // Time
            Text(request.createdAt.timeAgoDisplay())
                .font(AppTheme.caption(11))
                .foregroundColor(AppTheme.softGray)

            // Make Dua Button
            if showMakeDuaButton {
                Button {
                    onMakeDua?()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: isDuaJustMade ? "checkmark.circle.fill" : "hands.sparkles.fill")
                        Text(isDuaJustMade ? "Ameen — Dua Made" : "I Made This Dua")
                    }
                    .font(AppTheme.body(13))
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(isDuaJustMade ? AppTheme.accentGold : AppTheme.primaryGreen)
                    .cornerRadius(AppTheme.cornerRadius)
                }
                .disabled(isDuaJustMade)
            }
        }
        .cardStyle()
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                .stroke(isDuaJustMade ? AppTheme.accentGold : Color.clear, lineWidth: 2)
        )
        .animation(.easeInOut, value: isDuaJustMade)
    }
}

// MARK: - Date Extension

extension Date {
    func timeAgoDisplay() -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: self, relativeTo: Date())
    }
}
