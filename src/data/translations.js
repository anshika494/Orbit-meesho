// ─────────────────────────────────────────────────────────────────────────
// TRANSLATIONS
//
// Scope note: this covers the app's main navigation, headers, and primary
// actions — the chrome a judge or seller sees constantly. It deliberately
// does NOT attempt to translate every micro-label (metric sub-captions,
// agent log entries, etc.) — that would be a much larger effort for
// marginal visible benefit in a demo. Only languages listed in
// LanguageContext.jsx's SUPPORTED_LANGUAGES have entries here; we don't
// list a language in the picker unless it's actually translated, since a
// selector with dead/no-op entries would be worse than not offering it.
//
// Onboard's *conversational* language (Hindi/English/Hinglish in the chat
// itself) is separate from this — that's already handled by the Onboard
// Agent detecting the seller's own language from what she types/says.
// This file is specifically the app's dashboard/UI chrome.
// ─────────────────────────────────────────────────────────────────────────

export const TRANSLATIONS = {
  en: {
    'nav.home': 'Home',
    'nav.orders': 'Orders',
    'nav.catalog': 'Catalog',
    'nav.earnings': 'Earnings',
    'nav.orbitGroup': 'ORBIT',
    'nav.onboard': 'Orbit Onboard',
    'nav.score': 'Orbit Score',
    'nav.credit': 'Orbit Credit',
    'nav.openSource': 'Open Source',
    'sidebar.demoSeller': 'Demo seller',
    'sidebar.scoreBuilding': 'Orbit Score: building…',
    'sidebar.scorePrefix': 'Orbit Score',
    'sidebar.language': 'Language',

    'home.badge': 'A Meesho × Agentic AI Initiative',
    'home.tagline': 'Every seller has a trajectory. Orbit lifts it.',
    'home.subtitle': 'A Meesho Seller App Initiative — ScriptedBy{Her} 2.0',
    'home.onboard.title': 'Orbit Onboard',
    'home.onboard.desc': 'Voice-first onboarding that turns a conversation into a live catalog listing.',
    'home.score.title': 'Orbit Score',
    'home.score.desc': 'An orchestrated coaching loop: diagnose, plan, verify, repeat.',
    'home.credit.title': 'Orbit Credit',
    'home.credit.desc': 'Proactive inventory financing the moment demand, stock, and timing converge.',
    'home.openModule': 'Open module →',

    'onboard.title': 'Orbit Onboard',
    'onboard.subtitle': "Tell us about your business — we'll handle the rest",
    'onboard.tryLabel': 'Try one of these to begin:',
    'onboard.inputPlaceholder': 'Type in Hindi, English, or Hinglish…',
    'onboard.listening': 'Listening…',
    'onboard.micUnsupported': 'Voice input is not supported in this browser — please type instead',
    'onboard.readyStatusTitle': 'Ready to go live on Meesho',
    'onboard.readyStatusSub': "This listing is complete based on your conversation — submit it from your seller app when you're ready.",
    'onboard.uploadPhotosTitle': 'Add product photos to finish your listing',
    'onboard.uploadPhotosSub': 'Upload a few photos from different angles — the Catalog Vision Agent will look at them alongside what you told us to write the final listing.',
    'onboard.uploadPhotosButton': 'Choose photos',
    'onboard.generateListingButton': 'Generate professional listing',
    'onboard.generatingListing': 'Looking at your photos and generating the listing…',
    'onboard.removePhoto': 'Remove',
    'onboard.photoExplainerMessage': "Just one more thing — upload a few photos of your product from different angles, and I'll turn them into your professional listing. A good listing has to actually show buyers what they're getting, not just describe it, so I can't create it from our chat alone. You'll see the upload option just below.",

    'score.title': 'Orbit Score',
    'score.subtitle': 'An Orchestrator Agent routes each seller autonomously — full coaching loop, or cold-start guidance.',
    'score.runButton': 'Run Orbit Analysis',
    'score.runningButton': 'Running Orbit Analysis…',

    'credit.title': 'Orbit Credit',
    'credit.subtitle': "Demand, stock, and festival-timing signals from this seller's own data — checked by a risk reflection pass.",
    'credit.runButton': 'Run Credit Analysis',
  },

  hi: {
    'nav.home': 'होम',
    'nav.orders': 'ऑर्डर',
    'nav.catalog': 'कैटलॉग',
    'nav.earnings': 'कमाई',
    'nav.orbitGroup': 'ऑर्बिट',
    'nav.onboard': 'ऑर्बिट ऑनबोर्ड',
    'nav.score': 'ऑर्बिट स्कोर',
    'nav.credit': 'ऑर्बिट क्रेडिट',
    'nav.openSource': 'ओपन सोर्स',
    'sidebar.demoSeller': 'डेमो सेलर',
    'sidebar.scoreBuilding': 'ऑर्बिट स्कोर: बन रहा है…',
    'sidebar.scorePrefix': 'ऑर्बिट स्कोर',
    'sidebar.language': 'भाषा',

    'home.badge': 'एक Meesho × Agentic AI पहल',
    'home.tagline': 'हर सेलर की एक दिशा होती है। ऑर्बिट उसे ऊपर उठाता है।',
    'home.subtitle': 'Meesho सेलर ऐप पहल — ScriptedBy{Her} 2.0',
    'home.onboard.title': 'ऑर्बिट ऑनबोर्ड',
    'home.onboard.desc': 'बातचीत से लिस्टिंग तक — आवाज़ से शुरू होने वाला ऑनबोर्डिंग।',
    'home.score.title': 'ऑर्बिट स्कोर',
    'home.score.desc': 'एक समन्वित कोचिंग लूप: डायग्नोज़, प्लान, वेरिफ़ाई, दोहराएँ।',
    'home.credit.title': 'ऑर्बिट क्रेडिट',
    'home.credit.desc': 'मांग, स्टॉक और समय के मेल पर तुरंत इन्वेंट्री फाइनेंसिंग।',
    'home.openModule': 'मॉड्यूल खोलें →',

    'onboard.title': 'ऑर्बिट ऑनबोर्ड',
    'onboard.subtitle': 'अपने बिज़नेस के बारे में बताएं — बाकी हम संभाल लेंगे',
    'onboard.tryLabel': 'शुरू करने के लिए इनमें से एक आज़माएं:',
    'onboard.inputPlaceholder': 'हिंदी, अंग्रेज़ी, या हिंग्लिश में लिखें…',
    'onboard.listening': 'सुन रहे हैं…',
    'onboard.micUnsupported': 'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है — कृपया टाइप करें',
    'onboard.readyStatusTitle': 'Meesho पर लाइव जाने के लिए तैयार',
    'onboard.readyStatusSub': 'यह लिस्टिंग आपकी बातचीत के आधार पर पूरी हो चुकी है — जब चाहें अपने सेलर ऐप से सबमिट करें।',
    'onboard.uploadPhotosTitle': 'अपनी लिस्टिंग पूरी करने के लिए प्रोडक्ट फ़ोटो जोड़ें',
    'onboard.uploadPhotosSub': 'अलग-अलग एंगल से कुछ फ़ोटो अपलोड करें — कैटलॉग विज़न एजेंट उन्हें और आपकी बताई जानकारी को मिलाकर आखिरी लिस्टिंग बनाएगा।',
    'onboard.uploadPhotosButton': 'फ़ोटो चुनें',
    'onboard.generateListingButton': 'प्रोफेशनल लिस्टिंग बनाएं',
    'onboard.generatingListing': 'आपकी फ़ोटो देख रहे हैं और लिस्टिंग बना रहे हैं…',
    'onboard.removePhoto': 'हटाएं',
    'onboard.photoExplainerMessage': 'बस एक और बात — अपने प्रोडक्ट की अलग-अलग एंगल से कुछ फ़ोटो अपलोड करें, मैं उनसे आपकी प्रोफेशनल लिस्टिंग बना दूँगा। एक अच्छी लिस्टिंग को खरीदारों को असल में दिखाना पड़ता है कि वो क्या ले रहे हैं, सिर्फ़ बताना काफ़ी नहीं — इसलिए मैं इसे सिर्फ़ हमारी बातचीत से नहीं बना सकता। नीचे अपलोड का विकल्प दिख जाएगा।',

    'score.title': 'ऑर्बिट स्कोर',
    'score.subtitle': 'एक ऑर्केस्ट्रेटर एजेंट हर सेलर को खुद तय करके रूट करता है — पूरा कोचिंग लूप, या कोल्ड-स्टार्ट मार्गदर्शन।',
    'score.runButton': 'ऑर्बिट विश्लेषण चलाएं',
    'score.runningButton': 'विश्लेषण चल रहा है…',

    'credit.title': 'ऑर्बिट क्रेडिट',
    'credit.subtitle': 'इस सेलर के अपने डेटा से मांग, स्टॉक और त्योहार-समय के संकेत — एक रिस्क रिफ्लेक्शन जांच के बाद।',
    'credit.runButton': 'क्रेडिट विश्लेषण चलाएं',
  },
};
