// ============================================
// APG BOCHUM - KONFIGÜRASYON DOSYASI
// ============================================

// Google Apps Script URL (kendi URL'n ile değiştir)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQKipv7Yym4HTLM3Mqkqsir6YzvkayND9zehItHKUTM1zeyBUeA0F4CEiCKVaxQ_AhVg/exec";

// ============================================
// WHATSAPP GÖNDERME AYARI
// TRUE = Aktif, FALSE = Deaktif
// ============================================
const WHATSAPP_ACTIVE = false;  // 👈 Burayı false yapınca WhatsApp gönderimi KAPANIR

// WhatsApp Numara (sadece ACTIVE true ise kullanılır)
const WHATSAPP_NR = "";  // Boş bırakıldı

// ============================================
// KULLANICILAR (Nachname + Şifre)
// ============================================
const INITIAL_DB = {
    "Keskin": "517",
    "Uzun": "1433",
    "Kunert": "502",
    "Karali": "533",
    "Mikuczynski": "1212",
    "Türkmen": "1213",
    "Amrouch": "1268",
    "Stania": "1368",
    "Kantaroglu": "1382",
    "Krancioch": "1405",
    "Held": "1421",
    "Berisha": "1534",
    "Neji": "1536",
    "Mulugeta": "1633",
    "Udezue": "1686",
    "Jansen": "1692",
    "Aksoy": "1704",
    "Yildirim": "1710",
    "Brand": "1722",
    "Louze": "1724",
    "Blanquez": "1725",
    "Diallo": "1726",
    "Sener": "1731",
    "Klomrit": "1070",
    "Garcia": "339",
    "Aldirmaz": "577",
    "Anderwald": "509",
    "Bayrakli": "1377",
    "Kilic": "1384",
    "Maafi": "1273",
    "Besche": "1472",
    "Eickhoff": "1406",
    "Toth": "1699",
    "Gibba": "1367",
    "Helf": "1483",
    "Isbir": "1715",
    "Jeyakumar": "1698",
    "Kalisch": "1451",
    "Kowarsch": "484",
    "Nowak": "1390",
    "Pähler": "1332",
    "Patarcsity": "1700",
    "Pulendran": "1498",
    "Sahin": "1721",
    "Savas": "1360",
    "Schiavitelli": "1669",
    "Uluyüz": "1450",
    "Keskinmus": "518",
    "Katenz": "000",
    "Beher": "510",
    "Rafo": "1277",
    "Gertz": "1357",
    "Schönborn": "1361",
    "Fortes": "1381",
    "Sakaguchi M.": "1391",
    "Mercan": "1437",
    "Krämer": "1449",
    "Juretzka": "1473",
    "Kumbara": "1474",
    "Skupio": "1475",
    "Skrago": "1484",
    "Bah": "1684",
    "Kaya": "1712",
    "Jdea": "1701",
    "Toure": "1713",
    "Schneider": "1714",
    "Tchaleu": "1723"
};

// ÇALIŞAN LİSTELERİ (kısa gösterim için)
const WORKER_DATA = {
    "A": ["Kunert M.", "Karali O.", "Mikuczynski K.", "Türkmen E.", "Amrouch M.", "Stania D.", "Kantaroglu A.", "Krancioch A.", "Held D.", "Berisha I.", "Neji M.", "Mulugeta G.", "Udezue P.", "Jansen M.", "Aksoy O.", "Yildirim S.", "Brand N.", "Louze A.", "Blanquez Romero V.", "Diallo M.D.", "Sener E.", "Klomrit", "Garcia"],
    "B": ["Keskin Mur.", "Aldirmaz P.", "Anderwald R.", "Bayrakli F.", "Kilic D.", "Maafi T.", "Besche T.", "Eickhoff P.", "Toth Renata", "Gibba n.", "Helf A.", "Isbir J.", "Jeyakumar S.", "Kalisch T.", "Kowarsch R.", "Nowak M.", "Pähler D.", "Patarcsity V.", "Pulendran K.", "Sahin E.", "Savas S.", "Schiavitelli", "Uluyüz B.", "Uzun S.", "Klomrit", "Garcia"],
    "C": ["Beher T.", "Keskin Mustafa", "Kantaroglu Ö.", "Savas R.", "Rafo S.", "Gertz Kevin", "Gertz S.", "Schönborn Ch.", "Fortes Ch.", "Sakaguchi M.", "Mercan M.", "Krämer Ch.", "Juretzka T.", "Kumbara E.", "Skupio D.", "Skrago T.", "Bah A.", "Kaya A.", "Jdea A.", "Toure A.", "Schneider D.", "Tchaleu Bertrand", "Keskinmus", "Klomrit", "Garcia"]
};

// KODLAR
const CODE_DATA = {
    PUR: {
        aus: ["6-2-01 Temperatur zu niedrig", "6-2-02 Schaum haftet nicht am Bauteil", "6-2-03 Einlegefehler", "6-2-04 Schussabbruch", "6-2-05 CIM nicht voll ausgeschäumt", "6-2-06 Lippe gerissen", "6-2-07 CIM gerissen", "7-2-01 Nacharbeit am Bauteil (Entgraten, Nachkleben etc.)", "Sonstige"],
        stoer: ["3-01 WZ-Wechsel", "3-02 Mat-Umst.", "4-2-01 Ungepl. Inst. WZ", "4-2-02 Ungepl. Inst. Masch", "4-2-03 Poly/Iso Überdruck", "4-2-04 Mischkopf nio", "4-2-05 Fehler Lichtschr.", "4-2-06 Trennmittelpist.", "4-2-07 Formträger Prob.", "4-2-08 Reinigung WZ", "4-2-09 Not Aus", "5-2-01 Logistik Mangel", "5-2-02 Keine Teile IM/CIM", "5-2-04 Wartezeit Einrichter", "5-2-10 Poly/Iso leer", "Sonstige"]
    },
    Spritz: {
        aus: ["6-1-01 Anfahrschrott", "6-1-02 Mat-Umst.", "6-1-03 CIM n.voll", "6-1-04 CIM gerissen", "6-1-05 Überspritzung", "6-1-06 Einfallstellen", "6-1-07 Brandstellen", "6-1-08 Silberstreifen", "Sonstige"],
        stoer: ["3-01 WZ-Wechsel", "3-02 Mat-Umst.", "4-1-01 Ungepl. Inst. WZ", "4-1-02 Ungepl. Inst. Masch", "4-1-03 Mat-Förderung Prob.", "4-1-04 Probleme Dosier.", "4-1-05 Probleme Schließeinh.", "4-1-06 Teileentnahme Prob.", "4-1-07 Probleme WZ-Heizung", "4-1-08 Probleme Beflamm.", "5-1-01 Mat-Mangel", "5-1-03 Wartezeit Einrichter", "Sonstige"]
    },
    COM: {
        aus: ["6-3-01 Anfahrschrott", "6-3-02 Mat-Fehler", "Sonstige"],
        stoer: ["3-01 WZ-Wechsel", "3-02 Mat-Umst.", "4-3-01 Messer schleifen", "4-3-02 Ungepl. Inst. Masch", "4-3-04 Silowechsel", "5-3-01 Mat-Mangel", "5-3-05 Feueralarm", "Sonstige"]
    }
};

// SUPER MANAGER
let SUPER_MANAGERS = ["Keskin", "Uzun"];
