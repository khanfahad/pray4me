import Foundation

enum DuaCategory: String, Codable, CaseIterable, Identifiable {
    case healthAndHealing = "health_and_healing"
    case forgiveness = "forgiveness"
    case guidance = "guidance"
    case familyAndChildren = "family_and_children"
    case marriage = "marriage"
    case rizq = "rizq"
    case protection = "protection"
    case studiesAndWork = "studies_and_work"
    case patienceAndStrength = "patience_and_strength"
    case jannah = "jannah"
    case deceasedLovedOnes = "deceased_loved_ones"
    case ummah = "ummah"
    case custom = "custom"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .healthAndHealing: return "Health & Healing"
        case .forgiveness: return "Forgiveness"
        case .guidance: return "Guidance (Hidayah)"
        case .familyAndChildren: return "Family & Children"
        case .marriage: return "Marriage"
        case .rizq: return "Rizq (Provision)"
        case .protection: return "Protection"
        case .studiesAndWork: return "Studies & Work"
        case .patienceAndStrength: return "Patience & Strength"
        case .jannah: return "Jannah (Paradise)"
        case .deceasedLovedOnes: return "Deceased Loved Ones"
        case .ummah: return "The Ummah"
        case .custom: return "Custom Dua"
        }
    }

    var icon: String {
        switch self {
        case .healthAndHealing: return "heart.fill"
        case .forgiveness: return "hands.sparkles.fill"
        case .guidance: return "light.beacon.max.fill"
        case .familyAndChildren: return "figure.2.and.child.holdinghands"
        case .marriage: return "heart.circle.fill"
        case .rizq: return "leaf.fill"
        case .protection: return "shield.fill"
        case .studiesAndWork: return "book.fill"
        case .patienceAndStrength: return "figure.mind.and.body"
        case .jannah: return "sun.max.fill"
        case .deceasedLovedOnes: return "star.fill"
        case .ummah: return "globe.americas.fill"
        case .custom: return "text.quote"
        }
    }

    var defaultText: String {
        switch self {
        case .healthAndHealing:
            return "Please make dua for my health and complete healing."
        case .forgiveness:
            return "Please ask Allah to forgive my sins and grant me His mercy."
        case .guidance:
            return "Please make dua that Allah guides me to the straight path."
        case .familyAndChildren:
            return "Please make dua for my family's well-being and righteous children."
        case .marriage:
            return "Please make dua that Allah blesses me with a righteous spouse."
        case .rizq:
            return "Please make dua for halal rizq and barakah in my provision."
        case .protection:
            return "Please make dua for protection from evil and harm."
        case .studiesAndWork:
            return "Please make dua for success in my studies and career."
        case .patienceAndStrength:
            return "Please make dua for patience and strength during my trials."
        case .jannah:
            return "Please make dua that Allah grants me Jannatul Firdaus."
        case .deceasedLovedOnes:
            return "Please make dua for my deceased loved ones — may Allah grant them Jannah."
        case .ummah:
            return "Please make dua for the entire Muslim Ummah."
        case .custom:
            return ""
        }
    }

    /// Suggested duas from Quran and Sunnah for each category
    var suggestedDuas: [SuggestedDua] {
        switch self {
        case .healthAndHealing:
            return [
                SuggestedDua(
                    arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِهِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",
                    translation: "O Allah, Lord of mankind, remove the affliction. Cure, for You are the One who cures. There is no cure except Your cure — a cure that leaves no illness.",
                    source: "Sahih al-Bukhari"
                )
            ]
        case .forgiveness:
            return [
                SuggestedDua(
                    arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
                    translation: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
                    source: "Quran 7:23"
                )
            ]
        case .guidance:
            return [
                SuggestedDua(
                    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
                    translation: "Guide us to the straight path.",
                    source: "Quran 1:6"
                )
            ]
        case .familyAndChildren:
            return [
                SuggestedDua(
                    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
                    translation: "Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us leaders for the righteous.",
                    source: "Quran 25:74"
                )
            ]
        case .marriage:
            return [
                SuggestedDua(
                    arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
                    translation: "My Lord, indeed I am in need of whatever good You would send down to me.",
                    source: "Quran 28:24"
                )
            ]
        case .rizq:
            return [
                SuggestedDua(
                    arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
                    translation: "O Allah, suffice me with what You have allowed instead of what You have forbidden, and make me independent of all others besides You.",
                    source: "Tirmidhi"
                )
            ]
        case .protection:
            return [
                SuggestedDua(
                    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَا عَمِلْتُ، وَمِنْ شَرِّ مَا لَمْ أَعْمَلْ",
                    translation: "O Allah, I seek refuge in You from the evil of what I have done and from the evil of what I have not done.",
                    source: "Sahih Muslim"
                )
            ]
        case .studiesAndWork:
            return [
                SuggestedDua(
                    arabic: "رَبِّ زِدْنِي عِلْمًا",
                    translation: "My Lord, increase me in knowledge.",
                    source: "Quran 20:114"
                )
            ]
        case .patienceAndStrength:
            return [
                SuggestedDua(
                    arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
                    translation: "Our Lord, pour upon us patience and plant firmly our feet and give us victory.",
                    source: "Quran 2:250"
                )
            ]
        case .jannah:
            return [
                SuggestedDua(
                    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
                    translation: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
                    source: "Quran 2:201"
                )
            ]
        case .deceasedLovedOnes:
            return [
                SuggestedDua(
                    arabic: "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ",
                    translation: "O Allah, forgive them, have mercy on them, grant them wellbeing, and pardon them.",
                    source: "Sahih Muslim"
                )
            ]
        case .ummah:
            return [
                SuggestedDua(
                    arabic: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ",
                    translation: "Our Lord, forgive us and our brothers who preceded us in faith.",
                    source: "Quran 59:10"
                )
            ]
        case .custom:
            return []
        }
    }
}

struct SuggestedDua: Identifiable {
    let id = UUID()
    let arabic: String
    let translation: String
    let source: String
}
