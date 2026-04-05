import SwiftUI

enum AppTheme {
    // MARK: - Colors

    static let primaryGreen = Color(hex: "1B5E20")
    static let darkGreen = Color(hex: "0D3B0F")
    static let lightGreen = Color(hex: "E8F5E9")
    static let accentGold = Color(hex: "C8A951")
    static let warmWhite = Color(hex: "FDF8F0")
    static let cream = Color(hex: "F5F0E8")
    static let charcoal = Color(hex: "2C2C2C")
    static let softGray = Color(hex: "9E9E9E")

    // MARK: - Fonts

    static func heading(_ size: CGFloat = 24) -> Font {
        .system(size: size, weight: .bold, design: .serif)
    }

    static func subheading(_ size: CGFloat = 18) -> Font {
        .system(size: size, weight: .semibold, design: .serif)
    }

    static func body(_ size: CGFloat = 16) -> Font {
        .system(size: size, weight: .regular, design: .default)
    }

    static func arabic(_ size: CGFloat = 22) -> Font {
        .system(size: size, weight: .regular, design: .serif)
    }

    static func caption(_ size: CGFloat = 13) -> Font {
        .system(size: size, weight: .regular, design: .default)
    }

    // MARK: - Spacing

    static let paddingSmall: CGFloat = 8
    static let paddingMedium: CGFloat = 16
    static let paddingLarge: CGFloat = 24

    static let cornerRadius: CGFloat = 12
    static let cornerRadiusSmall: CGFloat = 8
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - View Modifiers

struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(AppTheme.paddingMedium)
            .background(Color.white)
            .cornerRadius(AppTheme.cornerRadius)
            .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 2)
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppTheme.body())
            .fontWeight(.semibold)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(AppTheme.primaryGreen)
            .cornerRadius(AppTheme.cornerRadius)
            .opacity(configuration.isPressed ? 0.85 : 1)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppTheme.body())
            .fontWeight(.semibold)
            .foregroundColor(AppTheme.primaryGreen)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(AppTheme.lightGreen)
            .cornerRadius(AppTheme.cornerRadius)
            .opacity(configuration.isPressed ? 0.85 : 1)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

struct GoldAccentButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppTheme.body())
            .fontWeight(.semibold)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(AppTheme.accentGold)
            .cornerRadius(AppTheme.cornerRadius)
            .opacity(configuration.isPressed ? 0.85 : 1)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardModifier())
    }
}
