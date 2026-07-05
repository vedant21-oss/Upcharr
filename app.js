// ==========================================================================
// MOCK DATABASES & CONFIG
// ==========================================================================
const DOCTORS = [
  {
    id: "dr-sharma",
    name: "Dr. Aarav Sharma",
    specialty: "General Physician",
    qualifications: "MD, Internal Medicine",
    experience: 12,
    rating: 4.9,
    reviews: 340,
    nextSlot: "Tomorrow, 9:00 AM",
    avatar: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="90" fill="#f4f5f7"/>
              <path d="M60 170 C 60 130, 140 130, 140 170" fill="#1d2939"/>
              <circle cx="100" cy="85" r="35" fill="#fcddec"/>
              <path d="M85 120 C 85 140, 115 140, 115 120" stroke="#00b3a4" stroke-width="4" fill="none"/>
              <path d="M65 85 C 65 60, 135 60, 135 85" stroke="#101828" stroke-width="6" fill="none"/>
            </svg>`
  },
  {
    id: "dr-patel",
    name: "Dr. Ananya Patel",
    specialty: "Pediatrics",
    qualifications: "MD, Pediatrics",
    experience: 9,
    rating: 4.8,
    reviews: 215,
    nextSlot: "Tomorrow, 11:30 AM",
    avatar: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="90" fill="#f4f5f7"/>
              <path d="M60 170 C 60 130, 140 130, 140 170" fill="#1e3a8a"/>
              <circle cx="100" cy="85" r="35" fill="#fef3c7"/>
              <path d="M78 80 C 78 50, 122 50, 122 80" stroke="#1e293b" stroke-width="8" fill="none"/>
              <path d="M85 120 C 85 145, 115 145, 115 120" stroke="#00b3a4" stroke-width="4" fill="none"/>
            </svg>`
  },
  {
    id: "dr-mehta",
    name: "Dr. Vikram Mehta",
    specialty: "Cardiology",
    qualifications: "DM, Cardiology",
    experience: 15,
    rating: 4.95,
    reviews: 490,
    nextSlot: "Wed, 2:00 PM",
    avatar: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="90" fill="#f4f5f7"/>
              <path d="M60 170 C 60 130, 140 130, 140 170" fill="#312e81"/>
              <circle cx="100" cy="85" r="35" fill="#ffedd5"/>
              <path d="M80 120 C 80 140, 120 140, 120 120" stroke="#00b3a4" stroke-width="4" fill="none"/>
              <circle cx="100" cy="82" r="33" stroke="#111827" stroke-width="4" fill="none"/>
            </svg>`
  }
];

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "02:00 PM", "03:00 PM", "04:00 PM",
  "06:00 PM", "07:00 PM"
];

// Translation Mapping (EN, HI, MR, GU)
const TRANSLATIONS = {
  en: {
    brand: "Upchaar",
    nav_home: "Home",
    nav_features: "Features",
    nav_dashboards: "Dashboard",
    nav_analytics: "AI Analytics",
    nav_doctors: "Doctors",
    nav_contact: "Contact",
    cta_book: "Book Appointment",
    cta_demo: "Watch Demo",
    hero_badge: "Next-Generation Clinic Operating System",
    hero_title: "Healthcare Reimagined with <span>Artificial Intelligence</span>",
    hero_subheading: "Manage appointments, digital prescriptions, patient records, ABHA integration, AI medical assistance, multilingual support, smart queue management, and complete clinic operations—all in one intelligent platform.",
    hero_stat_wait: "Avg Waiting Time",
    hero_stat_happy: "Patient Satisfaction",
    hero_stat_consult: "Consultations Made",
    hud_queue_lbl: "Queue Status",
    hud_queue_val: "Dr. Sharma (2 Patients)",
    hud_abha_lbl: "ABHA Sync Status",
    hud_abha_val: "Encrypted & Secure",
    features_badge: "Platform Features",
    features_title: "10 Smart AI Tools for Modern Clinics",
    features_subheading: "Explore all our unified intelligent platform modules, specifically designed to automate management and administrative tasks.",
    feat_voice_title: "AI Voice Prescription",
    feat_voice_desc: "Doctor speaks naturally. Our AI automatically extracts symptoms, diagnosis, and medicines, generating digital prescriptions.",
    feat_voice_sandbox: "Click microphone to simulate doctor speaking...",
    feat_abha_title: "ABHA Integration",
    feat_abha_desc: "Link profiles using government-standard ABHA Health IDs. Fetch medical records, previous vaccinations, and clinic reports securely.",
    feat_abha_sandbox: "Retrieve government records instantly...",
    feat_records_title: "Digital Patient Profiles",
    feat_records_desc: "Unified chronological health timeline displaying previous visits, lab results, allergies, and family history in one screen.",
    feat_records_btn: "View Timeline",
    feat_appoint_title: "Smart Appointment Calendars",
    feat_appoint_desc: "Book or reschedule slots instantly. Automatic alerts ensure sync with Google Calendar and local reception terminals.",
    feat_queue_title: "Live Waiting Queue",
    feat_queue_desc: "Reduce clinic bottlenecks. Patients track live queue placement and estimated consult waiting times from home.",
    feat_queue_curr: "Current Active Token:",
    feat_queue_est: "Estimated Wait:",
    feat_ai_title: "24/7 AI Health Companion",
    feat_ai_desc: "Instant chat for symptom checks, calendar booking guidelines, prescription reminders, and clinic FAQ responses.",
    feat_ai_btn: "Chat with AI Assistant",
    feat_locker_title: "Digital Health Locker",
    feat_locker_desc: "Store and index prescriptions, blood test sheets, MRI scans, and clinic bills. Everything is encrypted and connected to your ABHA profile.",
    feat_locker_click: "Click to upload mock reports",
    feat_ocr_title: "AI Prescription OCR",
    feat_ocr_desc: "Scan and digitize handwriting. AI analyzes scanned pages to extract doctor credentials, names, and medicines.",
    feat_ocr_btn: "Simulate Scanning Doctor Note",
    feat_qr_title: "QR Smart Check-in",
    feat_qr_desc: "Fast contactless check-ins. Patients scan their check-in codes at the front desk to automatically log arrival and update the queue.",
    feat_qr_btn: "Generate My Check-in QR",
    feat_lang_title: "Multi-Language Engines",
    feat_lang_desc: "Instant localized layouts. Change site language dynamically, making UI accessible in regional languages.",
    dash_badge: "Role Previews",
    dash_title: "Interactive Roles Console",
    dash_subheading: "Switch roles below to explore distinct operational perspectives configured for clinicians, receptionists, and patient users.",
    dash_tab_doctor: "Doctor Dashboard",
    dash_tab_reception: "Reception Dashboard",
    dash_tab_patient: "Patient Dashboard",
    dash_doc_title: "Dr. Aarav Sharma",
    dash_doc_sub: "OPD Terminal • Cardiology Division",
    dash_doc_active: "Active Duty",
    dash_stat_today: "Today's Patients",
    dash_stat_revenue: "Today's Revenue",
    dash_stat_active: "Queue Waiting",
    dash_doc_patient_list: "Today's Appointments Queue",
    dash_rec_title: "Reception Terminal",
    dash_rec_sub: "Front Desk Operations • Main Lobby",
    dash_rec_total: "Total Checked In",
    dash_rec_waiting: "Average Wait",
    dash_rec_collected: "Bills Generated",
    dash_rec_walkin_title: "Walk-In Patient Check-In",
    dash_rec_name_lbl: "Patient Name",
    dash_rec_doc_lbl: "Select Doctor",
    dash_rec_btn: "Generate Token",
    dash_pat_title: "Patient Profile: Rahul Verma",
    dash_pat_sub: "ABHA Linked Profile: 12-8840-2384-9012",
    dash_pat_last: "Last Checkup",
    dash_pat_next: "Next Consultation",
    dash_pat_meds: "Active Medications",
    dash_pat_current_title: "Current Digital Prescriptions",
    anal_badge: "Dynamic Analytics",
    anal_title: "Real-Time Operations Tracking",
    anal_subheading: "Generate actionable insights automatically. Evaluate diagnostic trends, peak slot hours, and doctor productivity curves in real-time.",
    anal_btn_patients: "Patient Volume",
    anal_btn_revenue: "Revenue Reports",
    anal_chart_title: "Average Patient Load (Weekly)",
    why_badge: "Why Upchaar",
    why_title: "Designed to Optimize Clinical Workflow",
    why_subheading: "We merge medical expertise with cloud orchestration and local frontend terminals to build a seamless clinic infrastructure.",
    why_card1_title: "AI Voice Transcription",
    why_card1_desc: "Converts natural verbal consultation into valid structured digital prescriptions inside patient portals.",
    why_card2_title: "Govt. ABHA Syncing",
    why_card2_desc: "Fully compliant and secure fetching of national digital health logs using standardized authentication pathways.",
    why_card3_title: "Zero Waiting Rooms",
    why_card3_desc: "Contactless QR code scans checking in patients to live updated timelines automatically.",
    doctors_badge: "Specialists",
    doctors_title: "Consult Our Verified Clinicians",
    doctors_subheading: "Connect with highly qualified medical practitioners and schedule immediate clinical reviews.",
    test_badge: "Patient Stories",
    test_title: "Trust by Clinicians & Patients",
    faq_badge: "FAQ",
    faq_title: "Frequently Asked Questions",
    faq_q1: "What is ABHA and how does it integrate with Upchaar?",
    faq_a1: "ABHA (Ayushman Bharat Health Account) is a national digital health identity. Upchaar syncs with your ABHA ID to retrieve health records and share prescriptions securely.",
    faq_q2: "How accurate is the AI Voice Prescription feature?",
    faq_a2: "Our clinic model transcribes voice inputs with high accuracy, automatically sorting speech into symptoms, diagnoses, and medical dosages.",
    faq_q3: "Is patient data stored securely on the cloud?",
    faq_a3: "Yes, patient logs and medical lockers are protected using end-to-end cloud encryption, strictly meeting state data security guidelines.",
    contact_badge: "Contact Us",
    contact_title: "Get in Touch",
    contact_subtitle: "Send us a message",
    contact_btn: "Send Message",
    wizard_step1: "1. Date & Time",
    wizard_step2: "2. Details",
    wizard_step3: "3. Confirmed",
    wizard_choose_date: "Select Appointment Date",
    wizard_choose_time: "Choose Time Slot",
    wizard_btn_continue: "Continue",
    wizard_patient_info: "Patient Information",
    wizard_label_name: "Full Name",
    wizard_label_phone: "Phone Number",
    wizard_label_email: "Email",
    wizard_label_reason: "Reason for Visit (Optional)",
    wizard_btn_back: "Back",
    wizard_btn_confirm: "Confirm Booking",
    wizard_success_title: "Appointment Confirmed!",
    wizard_success_desc: "Your appointment is scheduled. We have sent a confirmation message to your registered phone.",
    receipt_ref: "Reference ID",
    receipt_doctor: "Doctor",
    receipt_datetime: "Date & Time",
    receipt_patient: "Patient",
    wizard_btn_done: "Done",
    wizard_btn_print: "Print Receipt",
    demo_title: "Upchaar Platform Walkthrough",
    demo_playback: "Play Demo Video (2:30 min)",
    chat_header: "Upchaar AI Assistant",
    chat_greeting: "Hello! I am Upchaar AI. I can help you schedule appointments, query ABHA details, or explain clinic guidelines. What can I do for you today?",
    footer_brand_desc: "Premium, next-generation AI-powered medical platform designed for modern clinics and secure patient health data orchestration.",
    footer_newsletter_btn: "Subscribe",
    footer_col_platform: "Platform",
    footer_link_features: "Features",
    footer_link_dashboards: "Dashboards",
    footer_link_analytics: "AI Analytics",
    footer_col_resources: "Resources",
    footer_link_abha: "ABHA Sync",
    footer_link_security: "Security Logs",
    footer_col_company: "Company",
    footer_link_about: "About Us",
    footer_link_careers: "Careers",
    footer_col_legal: "Legal",
    footer_link_privacy: "Privacy Policy",
    footer_link_terms: "Terms of Use",
    footer_tag: "Smart Health Orchestration"
  },
  hi: {
    brand: "उपचार",
    nav_home: "मुख्य पृष्ठ",
    nav_features: "विशेषताएं",
    nav_dashboards: "डैशबोर्ड",
    nav_analytics: "एआई विश्लेषण",
    nav_doctors: "डॉक्टर",
    nav_contact: "संपर्क",
    cta_book: "अपॉइंटमेंट बुक करें",
    cta_demo: "डेमो देखें",
    hero_badge: "अगली पीढ़ी का क्लिनिक ऑपरेटिंग सिस्टम",
    hero_title: "स्वास्थ्य सेवा में <span>आर्टिफिशियल इंटेलिजेंस</span> का नया रूप",
    hero_subheading: "अपॉइंटमेंट, डिजिटल नुस्खे, मरीज के रिकॉर्ड, आभा (ABHA) एकीकरण, एआई चिकित्सा सहायता, बहुभाषी समर्थन, स्मार्ट कतार प्रबंधन और संपूर्ण क्लिनिक संचालन का प्रबंधन - सब कुछ एक ही स्थान पर।",
    hero_stat_wait: "औसत प्रतीक्षा समय",
    hero_stat_happy: "मरीज संतुष्टि",
    hero_stat_consult: "परामर्श किए गए",
    hud_queue_lbl: "कतार की स्थिति",
    hud_queue_val: "डॉ. शर्मा (2 मरीज)",
    hud_abha_lbl: "आभा सिंक स्थिति",
    hud_abha_val: "सुरक्षित और एन्क्रिप्टेड",
    features_badge: "प्लेटफ़ॉर्म विशेषताएं",
    features_title: "आधुनिक क्लीनिकों के लिए 10 स्मार्ट एआई उपकरण",
    features_subheading: "प्रबंधन और प्रशासनिक कार्यों को स्वचालित करने के लिए डिज़ाइन किए गए सभी एकीकृत मॉड्यूल का अन्वेषण करें।",
    feat_voice_title: "एआई वॉयस प्रिस्क्रिप्शन",
    feat_voice_desc: "डॉक्टर सामान्य रूप से बोलते हैं। हमारा एआई स्वचालित रूप से लक्षणों, निदान और दवाओं को निकालता है और पर्चे उत्पन्न करता है।",
    feat_voice_sandbox: "डॉक्टर की आवाज का अनुकरण करने के लिए माइक पर क्लिक करें...",
    feat_abha_title: "आभा (ABHA) एकीकरण",
    feat_abha_desc: "सरकारी मानक आभा आईडी का उपयोग करके प्रोफाइल लिंक करें। मरीज की चिकित्सा इतिहास और टीकाकरण रिपोर्ट सुरक्षित रूप से प्राप्त करें।",
    feat_abha_sandbox: "सरकारी रिकॉर्ड तुरंत प्राप्त करें...",
    feat_records_title: "डिजिटल रोगी प्रोफाइल",
    feat_records_desc: "एक ही स्क्रीन में पिछले दौरे, लैब परिणाम, एलर्जी और पारिवारिक इतिहास को प्रदर्शित करने वाली एकीकृत स्वास्थ्य समयरेखा।",
    feat_records_btn: "समयरेखा देखें",
    feat_appoint_title: "स्मार्ट अपॉइंटमेंट कैलेंडर",
    feat_appoint_desc: "तुरंत अपॉइंटमेंट बुक करें या पुनर्निर्धारित करें। स्वचालित अलर्ट Google कैलेंडर और स्थानीय टर्मिनल के साथ सिंक सुनिश्चित करते हैं।",
    feat_queue_title: "लाइव प्रतीक्षा कतार",
    feat_queue_desc: "क्लीनिकों में भीड़ कम करें। मरीज घर बैठे लाइव कतार की स्थिति और अनुमानित प्रतीक्षा समय को ट्रैक कर सकते हैं।",
    feat_queue_curr: "सक्रिय टोकन संख्या:",
    feat_queue_est: "अनुमानित प्रतीक्षा समय:",
    feat_ai_title: "24/7 एआई स्वास्थ्य सहायक",
    feat_ai_desc: "लक्षण जांच, कैलेंडर बुकिंग दिशा-निर्देश, नुस्खे अनुस्मारक और क्लिनिक अक्सर पूछे जाने वाले प्रश्नों के लिए तत्काल चैट।",
    feat_ai_btn: "एआई सहायक के साथ चैट करें",
    feat_locker_title: "डिजिटल हेल्थ लॉकर",
    feat_locker_desc: "पर्चे, रक्त परीक्षण रिपोर्ट, एमआरआई स्कैन और क्लिनिक बिल स्टोर करें। सब कुछ एन्क्रिप्टेड है और आभा आईडी से जुड़ा हुआ है।",
    feat_locker_click: "मॉक रिपोर्ट अपलोड करने के लिए क्लिक करें",
    feat_ocr_title: "एआई प्रिस्क्रिप्शन ओसीआर",
    feat_ocr_desc: "हस्तलेखन को स्कैन और डिजिटाइज़ करें। एआई डॉक्टर के विवरण और दवा के नाम निकालने के लिए स्कैन किए गए पृष्ठों का विश्लेषण करता है।",
    feat_ocr_btn: "डॉक्टर के पर्चे का अनुकरण करें",
    feat_qr_title: "क्यूआर स्मार्ट चेक-इन",
    feat_qr_desc: "संपर्क रहित चेक-इन। मरीज आगमन दर्ज करने और कतार को अपडेट करने के लिए रिसेप्शन पर अपने चेक-इन कोड को स्कैन करते हैं।",
    feat_qr_btn: "अपना चेक-इन क्यूआर जनरेट करें",
    feat_lang_title: "बहुभाषी अनुवाद इंजन",
    feat_lang_desc: "क्षेत्रीय भाषाओं में यूआई को सुलभ बनाने के लिए, पूरे पृष्ठ की भाषा को तुरंत और गतिशील रूप से बदलें।",
    dash_badge: "भूमिका पूर्वावलोकन",
    dash_title: "इंटरैक्टिव भूमिकाएँ कंसोल",
    dash_subheading: "चिकित्सकों, रिसेप्शनिस्टों और रोगियों के लिए कॉन्फ़िगर किए गए विभिन्न परिचालन दृष्टिकोणों को देखने के लिए भूमिकाएं बदलें।",
    dash_tab_doctor: "डॉक्टर डैशबोर्ड",
    dash_tab_reception: "रिसेप्शन डैशबोर्ड",
    dash_tab_patient: "रोगी डैशबोर्ड",
    dash_doc_title: "डॉ. आरव शर्मा",
    dash_doc_sub: "ओपीडी टर्मिनल • कार्डियोलॉजी विभाग",
    dash_doc_active: "ड्यूटी पर सक्रिय",
    dash_stat_today: "आज के मरीज",
    dash_stat_revenue: "आज का राजस्व",
    dash_stat_active: "कतार प्रतीक्षा",
    dash_doc_patient_list: "आज की नियुक्तियों की कतार",
    dash_rec_title: "रिसेप्शन टर्मिनल",
    dash_rec_sub: "फ्रंट डेस्क संचालन • मुख्य लॉबी",
    dash_rec_total: "कुल चेक-इन",
    dash_rec_waiting: "औसत प्रतीक्षा समय",
    dash_rec_collected: "बिल उत्पन्न",
    dash_rec_walkin_title: "वॉक-इन मरीज चेक-इन",
    dash_rec_name_lbl: "रोगी का नाम",
    dash_rec_doc_lbl: "डॉक्टर चुनें",
    dash_rec_btn: "टोकन जनरेट करें",
    dash_pat_title: "रोगी प्रोफ़ाइल: राहुल वर्मा",
    dash_pat_sub: "आभा लिंक्ड प्रोफाइल: 12-8840-2384-9012",
    dash_pat_last: "पिछली जांच",
    dash_pat_next: "अगला परामर्श",
    dash_pat_meds: "सक्रिय दवाएं",
    dash_pat_current_title: "वर्तमान डिजिटल नुस्खे",
    anal_badge: "गतिशील विश्लेषिकी",
    anal_title: "वास्तविक समय संचालन ट्रैकिंग",
    anal_subheading: "स्वचालित रूप से कार्रवाई योग्य अंतर्दृष्टि उत्पन्न करें। वास्तविक समय में डॉक्टर की उत्पादकता और नैदानिक प्रवृत्तियों का मूल्यांकन करें।",
    anal_btn_patients: "मरीजों की संख्या",
    anal_btn_revenue: "राजस्व रिपोर्ट",
    anal_chart_title: "औसत रोगी लोड (साप्ताहिक)",
    why_badge: "उपचार क्यों",
    why_title: "क्लिनिकल वर्कफ़्लो को अनुकूलित करने के लिए डिज़ाइन किया गया",
    why_subheading: "हम एक निर्बाध क्लिनिक बुनियादी ढांचे के निर्माण के लिए चिकित्सा विशेषज्ञता को क्लाउड और स्थानीय टर्मिनलों के साथ मिलाते हैं।",
    why_card1_title: "एआई वॉयस ट्रांसक्रिप्शन",
    why_card1_desc: "प्राकृतिक मौखिक परामर्श को मरीज के पोर्टल के अंदर वैध संरचित डिजिटल नुस्खों में परिवर्तित करता है।",
    why_card2_title: "सरकारी आभा सिंकिंग",
    why_card2_desc: "मानकीकृत प्रमाणीकरण मार्गों का उपयोग करके राष्ट्रीय डिजिटल स्वास्थ्य लॉग प्राप्त करना पूरी तरह से सुरक्षित और अनुपालनशील है।",
    why_card3_title: "शून्य प्रतीक्षा कक्ष",
    why_card3_desc: "संपर्क रहित क्यूआर कोड मरीजों को कतार में स्वचालित रूप से दर्ज कर देता है।",
    doctors_badge: "विशेषज्ञ",
    doctors_title: "हमारे सत्यापित चिकित्सकों से परामर्श लें",
    doctors_subheading: "अत्यधिक योग्य चिकित्सा पेशेवरों से जुड़ें और तत्काल नैदानिक समीक्षा निर्धारित करें।",
    test_badge: "संतुष्ट मरीज",
    test_title: "चिकित्सकों और मरीजों द्वारा विश्वसनीय",
    faq_badge: "अक्सर पूछे जाने वाले प्रश्न",
    faq_title: "सामान्यतः पूछे जाने वाले प्रश्न",
    faq_q1: "आभा (ABHA) क्या है और यह उपचार के साथ कैसे एकीकृत होता है?",
    faq_a1: "आभा एक राष्ट्रीय डिजिटल स्वास्थ्य पहचान है। उपचार आपके स्वास्थ्य रिकॉर्ड को सुरक्षित रूप से सिंक और साझा करने के लिए आपकी आभा आईडी का उपयोग करता है।",
    faq_q2: "एआई वॉयस प्रिस्क्रिप्शन सुविधा कितनी सटीक है?",
    faq_a2: "हमारा क्लिनिक मॉडल आवाज इनपुट को उच्च सटीकता के साथ ट्रांसक्राइब करता है, और दवाओं के नाम और खुराक को वर्गीकृत करता है।",
    faq_q3: "क्या मरीज का डेटा क्लाउड पर सुरक्षित रूप से संग्रहीत है?",
    faq_a3: "हाँ, मरीज के रिकॉर्ड और मेडिकल लॉकर एंड-टू-एंड एन्क्रिप्शन द्वारा सुरक्षित हैं, जो सख्त सुरक्षा दिशानिर्देशों को पूरा करते हैं।",
    contact_badge: "संपर्क करें",
    contact_title: "संपर्क में रहें",
    contact_subtitle: "हमें संदेश भेजें",
    contact_btn: "संदेश भेजें",
    wizard_step1: "1. दिनांक और समय",
    wizard_step2: "2. विवरण",
    wizard_step3: "3. पुष्टि की गई",
    wizard_choose_date: "अपॉइंटमेंट की तिथि चुनें",
    wizard_choose_time: "समय स्लॉट चुनें",
    wizard_btn_continue: "जारी रखें",
    wizard_patient_info: "रोगी की जानकारी",
    wizard_label_name: "पूरा नाम",
    wizard_label_phone: "फ़ोन नंबर",
    wizard_label_email: "ईमेल",
    wizard_label_reason: "यात्रा का कारण (वैकल्पिक)",
    wizard_btn_back: "पीछे",
    wizard_btn_confirm: "बुकिंग की पुष्टि करें",
    wizard_success_title: "नियुक्ति की पुष्टि हो गई!",
    wizard_success_desc: "आपकी नियुक्ति निर्धारित हो गई है। हमने आपके पंजीकृत फोन पर एक पुष्टिकरण संदेश भेजा है।",
    receipt_ref: "संदर्भ आईडी",
    receipt_doctor: "डॉक्टर",
    receipt_datetime: "दिनांक और समय",
    receipt_patient: "रोगी",
    wizard_btn_done: "पूर्ण",
    wizard_btn_print: "रसीद मुद्रित करें",
    demo_title: "उपचार प्लेटफॉर्म का पूर्वावलोकन",
    demo_playback: "डेमो वीडियो चलाएं (2:30 मिनट)",
    chat_header: "उपचार एआई सहायक",
    chat_greeting: "नमस्ते! मैं उपचार एआई हूं। मैं नियुक्तियों को शेड्यूल करने, आभा विवरण खोजने या क्लिनिक दिशानिर्देशों को समझाने में मदद कर सकता हूं। आज मैं आपके लिए क्या कर सकता हूं?",
    footer_brand_desc: "आधुनिक क्लीनिकों और सुरक्षित रोगी डेटा के लिए डिज़ाइन किया गया प्रीमियम, अगली पीढ़ी का एआई-संचालित चिकित्सा मंच।",
    footer_newsletter_btn: "सदस्यता लें",
    footer_col_platform: "प्लेटफ़ॉर्म",
    footer_link_features: "विशेषताएं",
    footer_link_dashboards: "डैशबोर्ड",
    footer_link_analytics: "विश्लेषण",
    footer_col_resources: "संसाधन",
    footer_link_abha: "आभा सिंक",
    footer_link_security: "सुरक्षा लॉग",
    footer_col_company: "कंपनी",
    footer_link_about: "हमारे बारे में",
    footer_link_careers: "करियर",
    footer_col_legal: "कानूनी",
    footer_link_privacy: "गोपनीयता नीति",
    footer_link_terms: "उपयोग की शर्तें",
    footer_tag: "स्मार्ट स्वास्थ्य प्रबंधन"
  }
};

// Add Marathi and Gujarati languages mapping dynamically
TRANSLATIONS.mr = { ...TRANSLATIONS.hi, brand: "उपचार", nav_home: "मुख्य पृष्ठ", cta_book: "अपॉइंटमेंट बुक करा" };
TRANSLATIONS.gu = { ...TRANSLATIONS.hi, brand: "ઉપચાર", nav_home: "મુખ્ય પૃષ્ઠ", cta_book: "એપોઇન્ટમેન્ટ બુક કરો" };

// ==========================================================================
// STATE MANAGEMENT & GLOBALS
// ==========================================================================
let currentLanguage = 'en';
let currentTheme = 'light';
let selectedDoctor = null;
let selectedDate = null;
let selectedTime = null;
let activeRole = 'doctor';
let chartState = 'patients';

const MOCK_PATIENTS = {
  doctor: [
    { name: "Rahul Verma", time: "09:00 AM", token: "#A-14", status: "In Consultation" },
    { name: "Priya Sen", time: "10:00 AM", token: "#A-15", status: "Waiting" },
    { name: "Amit Sharma", time: "11:30 AM", token: "#A-16", status: "Waiting" }
  ],
  reception: [
    { name: "Suresh Patil", doctor: "Dr. Sharma", status: "Token Generated" },
    { name: "Neha Joshi", doctor: "Dr. Patel", status: "Lobby" }
  ]
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initDashboards();
  initAnalyticsCharts();
  renderDoctorsList();
  initAccordions();
  initFloatingAI();
  initFeatureSandboxes();
  initModalListeners();
  initScrollAnimations();
  initExtraFeatures();
});

// ==========================================================================
// THEME & LANGUAGE CONTROLLERS
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  document.getElementById('themeToggle').addEventListener('click', () => {
    const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(targetTheme);
  });
}

function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  const themeToggle = document.getElementById('themeToggle');
  if (theme === 'dark') {
    themeToggle.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    `;
  } else {
    themeToggle.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>
    `;
  }
}

function initLanguage() {
  const langSelector = document.getElementById('langSelector');
  langSelector.value = currentLanguage;

  langSelector.addEventListener('change', (e) => {
    setLanguage(e.target.value);
  });

  document.querySelectorAll('.lang-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
      langSelector.value = lang;
    });
  });
}

function setLanguage(lang) {
  currentLanguage = lang;
  const translationSet = TRANSLATIONS[lang] || TRANSLATIONS.en;

  document.querySelectorAll('[data-tr]').forEach(element => {
    const key = element.getAttribute('data-tr');
    if (translationSet[key]) {
      element.innerHTML = translationSet[key];
    }
  });

  // Re-render components relying on translations
  initDashboards();
}

// ==========================================================================
// ROLE BASED DASHBOARD MANAGER
// ==========================================================================
function initDashboards() {
  document.querySelectorAll('.dash-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.dash-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetRole = btn.getAttribute('data-role');
      activeRole = targetRole;

      document.querySelectorAll('.dashboard-screen').forEach(screen => screen.classList.remove('active'));
      document.getElementById(`screen-${targetRole}`).classList.add('active');

      renderDashboardState();
    });
  });

  renderDashboardState();
}

function renderDashboardState() {
  if (activeRole === 'doctor') {
    const patientList = document.getElementById('doctorPatientList');
    patientList.innerHTML = '';
    
    MOCK_PATIENTS.doctor.forEach(pat => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.padding = '12px 16px';
      item.style.background = 'var(--bg-secondary)';
      item.style.border = '1px solid var(--border-color)';
      item.style.borderRadius = '8px';
      item.innerHTML = `
        <div>
          <strong style="font-size: 14px;">${pat.name}</strong>
          <span style="font-size: 11px; margin-left: 8px; color: var(--text-tertiary);">${pat.time}</span>
        </div>
        <span class="badge" style="margin: 0; background: ${pat.status === 'In Consultation' ? 'var(--accent-light)' : 'var(--bg-tertiary)'}; color: ${pat.status === 'In Consultation' ? 'var(--accent-color)' : 'var(--text-secondary)'};">${pat.status}</span>
      `;
      patientList.appendChild(item);
    });
  }

  // Handle front desk form
  const checkinForm = document.getElementById('receptionCheckinForm');
  if (checkinForm) {
    checkinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientName = document.getElementById('recPatientName').value;
      if (patientName) {
        alert(`Token generated successfully for ${patientName}! Added to queue.`);
        document.getElementById('recPatientName').value = '';
      }
    });
  }
}

// ==========================================================================
// DYNAMIC SVG ANALYTICS CHARTS
// ==========================================================================
function initAnalyticsCharts() {
  document.getElementById('btnFilterPatients').addEventListener('click', () => {
    chartState = 'patients';
    document.getElementById('chartTitle').textContent = 'Average Patient Load (Weekly)';
    renderAnalyticsCharts();
  });

  document.getElementById('btnFilterRevenue').addEventListener('click', () => {
    chartState = 'revenue';
    document.getElementById('chartTitle').textContent = 'Revenue Forecast ($ thousands)';
    renderAnalyticsCharts();
  });

  renderAnalyticsCharts();
}

function renderAnalyticsCharts() {
  const container = document.getElementById('barChartContainer');
  container.innerHTML = '';

  const data = chartState === 'patients' 
    ? [
        { label: 'Mon', val: 75 },
        { label: 'Tue', val: 90 },
        { label: 'Wed', val: 55 },
        { label: 'Thu', val: 80 },
        { label: 'Fri', val: 120 },
        { label: 'Sat', val: 40 }
      ]
    : [
        { label: 'Jan', val: 50 },
        { label: 'Feb', val: 65 },
        { label: 'Mar', val: 80 },
        { label: 'Apr', val: 75 },
        { label: 'May', val: 110 },
        { label: 'Jun', val: 140 }
      ];

  data.forEach(item => {
    const barCol = document.createElement('div');
    barCol.className = 'bar-column';
    barCol.innerHTML = `
      <div class="bar-rect" style="height: ${item.val}%"></div>
      <span class="bar-label">${item.label}</span>
    `;
    container.appendChild(barCol);
  });
}

// ==========================================================================
// SANDBOX MICRO-APPS (FEATURES CARDS INTERACTION)
// ==========================================================================
function initFeatureSandboxes() {
  // 1. Voice Prescription Simulation
  const micBtn = document.getElementById('voiceMicBtn');
  const prescriptionResult = document.getElementById('voicePrescriptionResult');
  let isRecording = false;

  micBtn.addEventListener('click', () => {
    isRecording = !isRecording;
    if (isRecording) {
      micBtn.classList.add('recording');
      prescriptionResult.innerHTML = 'Listening to doctor speech...';
      
      setTimeout(() => {
        prescriptionResult.innerHTML = `
[AI EXTRACTED PRESCRIPTION]
Diagnosis: Acute Migraine
Medicines:
1. Ibuprofen 400mg (1-0-1) - 3 Days
2. Domperidone 10mg (1-0-0) - 3 Days
Advice: Hydrate well, avoid bright screen lights.
Follow-up: 5 Days
        `;
        micBtn.classList.remove('recording');
        isRecording = false;
      }, 3000);
    }
  });

  // 2. ABHA Record Fetch Mock
  const abhaVerifyBtn = document.getElementById('abhaVerifyBtn');
  const abhaOutput = document.getElementById('abhaRecordOutput');

  abhaVerifyBtn.addEventListener('click', () => {
    const val = document.getElementById('abhaIdInput').value;
    if (!val) {
      abhaOutput.innerHTML = 'Error: Please enter a valid 14-digit ABHA Number.';
      return;
    }
    abhaOutput.innerHTML = 'Connecting to Health Locker gateway...';
    setTimeout(() => {
      abhaOutput.innerHTML = `
[ABHA LINKED DATA]
Owner Name: Rahul Verma
Age/Gender: 28 / Male
Blood Group: A+
Vaccinations: Covishield (2 Doses)
Allergies: Penicillin
Status: Authenticated Sync Active
      `;
    }, 2000);
  });

  // 8. OCR Prescription Scanner
  const simulateOcrBtn = document.getElementById('simulateOcrBtn');
  const ocrOutput = document.getElementById('ocrOutputResult');

  simulateOcrBtn.addEventListener('click', () => {
    ocrOutput.innerHTML = 'Analyzing handwriting lines...';
    setTimeout(() => {
      ocrOutput.innerHTML = `
[OCR SCAN COMPLETED]
Doctor: Dr. Aarav Sharma
Patient Name: Rahul Verma
Medicines Extracted:
• Paracetamol 650mg - 10 tabs
• Vitamin C 500mg - 15 tabs
Confidence Level: 98.4%
      `;
    }, 2500);
  });

  // 9. QR Check-in Generator
  const generateQrBtn = document.getElementById('generateQrBtn');
  const qrCodeContainer = document.getElementById('qrCodeContainer');

  generateQrBtn.addEventListener('click', () => {
    generateQrBtn.style.display = 'none';
    qrCodeContainer.style.display = 'block';
  });
}

// ==========================================================================
// FLOATING AI CHAT ASSISTANT
// ==========================================================================
function initFloatingAI() {
  const trigger = document.getElementById('aiTrigger');
  const win = document.getElementById('aiChatWindow');
  const closeBtn = document.getElementById('aiChatClose');
  const openChatSandboxBtn = document.getElementById('openChatSandboxBtn');

  const toggleChat = () => win.classList.toggle('open');

  trigger.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', () => win.classList.remove('open'));
  openChatSandboxBtn.addEventListener('click', () => win.classList.add('open'));

  // Chat message sending
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  const messagesBox = document.getElementById('chatMessages');

  const sendMessage = () => {
    const val = input.value.trim();
    if (!val) return;

    // Render user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-bubble user';
    userMsg.textContent = val;
    messagesBox.appendChild(userMsg);
    input.value = '';
    
    // Auto scroll
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Simulate smart replies
    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-bubble bot';
      
      const query = val.toLowerCase();
      if (query.includes('book') || query.includes('appoint')) {
        botMsg.innerHTML = 'I can help you book! Click <strong class="btn-book-trigger" style="color: var(--accent-color); cursor: pointer;">here</strong> to open our scheduling panel.';
        // Re-bind click event to text
        setTimeout(() => {
          botMsg.querySelector('.btn-book-trigger').addEventListener('click', () => {
            win.classList.remove('open');
            openBookingModal(DOCTORS[0]);
          });
        }, 100);
      } else if (query.includes('abha')) {
        botMsg.textContent = 'ABHA lets you sync your medical cards. You can test it on our ABHA feature card by entering your 14-digit health ID.';
      } else {
        botMsg.textContent = 'Our clinic offers smart queue management and voice prescriptions. You can schedule appointments directly here.';
      }

      messagesBox.appendChild(botMsg);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 1500);
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

// ==========================================================================
// APPOINTMENT BOOKING WIZARD MODAL
// ==========================================================================
function renderDoctorsList() {
  const list = document.getElementById('doctors-list');
  list.innerHTML = '';

  DOCTORS.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'doctor-card glass-card reveal';
    card.innerHTML = `
      <div class="doctor-avatar-wrapper">
        ${doc.avatar}
      </div>
      <div class="doctor-info">
        <span class="doc-tag">${doc.specialty}</span>
        <h3>${doc.name}</h3>
        <p class="doc-meta">${doc.qualifications} &bull; ${doc.experience} yrs exp</p>
        <div class="doc-rating">
          <span class="stars">★★★★★</span>
          <span class="rating-num">${doc.rating}</span>
        </div>
        <div class="doc-availability">
          <span class="pulse-green"></span>
          <span>Next Slot: ${doc.nextSlot}</span>
        </div>
        <button class="btn btn-secondary btn-book-now" data-id="${doc.id}">Book Now</button>
      </div>
    `;
    list.appendChild(card);
  });

  // Attach listener
  document.querySelectorAll('.btn-book-now').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const docId = btn.getAttribute('data-id');
      const doc = DOCTORS.find(d => d.id === docId);
      if (doc) openBookingModal(doc);
    });
  });
}

function openBookingModal(doctor) {
  selectedDoctor = doctor;
  selectedDate = null;
  selectedTime = null;
  
  document.getElementById('modal-doctor-name').textContent = doctor.name;
  document.getElementById('modal-doctor-specialty').textContent = doctor.specialty;
  document.querySelector('.modal-doctor-avatar').innerHTML = doctor.avatar;

  generateWizardCalendar();
  
  // Reset Step states
  document.getElementById('time-slots-container').innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-tertiary);">Select date first.</p>';
  document.getElementById('btn-next-step').disabled = true;
  goToWizardStep(1);

  document.getElementById('booking-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  document.getElementById('booking-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function initModalListeners() {
  document.querySelectorAll('.btn-book-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      openBookingModal(DOCTORS[0]);
    });
  });

  document.getElementById('modal-close').addEventListener('click', closeBookingModal);
  document.getElementById('booking-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('booking-modal')) closeBookingModal();
  });

  document.getElementById('btn-next-step').addEventListener('click', () => {
    if (selectedDate && selectedTime) goToWizardStep(2);
  });

  document.getElementById('btn-prev-step').addEventListener('click', () => {
    goToWizardStep(1);
  });

  document.getElementById('booking-details-form').addEventListener('submit', (e) => {
    e.preventDefault();
    submitAppointmentForm();
  });

  document.getElementById('btn-booking-done').addEventListener('click', () => {
    document.getElementById('booking-details-form').reset();
    closeBookingModal();
  });

  // Watch Demo Modal
  const demoModal = document.getElementById('demo-modal');
  document.getElementById('watchDemoBtn').addEventListener('click', () => {
    demoModal.classList.add('open');
  });
  document.getElementById('demo-modal-close').addEventListener('click', () => {
    demoModal.classList.remove('open');
  });
}

function goToWizardStep(step) {
  document.querySelectorAll('.step-indicator').forEach(ind => {
    const s = parseInt(ind.getAttribute('data-step'));
    ind.classList.remove('active', 'completed');
    if (s === step) ind.classList.add('active');
    else if (s < step) ind.classList.add('completed');
  });

  document.querySelectorAll('.wizard-step-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(`pane-step-${step}`).classList.add('active');
}

function generateWizardCalendar() {
  const container = document.getElementById('calendar-grid');
  container.innerHTML = '';

  const today = new Date();
  for (let i = 1; i <= 8; i++) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + i);

    if (targetDate.getDay() !== 0) { // Skip Sundays
      const dayNum = targetDate.getDate();
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = targetDate.toLocaleDateString('en-US', { month: 'short' });
      const dateVal = `${monthName} ${dayNum}, ${targetDate.getFullYear()}`;

      const btn = document.createElement('button');
      btn.className = 'calendar-day-btn';
      btn.type = 'button';
      btn.innerHTML = `<span class="day-name">${dayName}</span><span class="day-number">${dayNum}</span>`;
      
      btn.addEventListener('click', () => {
        document.querySelectorAll('.calendar-day-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        selectedDate = dateVal;
        selectedTime = null;
        document.getElementById('btn-next-step').disabled = true;

        renderTimeSlots();
      });

      container.appendChild(btn);
    }
  }
}

function renderTimeSlots() {
  const container = document.getElementById('time-slots-container');
  container.innerHTML = '';

  TIME_SLOTS.forEach(time => {
    const btn = document.createElement('button');
    btn.className = 'time-slot-btn';
    btn.type = 'button';
    btn.textContent = time;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      
      selectedTime = time;
      document.getElementById('btn-next-step').disabled = false;
    });

    container.appendChild(btn);
  });
}

function submitAppointmentForm() {
  const nameVal = document.getElementById('patient-name').value;
  const refId = `UPC-${Math.floor(10000 + Math.random() * 90000)}`;

  // Populate Receipt UI
  document.getElementById('receipt-ref-id').textContent = refId;
  document.getElementById('receipt-doctor-name').textContent = selectedDoctor.name;
  document.getElementById('receipt-date-time').textContent = `${selectedDate} at ${selectedTime}`;
  document.getElementById('receipt-patient-name').textContent = nameVal;

  goToWizardStep(3);
}

// ==========================================================================
// FAQ ACCORDIONS & ANIMATIONS
// ==========================================================================
function initAccordions() {
  document.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isActive = item.classList.contains('active');
      
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  
  const checkReveal = () => {
    const windowHeight = window.innerHeight;
    reveals.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      if (elementTop < windowHeight - 100) {
        element.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', checkReveal);
  checkReveal(); // Trigger once on load
}

// ==========================================================================
// EXTRA FUNCTIONALITIES (MOBILE NAV, LOCKER, TESTIMONIALS, CHECK-IN, ETC)
// ==========================================================================
const TESTIMONIALS = [
  { text: "The clinic has a fully white, clean aesthetic, and the appointment booking was incredibly smooth. Visited Dr. Sharma right on schedule!", user: "Rahul Verma", role: "Patient" },
  { text: "Amazing interface. Being able to choose slots online and immediately get confirmation saved me so much wait time in the clinic lobby.", user: "Priya Sen", role: "Patient" },
  { text: "As a clinician, Upchaar's AI voice prescription saves me hours of manual note-taking every single day. Recommended for all hospitals.", user: "Dr. Vikram Mehta", role: "Cardiologist" },
  { text: "Managing reception check-ins and walk-ins used to be chaotic. The smart queue and contactless QR check-in solved it for our staff.", user: "Neha Joshi", role: "Clinic Owner" }
];

function initExtraFeatures() {
  // Mobile Nav Toggle
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Populate Testimonials Carousel
  const carouselTrack = document.getElementById('testimonialCarouselTrack');
  if (carouselTrack) {
    carouselTrack.innerHTML = '';
    // Duplicate testimonials list twice to create infinite loop scroll
    const items = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];
    items.forEach(t => {
      const card = document.createElement('div');
      card.className = 'testimonial-box glass-card';
      card.innerHTML = `
        <div class="rating">★★★★★</div>
        <p>"${t.text}"</p>
        <div class="testimonial-user">
          <div class="testimonial-avatar" style="background: var(--accent-light); display:flex; align-items:center; justify-content:center; color: var(--accent-color); font-weight:700; font-size:12px;">
            ${t.user.charAt(0)}
          </div>
          <div class="user-details">
            <h5>${t.user}</h5>
            <span>${t.role}</span>
          </div>
        </div>
      `;
      carouselTrack.appendChild(card);
    });
  }

  // Patient Profile Selector
  const patientSelect = document.getElementById('patientProfileSelector');
  const patientOutput = document.getElementById('patientProfileOutput');
  if (patientSelect && patientOutput) {
    patientSelect.addEventListener('change', () => {
      const val = patientSelect.value;
      if (val === 'rahul') {
        patientOutput.innerHTML = 'Age: 28 | BP: 120/80 | History: Asthma | Last visit: Yesterday';
      } else if (val === 'priya') {
        patientOutput.innerHTML = 'Age: 24 | BP: 110/70 | History: Allergy to dust | Last visit: 2 weeks ago';
      }
    });
  }

  // Digital Locker Upload Simulator
  const lockerDrop = document.getElementById('lockerDropzone');
  const lockerList = document.getElementById('lockerFileList');
  if (lockerDrop && lockerList) {
    lockerDrop.addEventListener('click', () => {
      const mockFiles = [
        "MRI_BrainScan_July.pdf",
        "Chest_XRay_Report.pdf",
        "CompleteBloodCount_June.pdf"
      ];
      const selectedFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
      
      const fileRow = document.createElement('div');
      fileRow.style.display = 'flex';
      fileRow.style.justifyContent = 'space-between';
      fileRow.style.background = 'var(--bg-secondary)';
      fileRow.style.padding = '6px 12px';
      fileRow.style.borderRadius = '4px';
      fileRow.style.marginTop = '4px';
      fileRow.innerHTML = `
        <span>${selectedFile}</span>
        <span style="color: var(--success-color); font-weight:600;">✓ Uploaded</span>
      `;
      lockerList.appendChild(fileRow);
    });
  }

  // Contact Form Submission Handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you! Your message has been received. Our support team will contact you shortly.');
      contactForm.reset();
    });
  }

  // Live Queue Tracker ticking simulator
  const activeToken = document.getElementById('queueActiveToken');
  const estWait = document.getElementById('queueEstWait');
  if (activeToken && estWait) {
    let currentWait = 12;
    setInterval(() => {
      currentWait -= 1;
      if (currentWait < 2) {
        currentWait = 15;
        // Swap token
        activeToken.textContent = activeToken.textContent === '#A-14' ? '#A-15' : '#A-14';
      }
      estWait.textContent = `${currentWait} mins`;
    }, 15000); // Check every 15 seconds
  }

  // Scan check-in simulation trigger
  const qrBtn = document.getElementById('generateQrBtn');
  const qrBox = document.getElementById('qrCodeContainer');
  if (qrBtn && qrBox) {
    qrBtn.addEventListener('click', () => {
      // Check if scanner button already exists to avoid duplicates
      if (qrBox.querySelector('.sim-scan-btn')) return;
      
      const scanBtn = document.createElement('button');
      scanBtn.className = 'btn btn-secondary sim-scan-btn';
      scanBtn.style.width = '100%';
      scanBtn.style.marginTop = '10px';
      scanBtn.style.fontSize = '11px';
      scanBtn.textContent = 'Simulate Front Desk Scanner';
      scanBtn.addEventListener('click', () => {
        alert('Check-in Successful! Token #A-18 generated. Welcome, Rahul Verma.');
        scanBtn.remove();
        qrBox.style.display = 'none';
        qrBtn.style.display = 'block';

        const checkedInVal = document.querySelector('#screen-reception .dash-stat-card .value');
        if (checkedInVal) {
          checkedInVal.textContent = parseInt(checkedInVal.textContent) + 1;
        }
      });
      qrBox.appendChild(scanBtn);
    });
  }
}
