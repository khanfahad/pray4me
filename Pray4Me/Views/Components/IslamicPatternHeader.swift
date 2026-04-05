import SwiftUI

/// A minimal Islamic-inspired decorative header with geometric pattern
struct IslamicPatternHeader: View {
    var title: String
    var subtitle: String?
    var height: CGFloat = 200

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [AppTheme.darkGreen, AppTheme.primaryGreen]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Geometric pattern overlay
            GeometricPatternView()
                .opacity(0.08)

            // Crescent and star accent
            VStack(spacing: 8) {
                Image(systemName: "moon.stars.fill")
                    .font(.system(size: 28))
                    .foregroundColor(AppTheme.accentGold)

                Text(title)
                    .font(AppTheme.heading(26))
                    .foregroundColor(.white)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(AppTheme.caption(14))
                        .foregroundColor(.white.opacity(0.8))
                }
            }
            .padding(.top, 20)
        }
        .frame(height: height)
    }
}

struct GeometricPatternView: View {
    var body: some View {
        Canvas { context, size in
            let spacing: CGFloat = 40
            let rows = Int(size.height / spacing) + 1
            let cols = Int(size.width / spacing) + 1

            for row in 0..<rows {
                for col in 0..<cols {
                    let x = CGFloat(col) * spacing + (row.isMultiple(of: 2) ? spacing / 2 : 0)
                    let y = CGFloat(row) * spacing
                    let center = CGPoint(x: x, y: y)

                    // Draw an 8-pointed star pattern
                    let starPath = createStarPath(center: center, radius: 12, points: 8)
                    context.fill(starPath, with: .color(.white))
                }
            }
        }
    }

    private func createStarPath(center: CGPoint, radius: CGFloat, points: Int) -> Path {
        var path = Path()
        let angleIncrement = .pi * 2 / CGFloat(points * 2)

        for i in 0..<(points * 2) {
            let r = i.isMultiple(of: 2) ? radius : radius * 0.4
            let angle = angleIncrement * CGFloat(i) - .pi / 2
            let point = CGPoint(
                x: center.x + r * cos(angle),
                y: center.y + r * sin(angle)
            )
            if i == 0 {
                path.move(to: point)
            } else {
                path.addLine(to: point)
            }
        }
        path.closeSubpath()
        return path
    }
}

/// Decorative divider with Islamic motif
struct IslamicDivider: View {
    var body: some View {
        HStack(spacing: 12) {
            Rectangle()
                .fill(AppTheme.accentGold.opacity(0.3))
                .frame(height: 1)

            Image(systemName: "diamond.fill")
                .font(.system(size: 6))
                .foregroundColor(AppTheme.accentGold)

            Rectangle()
                .fill(AppTheme.accentGold.opacity(0.3))
                .frame(height: 1)
        }
        .padding(.horizontal, AppTheme.paddingLarge)
    }
}
