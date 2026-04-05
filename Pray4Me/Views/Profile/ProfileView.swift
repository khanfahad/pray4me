import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @ObservedObject var duaRequestVM: DuaRequestViewModel
    @State private var showSignOutAlert = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Profile Header
                    ZStack {
                        LinearGradient(
                            gradient: Gradient(colors: [AppTheme.darkGreen, AppTheme.primaryGreen]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )

                        GeometricPatternView()
                            .opacity(0.06)

                        VStack(spacing: 12) {
                            // Avatar
                            if let photoURL = authViewModel.currentUser?.photoURL,
                               let url = URL(string: photoURL) {
                                AsyncImage(url: url) { image in
                                    image
                                        .resizable()
                                        .scaledToFill()
                                } placeholder: {
                                    avatarPlaceholder
                                }
                                .frame(width: 80, height: 80)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(AppTheme.accentGold, lineWidth: 2))
                            } else {
                                avatarPlaceholder
                            }

                            Text(authViewModel.currentUser?.displayName ?? "Muslim")
                                .font(AppTheme.heading(22))
                                .foregroundColor(.white)

                            Text(authViewModel.currentUser?.email ?? "")
                                .font(AppTheme.caption(13))
                                .foregroundColor(.white.opacity(0.7))

                            // Member since
                            if let joinedAt = authViewModel.currentUser?.joinedAt {
                                Text("Member since \(joinedAt.formatted(.dateTime.month(.wide).year()))")
                                    .font(AppTheme.caption(12))
                                    .foregroundColor(.white.opacity(0.6))
                            }
                        }
                        .padding(.top, 40)
                    }
                    .frame(height: 240)

                    VStack(spacing: 20) {
                        // Stats
                        HStack(spacing: 16) {
                            ProfileStatCard(
                                value: "\(authViewModel.currentUser?.duasMadeCount ?? 0)",
                                label: "Duas Made",
                                icon: "hands.sparkles.fill"
                            )

                            ProfileStatCard(
                                value: "\(authViewModel.currentUser?.duasRequestedCount ?? 0)",
                                label: "Duas Requested",
                                icon: "text.bubble.fill"
                            )
                        }
                        .padding(.horizontal, AppTheme.paddingMedium)

                        IslamicDivider()

                        // My Dua Requests
                        MyDuaRequestsView(duaRequestVM: duaRequestVM)
                            .padding(.horizontal, AppTheme.paddingMedium)

                        IslamicDivider()

                        // Settings Section
                        VStack(spacing: 0) {
                            settingsRow(icon: "bell.fill", title: "Notifications", color: AppTheme.primaryGreen) {
                                // Navigate to notification settings
                            }

                            Divider().padding(.horizontal)

                            settingsRow(icon: "questionmark.circle.fill", title: "About Pray4Me", color: AppTheme.primaryGreen) {
                                // Show about
                            }

                            Divider().padding(.horizontal)

                            settingsRow(icon: "arrow.right.square.fill", title: "Sign Out", color: .red) {
                                showSignOutAlert = true
                            }
                        }
                        .background(Color.white)
                        .cornerRadius(AppTheme.cornerRadius)
                        .padding(.horizontal, AppTheme.paddingMedium)
                    }
                    .padding(.top, AppTheme.paddingMedium)
                    .padding(.bottom, 100)
                }
            }
            .background(AppTheme.warmWhite)
            .ignoresSafeArea(edges: .top)
            .alert("Sign Out", isPresented: $showSignOutAlert) {
                Button("Sign Out", role: .destructive) {
                    authViewModel.signOut()
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("Are you sure you want to sign out?")
            }
        }
    }

    private var avatarPlaceholder: some View {
        Circle()
            .fill(AppTheme.accentGold)
            .frame(width: 80, height: 80)
            .overlay(
                Text(String(authViewModel.currentUser?.displayName.prefix(1) ?? "M"))
                    .font(AppTheme.heading(32))
                    .foregroundColor(.white)
            )
            .overlay(Circle().stroke(AppTheme.accentGold, lineWidth: 2))
    }

    private func settingsRow(icon: String, title: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .frame(width: 24)

                Text(title)
                    .font(AppTheme.body(15))
                    .foregroundColor(title == "Sign Out" ? .red : AppTheme.charcoal)

                Spacer()

                if title != "Sign Out" {
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(AppTheme.softGray)
                }
            }
            .padding(.horizontal, AppTheme.paddingMedium)
            .padding(.vertical, 14)
        }
    }
}

struct ProfileStatCard: View {
    let value: String
    let label: String
    let icon: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(AppTheme.accentGold)
                .font(.title2)

            Text(value)
                .font(AppTheme.heading(24))
                .foregroundColor(AppTheme.primaryGreen)

            Text(label)
                .font(AppTheme.caption(12))
                .foregroundColor(AppTheme.softGray)
        }
        .frame(maxWidth: .infinity)
        .cardStyle()
    }
}
