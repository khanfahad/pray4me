import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var locationViewModel: LocationViewModel
    @StateObject private var duaRequestVM = DuaRequestViewModel()
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(duaRequestVM: duaRequestVM)
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
                .tag(0)

            NewDuaRequestView(duaRequestVM: duaRequestVM)
                .tabItem {
                    Image(systemName: "plus.circle.fill")
                    Text("Request Dua")
                }
                .tag(1)

            MakeDuaView(duaRequestVM: duaRequestVM)
                .tabItem {
                    Image(systemName: "hands.sparkles.fill")
                    Text("Make Dua")
                }
                .tag(2)

            ProfileView(duaRequestVM: duaRequestVM)
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
                .tag(3)
        }
        .tint(AppTheme.primaryGreen)
        .onAppear {
            locationViewModel.requestLocationPermission()
            duaRequestVM.startListeningToActiveRequests()
            duaRequestVM.startListeningToMyRequests()

            // Style the tab bar
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(AppTheme.warmWhite)
            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
        .onDisappear {
            duaRequestVM.stopListening()
        }
    }
}
