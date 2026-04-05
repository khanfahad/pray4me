import SwiftUI

struct MyDuaRequestsView: View {
    @ObservedObject var duaRequestVM: DuaRequestViewModel
    @State private var showDeactivateAlert = false
    @State private var requestToDeactivate: DuaRequest?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("My Dua Requests")
                .font(AppTheme.subheading())
                .foregroundColor(AppTheme.charcoal)

            if duaRequestVM.myDuaRequests.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "text.bubble")
                        .font(.system(size: 36))
                        .foregroundColor(AppTheme.softGray)
                    Text("You haven't requested any duas yet.")
                        .font(AppTheme.body(14))
                        .foregroundColor(AppTheme.softGray)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 30)
            } else {
                ForEach(duaRequestVM.myDuaRequests) { request in
                    MyDuaRequestRow(request: request) {
                        requestToDeactivate = request
                        showDeactivateAlert = true
                    }
                }
            }
        }
        .alert("Remove Dua Request?", isPresented: $showDeactivateAlert) {
            Button("Remove", role: .destructive) {
                if let request = requestToDeactivate {
                    Task { await duaRequestVM.deactivateRequest(request) }
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This will remove your request from the active list. Others will no longer see it.")
        }
    }
}

struct MyDuaRequestRow: View {
    let request: DuaRequest
    let onRemove: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: request.category.icon)
                        .font(.caption)
                    Text(request.category.displayName)
                        .font(AppTheme.body(13))
                }
                .foregroundColor(AppTheme.primaryGreen)

                Spacer()

                // Status
                if request.isActive {
                    Text("Active")
                        .font(AppTheme.caption(11))
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(AppTheme.primaryGreen)
                        .cornerRadius(10)
                } else {
                    Text("Completed")
                        .font(AppTheme.caption(11))
                        .foregroundColor(AppTheme.softGray)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(AppTheme.cream)
                        .cornerRadius(10)
                }
            }

            Text(request.displayText)
                .font(AppTheme.body(13))
                .foregroundColor(AppTheme.charcoal)
                .lineLimit(2)

            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "heart.fill")
                        .font(.caption2)
                        .foregroundColor(AppTheme.accentGold)
                    Text("\(request.duasMadeCount) people made dua for you")
                        .font(AppTheme.caption(11))
                        .foregroundColor(AppTheme.softGray)
                }

                Spacer()

                if request.isActive {
                    Button {
                        onRemove()
                    } label: {
                        Image(systemName: "xmark.circle")
                            .font(.caption)
                            .foregroundColor(AppTheme.softGray)
                    }
                }
            }

            if request.isAnonymous {
                HStack(spacing: 4) {
                    Image(systemName: "eye.slash")
                        .font(.caption2)
                    Text("Anonymous")
                        .font(AppTheme.caption(11))
                }
                .foregroundColor(AppTheme.softGray)
            }
        }
        .cardStyle()
    }
}
