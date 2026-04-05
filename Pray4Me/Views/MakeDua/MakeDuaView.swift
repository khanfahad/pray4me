import SwiftUI

struct MakeDuaView: View {
    @EnvironmentObject var locationViewModel: LocationViewModel
    @ObservedObject var duaRequestVM: DuaRequestViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    IslamicPatternHeader(
                        title: "Make Dua",
                        subtitle: headerSubtitle,
                        height: 150
                    )

                    if locationViewModel.isAtHolySite, let site = locationViewModel.currentSite {
                        holySiteContent(site: site)
                    } else {
                        notAtSiteContent
                    }
                }
            }
            .background(AppTheme.warmWhite)
            .ignoresSafeArea(edges: .top)
        }
    }

    private var headerSubtitle: String {
        if let site = locationViewModel.currentSite {
            return "You are at \(site.displayName)"
        }
        return "Visit a holy site to make dua"
    }

    // MARK: - At Holy Site

    private func holySiteContent(site: HolySite) -> some View {
        VStack(spacing: 16) {
            // Location badge
            HStack(spacing: 8) {
                Image(systemName: "location.fill")
                    .foregroundColor(.white)
                Text(site.displayName)
                    .font(AppTheme.body(14))
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                Text("•")
                    .foregroundColor(.white.opacity(0.6))
                Text(site.city)
                    .font(AppTheme.caption(13))
                    .foregroundColor(.white.opacity(0.8))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(AppTheme.primaryGreen)
            .cornerRadius(20)
            .padding(.top, AppTheme.paddingMedium)

            // Instructions
            Text("Swipe through dua requests and tap \"I Made This Dua\" after praying for each one. The requester will be notified, in sha Allah.")
                .font(AppTheme.body(13))
                .foregroundColor(AppTheme.softGray)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppTheme.paddingLarge)

            IslamicDivider()

            // Dua request count
            Text("\(duaRequestVM.activeDuaRequests.count) dua requests waiting")
                .font(AppTheme.subheading(15))
                .foregroundColor(AppTheme.charcoal)

            // Dua Request List
            if duaRequestVM.activeDuaRequests.isEmpty {
                emptyStateView
            } else {
                LazyVStack(spacing: 12) {
                    ForEach(duaRequestVM.activeDuaRequests) { request in
                        DuaRequestCard(
                            request: request,
                            isAtHolySite: true,
                            showMakeDuaButton: true,
                            onMakeDua: {
                                Task {
                                    await duaRequestVM.makeDua(for: request, at: site)
                                }
                            },
                            isDuaJustMade: duaRequestVM.duaJustMade == request.id
                        )
                        .padding(.horizontal, AppTheme.paddingMedium)
                    }
                }
            }

            if let error = duaRequestVM.errorMessage {
                Text(error)
                    .font(AppTheme.caption())
                    .foregroundColor(.red)
                    .padding()
            }
        }
        .padding(.bottom, 100)
    }

    // MARK: - Not at Holy Site

    private var notAtSiteContent: some View {
        VStack(spacing: 24) {
            Spacer().frame(height: 40)

            Image(systemName: "mappin.and.ellipse")
                .font(.system(size: 60))
                .foregroundColor(AppTheme.softGray)

            VStack(spacing: 8) {
                Text("You're not at a holy site yet")
                    .font(AppTheme.subheading())
                    .foregroundColor(AppTheme.charcoal)

                Text("Making dua for others is available when you're at one of these blessed locations:")
                    .font(AppTheme.body(14))
                    .foregroundColor(AppTheme.softGray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, AppTheme.paddingLarge)
            }

            // Holy sites list
            VStack(spacing: 8) {
                ForEach(HolySite.allCases) { site in
                    HStack(spacing: 12) {
                        Image(systemName: "mappin.circle.fill")
                            .foregroundColor(AppTheme.accentGold)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(site.displayName)
                                .font(AppTheme.body(14))
                                .foregroundColor(AppTheme.charcoal)
                            Text(site.city)
                                .font(AppTheme.caption(12))
                                .foregroundColor(AppTheme.softGray)
                        }

                        Spacer()
                    }
                    .padding(.vertical, 8)
                    .padding(.horizontal, AppTheme.paddingMedium)
                }
            }
            .cardStyle()
            .padding(.horizontal, AppTheme.paddingMedium)

            #if DEBUG
            debugSection
            #endif

            Spacer()
        }
    }

    #if DEBUG
    private var debugSection: some View {
        VStack(spacing: 8) {
            IslamicDivider()

            Text("DEBUG: Simulate being at a holy site")
                .font(AppTheme.caption())
                .foregroundColor(.orange)

            ForEach(HolySite.allCases) { site in
                Button {
                    locationViewModel.simulateHolySite(site)
                } label: {
                    Text("Simulate: \(site.displayName)")
                        .font(AppTheme.body(13))
                }
                .buttonStyle(SecondaryButtonStyle())
                .padding(.horizontal, AppTheme.paddingLarge)
            }

            Button("Clear Simulation") {
                locationViewModel.clearSimulation()
            }
            .font(AppTheme.caption())
            .foregroundColor(.red)
        }
    }
    #endif

    private var emptyStateView: some View {
        VStack(spacing: 12) {
            Image(systemName: "hands.sparkles.fill")
                .font(.system(size: 40))
                .foregroundColor(AppTheme.accentGold)

            Text("No dua requests at the moment")
                .font(AppTheme.body(14))
                .foregroundColor(AppTheme.softGray)

            Text("Check back soon — more requests come in throughout the day")
                .font(AppTheme.caption(12))
                .foregroundColor(AppTheme.softGray)
                .multilineTextAlignment(.center)
        }
        .padding(.vertical, 40)
        .padding(.horizontal, AppTheme.paddingLarge)
    }
}
