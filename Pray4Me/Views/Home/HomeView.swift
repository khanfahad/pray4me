import SwiftUI

struct HomeView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var locationViewModel: LocationViewModel
    @ObservedObject var duaRequestVM: DuaRequestViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Header
                    IslamicPatternHeader(
                        title: "Pray4Me",
                        subtitle: greetingText,
                        height: 180
                    )

                    VStack(spacing: 20) {
                        // Location Status Card
                        locationStatusCard

                        // Stats
                        statsRow

                        IslamicDivider()

                        // Recent Requests
                        recentRequestsSection
                    }
                    .padding(.top, AppTheme.paddingMedium)
                    .padding(.bottom, 100)
                }
            }
            .background(AppTheme.warmWhite)
            .ignoresSafeArea(edges: .top)
        }
    }

    private var greetingText: String {
        let name = authViewModel.currentUser?.displayName ?? "Muslim"
        let hour = Calendar.current.component(.hour, from: Date())
        let greeting: String
        if hour < 12 {
            greeting = "Good Morning"
        } else if hour < 17 {
            greeting = "Good Afternoon"
        } else {
            greeting = "Good Evening"
        }
        return "As-salamu alaykum, \(name.components(separatedBy: " ").first ?? name)"
    }

    private var locationStatusCard: some View {
        VStack(spacing: 12) {
            if locationViewModel.isAtHolySite, let site = locationViewModel.currentSite {
                HStack(spacing: 12) {
                    Image(systemName: "location.fill")
                        .foregroundColor(AppTheme.accentGold)
                        .font(.title2)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("You are at \(site.displayName)")
                            .font(AppTheme.subheading(16))
                            .foregroundColor(AppTheme.primaryGreen)

                        Text("Dua requests are available. May Allah accept your prayers.")
                            .font(AppTheme.caption())
                            .foregroundColor(AppTheme.softGray)
                    }

                    Spacer()
                }
                .cardStyle()
            } else {
                HStack(spacing: 12) {
                    Image(systemName: "location.slash")
                        .foregroundColor(AppTheme.softGray)
                        .font(.title2)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Not at a holy site")
                            .font(AppTheme.subheading(16))
                            .foregroundColor(AppTheme.charcoal)

                        Text("You can still request duas. Making dua is available at holy sites.")
                            .font(AppTheme.caption())
                            .foregroundColor(AppTheme.softGray)
                    }

                    Spacer()
                }
                .cardStyle()

                #if DEBUG
                debugLocationButtons
                #endif
            }
        }
        .padding(.horizontal, AppTheme.paddingMedium)
    }

    #if DEBUG
    private var debugLocationButtons: some View {
        VStack(spacing: 8) {
            Text("DEBUG: Simulate Location")
                .font(AppTheme.caption())
                .foregroundColor(.orange)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(HolySite.allCases) { site in
                        Button(site.displayName) {
                            locationViewModel.simulateHolySite(site)
                        }
                        .font(.caption)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(AppTheme.lightGreen)
                        .cornerRadius(AppTheme.cornerRadiusSmall)
                    }

                    Button("Clear") {
                        locationViewModel.clearSimulation()
                    }
                    .font(.caption)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color.red.opacity(0.1))
                    .cornerRadius(AppTheme.cornerRadiusSmall)
                }
            }
        }
        .padding(.horizontal, AppTheme.paddingMedium)
    }
    #endif

    private var statsRow: some View {
        HStack(spacing: 16) {
            StatCard(
                icon: "tray.full.fill",
                value: "\(duaRequestVM.activeDuaRequests.count)",
                label: "Active Requests"
            )

            StatCard(
                icon: "heart.fill",
                value: "\(authViewModel.currentUser?.duasMadeCount ?? 0)",
                label: "Duas You Made"
            )

            StatCard(
                icon: "text.bubble.fill",
                value: "\(duaRequestVM.myDuaRequests.filter { $0.isActive }.count)",
                label: "Your Requests"
            )
        }
        .padding(.horizontal, AppTheme.paddingMedium)
    }

    private var recentRequestsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Dua Requests")
                .font(AppTheme.subheading())
                .foregroundColor(AppTheme.charcoal)
                .padding(.horizontal, AppTheme.paddingMedium)

            if duaRequestVM.activeDuaRequests.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "text.bubble")
                        .font(.system(size: 40))
                        .foregroundColor(AppTheme.softGray)
                    Text("No dua requests yet.\nBe the first to request a dua!")
                        .font(AppTheme.body(14))
                        .foregroundColor(AppTheme.softGray)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else {
                ForEach(duaRequestVM.activeDuaRequests.prefix(5)) { request in
                    DuaRequestCard(
                        request: request,
                        isAtHolySite: locationViewModel.isAtHolySite,
                        showMakeDuaButton: false
                    )
                    .padding(.horizontal, AppTheme.paddingMedium)
                }
            }
        }
    }
}

struct StatCard: View {
    let icon: String
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(AppTheme.accentGold)
                .font(.title3)

            Text(value)
                .font(AppTheme.heading(20))
                .foregroundColor(AppTheme.primaryGreen)

            Text(label)
                .font(AppTheme.caption(11))
                .foregroundColor(AppTheme.softGray)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .cardStyle()
    }
}
