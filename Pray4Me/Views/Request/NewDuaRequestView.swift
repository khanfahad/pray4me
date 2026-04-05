import SwiftUI

struct NewDuaRequestView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @ObservedObject var duaRequestVM: DuaRequestViewModel
    @State private var selectedCategory: DuaCategory?
    @State private var customText = ""
    @State private var isAnonymous = false
    @State private var showSuggestedDuas = false
    @State private var selectedSuggestedDua: SuggestedDua?
    @State private var showSuccess = false
    @State private var showCategoryPicker = true

    private let maxCustomLength = 200

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    IslamicPatternHeader(
                        title: "Request a Dua",
                        subtitle: "Ask the Ummah to pray for you",
                        height: 150
                    )

                    VStack(spacing: 20) {
                        if showCategoryPicker {
                            categoryPickerSection
                        } else if let category = selectedCategory {
                            requestFormSection(category: category)
                        }
                    }
                    .padding(.top, AppTheme.paddingMedium)
                    .padding(.bottom, 100)
                }
            }
            .background(AppTheme.warmWhite)
            .ignoresSafeArea(edges: .top)
            .alert("Dua Request Submitted", isPresented: $showSuccess) {
                Button("Alhamdulillah") {
                    resetForm()
                }
            } message: {
                Text("Your dua request has been shared with the Ummah. May Allah answer your prayers.")
            }
        }
    }

    // MARK: - Category Picker

    private var categoryPickerSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("What would you like dua for?")
                .font(AppTheme.subheading())
                .foregroundColor(AppTheme.charcoal)
                .padding(.horizontal, AppTheme.paddingMedium)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ForEach(DuaCategory.allCases) { category in
                    Button {
                        withAnimation {
                            selectedCategory = category
                            showCategoryPicker = false
                        }
                    } label: {
                        VStack(spacing: 10) {
                            Image(systemName: category.icon)
                                .font(.title2)
                                .foregroundColor(AppTheme.primaryGreen)

                            Text(category.displayName)
                                .font(AppTheme.body(13))
                                .foregroundColor(AppTheme.charcoal)
                                .multilineTextAlignment(.center)
                                .lineLimit(2)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 90)
                        .background(Color.white)
                        .cornerRadius(AppTheme.cornerRadius)
                        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
                    }
                }
            }
            .padding(.horizontal, AppTheme.paddingMedium)
        }
    }

    // MARK: - Request Form

    private func requestFormSection(category: DuaCategory) -> some View {
        VStack(spacing: 20) {
            // Back button and category header
            HStack {
                Button {
                    withAnimation {
                        showCategoryPicker = true
                        selectedCategory = nil
                        customText = ""
                        selectedSuggestedDua = nil
                    }
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text("Back")
                    }
                    .font(AppTheme.body(14))
                    .foregroundColor(AppTheme.primaryGreen)
                }

                Spacer()
            }
            .padding(.horizontal, AppTheme.paddingMedium)

            // Selected category
            HStack(spacing: 12) {
                Image(systemName: category.icon)
                    .foregroundColor(AppTheme.primaryGreen)
                    .font(.title3)

                Text(category.displayName)
                    .font(AppTheme.subheading())
                    .foregroundColor(AppTheme.charcoal)

                Spacer()
            }
            .cardStyle()
            .padding(.horizontal, AppTheme.paddingMedium)

            // Default text preview (non-custom categories)
            if category != .custom && selectedSuggestedDua == nil {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Default request:")
                        .font(AppTheme.caption())
                        .foregroundColor(AppTheme.softGray)

                    Text(category.defaultText)
                        .font(AppTheme.body(14))
                        .foregroundColor(AppTheme.charcoal)
                        .italic()
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .cardStyle()
                .padding(.horizontal, AppTheme.paddingMedium)
            }

            // Suggested Duas
            if !category.suggestedDuas.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    Button {
                        withAnimation { showSuggestedDuas.toggle() }
                    } label: {
                        HStack {
                            Image(systemName: "lightbulb.fill")
                                .foregroundColor(AppTheme.accentGold)
                            Text("Suggest a Dua from Quran/Sunnah")
                                .font(AppTheme.body(14))
                                .foregroundColor(AppTheme.primaryGreen)
                            Spacer()
                            Image(systemName: showSuggestedDuas ? "chevron.up" : "chevron.down")
                                .foregroundColor(AppTheme.softGray)
                        }
                    }

                    if showSuggestedDuas {
                        ForEach(category.suggestedDuas) { dua in
                            Button {
                                selectedSuggestedDua = (selectedSuggestedDua?.id == dua.id) ? nil : dua
                            } label: {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(dua.arabic)
                                        .font(AppTheme.arabic(18))
                                        .foregroundColor(AppTheme.charcoal)
                                        .multilineTextAlignment(.trailing)
                                        .frame(maxWidth: .infinity, alignment: .trailing)
                                        .environment(\.layoutDirection, .rightToLeft)

                                    Text(dua.translation)
                                        .font(AppTheme.body(13))
                                        .foregroundColor(AppTheme.charcoal.opacity(0.8))

                                    Text("— \(dua.source)")
                                        .font(AppTheme.caption(11))
                                        .foregroundColor(AppTheme.accentGold)
                                }
                                .padding(12)
                                .frame(maxWidth: .infinity)
                                .background(selectedSuggestedDua?.id == dua.id ? AppTheme.lightGreen : Color.white)
                                .cornerRadius(AppTheme.cornerRadiusSmall)
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppTheme.cornerRadiusSmall)
                                        .stroke(
                                            selectedSuggestedDua?.id == dua.id ? AppTheme.primaryGreen : Color.clear,
                                            lineWidth: 1.5
                                        )
                                )
                            }
                        }
                    }
                }
                .cardStyle()
                .padding(.horizontal, AppTheme.paddingMedium)
            }

            // Custom text
            if category == .custom || (category != .custom && selectedSuggestedDua == nil) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(category == .custom ? "Write your dua request" : "Or add a specific note (optional)")
                        .font(AppTheme.body(14))
                        .foregroundColor(AppTheme.charcoal)

                    TextEditor(text: $customText)
                        .frame(minHeight: 80, maxHeight: 120)
                        .padding(8)
                        .background(Color.white)
                        .cornerRadius(AppTheme.cornerRadiusSmall)
                        .overlay(
                            RoundedRectangle(cornerRadius: AppTheme.cornerRadiusSmall)
                                .stroke(AppTheme.softGray.opacity(0.3), lineWidth: 1)
                        )

                    HStack {
                        Text("Keep it brief — one minute to read")
                            .font(AppTheme.caption(11))
                            .foregroundColor(AppTheme.softGray)

                        Spacer()

                        Text("\(customText.count)/\(maxCustomLength)")
                            .font(AppTheme.caption(11))
                            .foregroundColor(customText.count > maxCustomLength ? .red : AppTheme.softGray)
                    }
                }
                .padding(.horizontal, AppTheme.paddingMedium)
            }

            IslamicDivider()

            // Privacy Toggle
            VStack(spacing: 12) {
                Toggle(isOn: $isAnonymous) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Stay Anonymous")
                            .font(AppTheme.body(14))
                            .foregroundColor(AppTheme.charcoal)

                        Text("Your name will be hidden from those making dua")
                            .font(AppTheme.caption(12))
                            .foregroundColor(AppTheme.softGray)
                    }
                }
                .tint(AppTheme.primaryGreen)

                if !isAnonymous {
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(AppTheme.primaryGreen)
                            .font(.caption)
                        Text("Sharing your name lets others make a more personal dua for you")
                            .font(AppTheme.caption(11))
                            .foregroundColor(AppTheme.primaryGreen)
                    }
                }
            }
            .padding(.horizontal, AppTheme.paddingMedium)

            // Submit Button
            Button {
                Task { await submitRequest() }
            } label: {
                if duaRequestVM.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Submit Dua Request")
                }
            }
            .buttonStyle(PrimaryButtonStyle())
            .disabled(duaRequestVM.isLoading || !isFormValid(category: category))
            .opacity(isFormValid(category: category) ? 1 : 0.6)
            .padding(.horizontal, AppTheme.paddingMedium)

            if let error = duaRequestVM.errorMessage {
                Text(error)
                    .font(AppTheme.caption())
                    .foregroundColor(.red)
                    .padding(.horizontal, AppTheme.paddingMedium)
            }
        }
    }

    // MARK: - Helpers

    private func isFormValid(category: DuaCategory) -> Bool {
        if category == .custom {
            return !customText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                && customText.count <= maxCustomLength
        }
        return customText.count <= maxCustomLength
    }

    private func submitRequest() async {
        guard let category = selectedCategory else { return }

        let text = customText.trimmingCharacters(in: .whitespacesAndNewlines)
        let success = await duaRequestVM.createDuaRequest(
            category: category,
            customText: text.isEmpty ? nil : text,
            suggestedDua: selectedSuggestedDua?.translation,
            isAnonymous: isAnonymous
        )

        if success {
            showSuccess = true
        }
    }

    private func resetForm() {
        selectedCategory = nil
        customText = ""
        isAnonymous = false
        showSuggestedDuas = false
        selectedSuggestedDua = nil
        showCategoryPicker = true
        duaRequestVM.errorMessage = nil
        duaRequestVM.successMessage = nil
    }
}
