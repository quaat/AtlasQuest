import type { ContinentId } from "./continents";

/**
 * Country metadata keyed by ISO 3166-1 numeric code (matches world-atlas topojson IDs).
 * Each record includes name, ISO A2/A3, continent grouping, capital, flag emoji,
 * and a short educational fact. We group Russia with Europe and Turkey with Asia
 * to match common geography curricula. Small island states excluded when they
 * aren't present in the world-atlas 50m dataset (we filter at runtime).
 */

export interface CountryMeta {
  id: string; // numeric, zero-padded 3 chars (e.g. "250" for France)
  iso2: string;
  iso3: string;
  name: string;
  shortName?: string;
  continent: ContinentId;
  capital: string;
  flag: string;
  fact: string;
  population?: number; // millions
}

function c(
  id: string,
  iso2: string,
  iso3: string,
  name: string,
  continent: ContinentId,
  capital: string,
  flag: string,
  fact: string,
  population?: number,
  shortName?: string,
): CountryMeta {
  return {
    id,
    iso2,
    iso3,
    name,
    shortName,
    continent,
    capital,
    flag,
    fact,
    population,
  };
}

export const COUNTRIES: CountryMeta[] = [
  // ——————————————————— AFRICA (54) ———————————————————
  c("012", "DZ", "DZA", "Algeria", "africa", "Algiers", "🇩🇿", "Africa’s largest country by area — most of its territory is Sahara.", 44),
  c("024", "AO", "AGO", "Angola", "africa", "Luanda", "🇦🇴", "Portuguese-speaking nation rich in oil and diamonds along the Atlantic coast.", 34),
  c("204", "BJ", "BEN", "Benin", "africa", "Porto-Novo", "🇧🇯", "Birthplace of the Vodun religion, with a history tied to the ancient kingdom of Dahomey.", 13),
  c("072", "BW", "BWA", "Botswana", "africa", "Gaborone", "🇧🇼", "Home of the Okavango Delta — one of the richest wildlife regions in Africa.", 2.6),
  c("854", "BF", "BFA", "Burkina Faso", "africa", "Ouagadougou", "🇧🇫", "Name means ‘Land of Honest People’ — a landlocked West African nation.", 22),
  c("108", "BI", "BDI", "Burundi", "africa", "Gitega", "🇧🇮", "Tiny, densely populated country on the northeastern shore of Lake Tanganyika.", 12),
  c("132", "CV", "CPV", "Cabo Verde", "africa", "Praia", "🇨🇻", "An Atlantic archipelago of ten volcanic islands off West Africa.", 0.5),
  c("120", "CM", "CMR", "Cameroon", "africa", "Yaoundé", "🇨🇲", "Called ‘Africa in miniature’ for its geographic and cultural diversity.", 27),
  c("140", "CF", "CAF", "Central African Republic", "africa", "Bangui", "🇨🇫", "A landlocked nation covered largely by dense equatorial forest.", 5),
  c("148", "TD", "TCD", "Chad", "africa", "N’Djamena", "🇹🇩", "Named for Lake Chad — once the sixth-largest lake in the world.", 17),
  c("174", "KM", "COM", "Comoros", "africa", "Moroni", "🇰🇲", "A volcanic island nation in the Mozambique Channel.", 0.9),
  c("178", "CG", "COG", "Republic of the Congo", "africa", "Brazzaville", "🇨🇬", "Often called Congo-Brazzaville to distinguish from its larger neighbor.", 6, "Congo"),
  c("180", "CD", "COD", "Democratic Republic of the Congo", "africa", "Kinshasa", "🇨🇩", "The second-largest country in Africa by area, home to much of the Congo rainforest.", 99, "DR Congo"),
  c("384", "CI", "CIV", "Côte d’Ivoire", "africa", "Yamoussoukro", "🇨🇮", "The world’s largest producer of cocoa beans.", 28, "Ivory Coast"),
  c("262", "DJ", "DJI", "Djibouti", "africa", "Djibouti", "🇩🇯", "A strategic Horn of Africa nation on the Bab-el-Mandeb strait.", 1.1),
  c("818", "EG", "EGY", "Egypt", "africa", "Cairo", "🇪🇬", "Home to the Pyramids of Giza and the Nile — the world’s longest river.", 110),
  c("226", "GQ", "GNQ", "Equatorial Guinea", "africa", "Malabo", "🇬🇶", "The only Spanish-speaking country in Sub-Saharan Africa.", 1.6),
  c("232", "ER", "ERI", "Eritrea", "africa", "Asmara", "🇪🇷", "Its capital Asmara is a UNESCO-listed showcase of early modernist architecture.", 3.6),
  c("748", "SZ", "SWZ", "Eswatini", "africa", "Mbabane", "🇸🇿", "One of the last absolute monarchies in the world — formerly called Swaziland.", 1.2),
  c("231", "ET", "ETH", "Ethiopia", "africa", "Addis Ababa", "🇪🇹", "Never colonized — origin of coffee and home to its own calendar and script.", 120),
  c("266", "GA", "GAB", "Gabon", "africa", "Libreville", "🇬🇦", "Nearly 90% covered in rainforest, with 13 national parks.", 2.4),
  c("270", "GM", "GMB", "Gambia", "africa", "Banjul", "🇬🇲", "Africa’s smallest mainland country, forming a ribbon around the Gambia River.", 2.5, "The Gambia"),
  c("288", "GH", "GHA", "Ghana", "africa", "Accra", "🇬🇭", "The first Sub-Saharan African country to gain independence from colonial rule.", 33),
  c("324", "GN", "GIN", "Guinea", "africa", "Conakry", "🇬🇳", "Source of the Niger, Senegal, and Gambia rivers.", 13),
  c("624", "GW", "GNB", "Guinea-Bissau", "africa", "Bissau", "🇬🇼", "A Portuguese-speaking West African nation including the Bijagós archipelago.", 2),
  c("404", "KE", "KEN", "Kenya", "africa", "Nairobi", "🇰🇪", "Home to the Great Rift Valley and the annual Mara wildebeest migration.", 54),
  c("426", "LS", "LSO", "Lesotho", "africa", "Maseru", "🇱🇸", "An enclave entirely surrounded by South Africa — its lowest point is over 1,400 m.", 2.1),
  c("430", "LR", "LBR", "Liberia", "africa", "Monrovia", "🇱🇷", "Founded in the 1800s by freed African-Americans — its flag resembles the US flag.", 5.2),
  c("434", "LY", "LBY", "Libya", "africa", "Tripoli", "🇱🇾", "More than 90% desert, with the ancient Roman ruins of Leptis Magna on its coast.", 7),
  c("450", "MG", "MDG", "Madagascar", "africa", "Antananarivo", "🇲🇬", "The world’s fourth-largest island, home to lemurs and baobabs found nowhere else.", 29),
  c("454", "MW", "MWI", "Malawi", "africa", "Lilongwe", "🇲🇼", "Known as the ‘Warm Heart of Africa’, dominated by the vast Lake Malawi.", 20),
  c("466", "ML", "MLI", "Mali", "africa", "Bamako", "🇲🇱", "Once home to the legendary Mali Empire and the scholarly city of Timbuktu.", 22),
  c("478", "MR", "MRT", "Mauritania", "africa", "Nouakchott", "🇲🇷", "A Saharan country where the Richat Structure — the ‘Eye of the Sahara’ — is visible from space.", 4.8),
  c("480", "MU", "MUS", "Mauritius", "africa", "Port Louis", "🇲🇺", "An Indian Ocean island nation, once home to the now-extinct dodo.", 1.3),
  c("504", "MA", "MAR", "Morocco", "africa", "Rabat", "🇲🇦", "Where the Atlas Mountains meet the Sahara — famed for medinas and mint tea.", 37),
  c("508", "MZ", "MOZ", "Mozambique", "africa", "Maputo", "🇲🇿", "Its flag is the only one in the world to feature a modern firearm.", 33),
  c("516", "NA", "NAM", "Namibia", "africa", "Windhoek", "🇳🇦", "Home to the Namib — Earth’s oldest desert — and spectacular red dunes at Sossusvlei.", 2.6),
  c("562", "NE", "NER", "Niger", "africa", "Niamey", "🇳🇪", "A landlocked Saharan country named for the Niger River.", 26),
  c("566", "NG", "NGA", "Nigeria", "africa", "Abuja", "🇳🇬", "Africa’s most populous country and home of Nollywood — the world’s #2 film industry by output.", 218),
  c("646", "RW", "RWA", "Rwanda", "africa", "Kigali", "🇷🇼", "Known as the ‘Land of a Thousand Hills’ — famed for mountain gorillas.", 13),
  c("678", "ST", "STP", "São Tomé and Príncipe", "africa", "São Tomé", "🇸🇹", "Africa’s second-smallest country — a pair of volcanic Gulf of Guinea islands.", 0.2),
  c("686", "SN", "SEN", "Senegal", "africa", "Dakar", "🇸🇳", "The westernmost point of mainland Africa — Pointe des Almadies.", 17),
  c("690", "SC", "SYC", "Seychelles", "africa", "Victoria", "🇸🇨", "An archipelago of 115 Indian Ocean islands — Africa’s smallest country by population.", 0.1),
  c("694", "SL", "SLE", "Sierra Leone", "africa", "Freetown", "🇸🇱", "Named for its mountains — ‘Lion Mountains’ in Portuguese.", 8.4),
  c("706", "SO", "SOM", "Somalia", "africa", "Mogadishu", "🇸🇴", "Africa’s easternmost country, with the continent’s longest mainland coastline.", 17),
  c("710", "ZA", "ZAF", "South Africa", "africa", "Pretoria", "🇿🇦", "The only country with three capital cities: Pretoria, Cape Town, and Bloemfontein.", 60),
  c("728", "SS", "SSD", "South Sudan", "africa", "Juba", "🇸🇸", "The world’s newest country — independent since 2011.", 11),
  c("729", "SD", "SDN", "Sudan", "africa", "Khartoum", "🇸🇩", "Home to more pyramids than Egypt — those of the ancient Kingdom of Kush.", 46),
  c("834", "TZ", "TZA", "Tanzania", "africa", "Dodoma", "🇹🇿", "Contains Kilimanjaro — Africa’s tallest peak — and the Serengeti plains.", 63),
  c("768", "TG", "TGO", "Togo", "africa", "Lomé", "🇹🇬", "A slender strip of West Africa stretching from the Gulf of Guinea inland.", 8.6),
  c("788", "TN", "TUN", "Tunisia", "africa", "Tunis", "🇹🇳", "Site of ancient Carthage and Star Wars’ Tatooine filming locations.", 12),
  c("800", "UG", "UGA", "Uganda", "africa", "Kampala", "🇺🇬", "Source of the White Nile — Lake Victoria lies partly within its borders.", 47),
  c("894", "ZM", "ZMB", "Zambia", "africa", "Lusaka", "🇿🇲", "Home to Victoria Falls — among the largest waterfalls in the world.", 20),
  c("716", "ZW", "ZWE", "Zimbabwe", "africa", "Harare", "🇿🇼", "Named after the medieval stone city of Great Zimbabwe.", 15),

  // ——————————————————— EUROPE (45) ———————————————————
  c("008", "AL", "ALB", "Albania", "europe", "Tirana", "🇦🇱", "Home to over 170,000 Cold-War-era concrete bunkers.", 2.8),
  c("020", "AD", "AND", "Andorra", "europe", "Andorra la Vella", "🇦🇩", "A tiny Pyrenean principality co-ruled by France’s president and a Spanish bishop.", 0.08),
  c("040", "AT", "AUT", "Austria", "europe", "Vienna", "🇦🇹", "Birthplace of Mozart, the waltz, and the Sachertorte.", 9),
  c("112", "BY", "BLR", "Belarus", "europe", "Minsk", "🇧🇾", "Europe’s largest primeval forest — Białowieża — straddles its border with Poland.", 9.4),
  c("056", "BE", "BEL", "Belgium", "europe", "Brussels", "🇧🇪", "Home of the EU’s headquarters and the original waffle.", 11.7),
  c("070", "BA", "BIH", "Bosnia and Herzegovina", "europe", "Sarajevo", "🇧🇦", "Sarajevo is the only European capital where a mosque, synagogue, Catholic and Orthodox church stand within a block.", 3.2),
  c("100", "BG", "BGR", "Bulgaria", "europe", "Sofia", "🇧🇬", "The world’s oldest gold treasure — 6,500 years old — was unearthed near Varna.", 6.8),
  c("191", "HR", "HRV", "Croatia", "europe", "Zagreb", "🇭🇷", "Over 1,200 islands line its Adriatic coast.", 3.9),
  c("196", "CY", "CYP", "Cyprus", "europe", "Nicosia", "🇨🇾", "Mythological birthplace of Aphrodite — the island is divided since 1974.", 1.2),
  c("203", "CZ", "CZE", "Czechia", "europe", "Prague", "🇨🇿", "Consumes more beer per capita than any other country.", 10.5, "Czech Republic"),
  c("208", "DK", "DNK", "Denmark", "europe", "Copenhagen", "🇩🇰", "Oldest continuously used flag in the world — the Dannebrog, dating to 1219.", 5.9),
  c("233", "EE", "EST", "Estonia", "europe", "Tallinn", "🇪🇪", "First country in the world to make internet access a human right.", 1.3),
  c("246", "FI", "FIN", "Finland", "europe", "Helsinki", "🇫🇮", "Land of 188,000 lakes and the original sauna.", 5.6),
  c("250", "FR", "FRA", "France", "europe", "Paris", "🇫🇷", "The most-visited country on Earth.", 68),
  c("276", "DE", "DEU", "Germany", "europe", "Berlin", "🇩🇪", "There’s no federal speed limit on about 70% of the Autobahn.", 84),
  c("300", "GR", "GRC", "Greece", "europe", "Athens", "🇬🇷", "Birthplace of democracy, the Olympics, and Western philosophy.", 10.4),
  c("348", "HU", "HUN", "Hungary", "europe", "Budapest", "🇭🇺", "Budapest has more thermal springs than any other capital city.", 9.7),
  c("352", "IS", "ISL", "Iceland", "europe", "Reykjavík", "🇮🇸", "Runs almost entirely on renewable geothermal and hydroelectric energy.", 0.37),
  c("372", "IE", "IRL", "Ireland", "europe", "Dublin", "🇮🇪", "Its national symbol is a harp — the only country to have a musical instrument as a national emblem.", 5.1),
  c("380", "IT", "ITA", "Italy", "europe", "Rome", "🇮🇹", "Has more UNESCO World Heritage sites than any other country.", 59),
  c("428", "LV", "LVA", "Latvia", "europe", "Riga", "🇱🇻", "Half of its territory is forest — one of Europe’s greenest countries.", 1.9),
  c("438", "LI", "LIE", "Liechtenstein", "europe", "Vaduz", "🇱🇮", "A tiny Alpine principality — one of only two doubly landlocked countries.", 0.04),
  c("440", "LT", "LTU", "Lithuania", "europe", "Vilnius", "🇱🇹", "The geographic center of Europe lies within its borders, north of Vilnius.", 2.8),
  c("442", "LU", "LUX", "Luxembourg", "europe", "Luxembourg", "🇱🇺", "The world’s only remaining sovereign grand duchy.", 0.65),
  c("470", "MT", "MLT", "Malta", "europe", "Valletta", "🇲🇹", "Home to megalithic temples older than the Egyptian pyramids.", 0.52),
  c("498", "MD", "MDA", "Moldova", "europe", "Chișinău", "🇲🇩", "Home to Mileștii Mici — the world’s largest wine cellar by bottles.", 2.6),
  c("492", "MC", "MCO", "Monaco", "europe", "Monaco", "🇲🇨", "The world’s second-smallest sovereign state, squeezed along the Côte d’Azur.", 0.04),
  c("499", "ME", "MNE", "Montenegro", "europe", "Podgorica", "🇲🇪", "Its name means ‘Black Mountain’ — coined for the dense forests of Mount Lovćen.", 0.62),
  c("528", "NL", "NLD", "Netherlands", "europe", "Amsterdam", "🇳🇱", "About a third of the country lies below sea level.", 17.6),
  c("807", "MK", "MKD", "North Macedonia", "europe", "Skopje", "🇲🇰", "Lake Ohrid — on its border with Albania — is one of Europe’s oldest and deepest lakes.", 2.1),
  c("578", "NO", "NOR", "Norway", "europe", "Oslo", "🇳🇴", "Home to the deepest and longest fjords on Earth — and the midnight sun.", 5.5),
  c("616", "PL", "POL", "Poland", "europe", "Warsaw", "🇵🇱", "The Wieliczka Salt Mine has been mined continuously for over 700 years.", 37.7),
  c("620", "PT", "PRT", "Portugal", "europe", "Lisbon", "🇵🇹", "Oldest country in Europe with unchanged borders since 1139.", 10.3),
  c("642", "RO", "ROU", "Romania", "europe", "Bucharest", "🇷🇴", "Home to Bran Castle — the inspiration for Dracula.", 19),
  c("643", "RU", "RUS", "Russia", "europe", "Moscow", "🇷🇺", "The world’s largest country — spans 11 time zones.", 144),
  c("674", "SM", "SMR", "San Marino", "europe", "San Marino", "🇸🇲", "The world’s oldest surviving republic, founded in 301 AD.", 0.03),
  c("688", "RS", "SRB", "Serbia", "europe", "Belgrade", "🇷🇸", "Home to 17 Roman emperors — more than any country except Italy.", 6.8),
  c("703", "SK", "SVK", "Slovakia", "europe", "Bratislava", "🇸🇰", "Has the highest number of castles and chateaux per capita in the world.", 5.4),
  c("705", "SI", "SVN", "Slovenia", "europe", "Ljubljana", "🇸🇮", "About 60% of its territory is forested — one of Europe’s greenest nations.", 2.1),
  c("724", "ES", "ESP", "Spain", "europe", "Madrid", "🇪🇸", "The Spanish national anthem has no words.", 47),
  c("752", "SE", "SWE", "Sweden", "europe", "Stockholm", "🇸🇪", "Stockholm is built on 14 islands linked by 57 bridges.", 10.5),
  c("756", "CH", "CHE", "Switzerland", "europe", "Bern", "🇨🇭", "Has four official languages: German, French, Italian, and Romansh.", 8.8),
  c("804", "UA", "UKR", "Ukraine", "europe", "Kyiv", "🇺🇦", "Europe’s largest country entirely within the continent.", 41),
  c("826", "GB", "GBR", "United Kingdom", "europe", "London", "🇬🇧", "The Royal Greenwich Observatory defines the world’s prime meridian.", 67, "UK"),
  c("336", "VA", "VAT", "Vatican City", "europe", "Vatican City", "🇻🇦", "The smallest sovereign state in the world — just 0.49 km².", 0.001),

  // ——————————————————— ASIA (48) ———————————————————
  c("004", "AF", "AFG", "Afghanistan", "asia", "Kabul", "🇦🇫", "Mountainous heart of Central Asia, crossed by the ancient Silk Road.", 41),
  c("051", "AM", "ARM", "Armenia", "asia", "Yerevan", "🇦🇲", "First nation to adopt Christianity as a state religion (301 AD).", 3),
  c("031", "AZ", "AZE", "Azerbaijan", "asia", "Baku", "🇦🇿", "Known as the ‘Land of Fire’ for its natural gas vents that have burned for millennia.", 10.2),
  c("048", "BH", "BHR", "Bahrain", "asia", "Manama", "🇧🇭", "A small Gulf archipelago — home of the ancient Dilmun civilization.", 1.5),
  c("050", "BD", "BGD", "Bangladesh", "asia", "Dhaka", "🇧🇩", "The Sundarbans — the world’s largest mangrove forest — lie within its borders.", 170),
  c("064", "BT", "BTN", "Bhutan", "asia", "Thimphu", "🇧🇹", "Measures progress with Gross National Happiness rather than GDP alone.", 0.78),
  c("096", "BN", "BRN", "Brunei", "asia", "Bandar Seri Begawan", "🇧🇳", "An oil-rich sultanate on the island of Borneo.", 0.45),
  c("116", "KH", "KHM", "Cambodia", "asia", "Phnom Penh", "🇰🇭", "Home to Angkor Wat — the world’s largest religious monument.", 17),
  c("156", "CN", "CHN", "China", "asia", "Beijing", "🇨🇳", "The Great Wall is more than 21,000 km long.", 1412),
  c("268", "GE", "GEO", "Georgia", "asia", "Tbilisi", "🇬🇪", "Winemaking tradition dating back over 8,000 years — the world’s oldest.", 3.7),
  c("356", "IN", "IND", "India", "asia", "New Delhi", "🇮🇳", "The most populous country on Earth and birthplace of chess and zero.", 1428),
  c("360", "ID", "IDN", "Indonesia", "asia", "Jakarta", "🇮🇩", "The world’s largest archipelago — over 17,000 islands.", 277),
  c("364", "IR", "IRN", "Iran", "asia", "Tehran", "🇮🇷", "Home to the ancient Persian Empire and Persepolis.", 88),
  c("368", "IQ", "IRQ", "Iraq", "asia", "Baghdad", "🇮🇶", "Cradle of civilization — ancient Mesopotamia between the Tigris and Euphrates.", 43),
  c("376", "IL", "ISR", "Israel", "asia", "Jerusalem", "🇮🇱", "The Dead Sea — its lowest point — is the lowest land elevation on Earth.", 9.5),
  c("392", "JP", "JPN", "Japan", "asia", "Tokyo", "🇯🇵", "Comprises about 14,000 islands — and the world’s oldest continuous monarchy.", 125),
  c("400", "JO", "JOR", "Jordan", "asia", "Amman", "🇯🇴", "Home to Petra — the rose-red city carved into cliffs by the Nabataeans.", 11),
  c("398", "KZ", "KAZ", "Kazakhstan", "asia", "Astana", "🇰🇿", "The world’s largest landlocked country — and the ninth largest overall.", 19.6),
  c("414", "KW", "KWT", "Kuwait", "asia", "Kuwait City", "🇰🇼", "Holds about 7% of the world’s crude oil reserves.", 4.3),
  c("417", "KG", "KGZ", "Kyrgyzstan", "asia", "Bishkek", "🇰🇬", "Over 90% mountainous — contains some of the world’s largest walnut forests.", 6.7),
  c("418", "LA", "LAO", "Laos", "asia", "Vientiane", "🇱🇦", "Southeast Asia’s only landlocked country, dominated by the Mekong River.", 7.5),
  c("422", "LB", "LBN", "Lebanon", "asia", "Beirut", "🇱🇧", "Its national flag features the cedar — a tree referenced in ancient texts.", 5.4),
  c("458", "MY", "MYS", "Malaysia", "asia", "Kuala Lumpur", "🇲🇾", "Spans the Malay Peninsula and part of Borneo.", 33),
  c("462", "MV", "MDV", "Maldives", "asia", "Malé", "🇲🇻", "The world’s lowest-lying country — average elevation is just 1.5 m.", 0.5),
  c("496", "MN", "MNG", "Mongolia", "asia", "Ulaanbaatar", "🇲🇳", "Least densely populated country on Earth — home of the Gobi Desert.", 3.4),
  c("104", "MM", "MMR", "Myanmar", "asia", "Naypyidaw", "🇲🇲", "Its ancient city of Bagan contains over 2,000 Buddhist temples.", 54),
  c("524", "NP", "NPL", "Nepal", "asia", "Kathmandu", "🇳🇵", "Home to 8 of the world’s 10 tallest mountains — including Mount Everest.", 30),
  c("408", "KP", "PRK", "North Korea", "asia", "Pyongyang", "🇰🇵", "Uses its own calendar system (Juche), counting from 1912.", 26),
  c("512", "OM", "OMN", "Oman", "asia", "Muscat", "🇴🇲", "Oldest independent Arab state, ruled by the Al Said dynasty since 1744.", 4.6),
  c("586", "PK", "PAK", "Pakistan", "asia", "Islamabad", "🇵🇰", "K2 — the world’s second-highest peak — lies on its northern border.", 236),
  c("275", "PS", "PSE", "Palestine", "asia", "Ramallah", "🇵🇸", "Recognized by the UN as a non-member observer state in 2012.", 5.4),
  c("608", "PH", "PHL", "Philippines", "asia", "Manila", "🇵🇭", "An archipelago of over 7,600 islands.", 117),
  c("634", "QA", "QAT", "Qatar", "asia", "Doha", "🇶🇦", "The richest country in the world by GDP per capita.", 2.9),
  c("682", "SA", "SAU", "Saudi Arabia", "asia", "Riyadh", "🇸🇦", "Home to Mecca and Medina — Islam’s two holiest cities.", 36),
  c("702", "SG", "SGP", "Singapore", "asia", "Singapore", "🇸🇬", "A city-state that has become one of the world’s great financial hubs.", 5.9),
  c("410", "KR", "KOR", "South Korea", "asia", "Seoul", "🇰🇷", "Seoul hosts one of the fastest average internet speeds in the world.", 52),
  c("144", "LK", "LKA", "Sri Lanka", "asia", "Colombo", "🇱🇰", "An Indian Ocean island, famed for Ceylon tea and ancient cities.", 22),
  c("760", "SY", "SYR", "Syria", "asia", "Damascus", "🇸🇾", "Damascus is among the oldest continuously inhabited cities on Earth.", 22),
  c("158", "TW", "TWN", "Taiwan", "asia", "Taipei", "🇹🇼", "Produces most of the world’s advanced semiconductors.", 23.5),
  c("762", "TJ", "TJK", "Tajikistan", "asia", "Dushanbe", "🇹🇯", "Over 90% mountainous — dominated by the Pamirs, the ‘Roof of the World’.", 9.8),
  c("764", "TH", "THA", "Thailand", "asia", "Bangkok", "🇹🇭", "Bangkok’s full ceremonial name is the longest city name in the world.", 70),
  c("626", "TL", "TLS", "Timor-Leste", "asia", "Dili", "🇹🇱", "One of Asia’s youngest nations — independent from Indonesia in 2002.", 1.4),
  c("792", "TR", "TUR", "Turkey", "asia", "Ankara", "🇹🇷", "Istanbul is the only city on Earth that straddles two continents.", 85),
  c("795", "TM", "TKM", "Turkmenistan", "asia", "Ashgabat", "🇹🇲", "Site of the ‘Gates of Hell’ — a gas crater that has burned since 1971.", 6.4),
  c("784", "AE", "ARE", "United Arab Emirates", "asia", "Abu Dhabi", "🇦🇪", "Home to the world’s tallest building, the Burj Khalifa.", 9.5, "UAE"),
  c("860", "UZ", "UZB", "Uzbekistan", "asia", "Tashkent", "🇺🇿", "One of only two doubly landlocked countries in the world.", 35),
  c("704", "VN", "VNM", "Vietnam", "asia", "Hanoi", "🇻🇳", "The world’s second-largest coffee producer.", 98),
  c("887", "YE", "YEM", "Yemen", "asia", "Sana’a", "🇾🇪", "Home to the island of Socotra — whose flora is 30% endemic.", 33),

  // ——————————————————— NORTH AMERICA (23) ———————————————————
  c("028", "AG", "ATG", "Antigua and Barbuda", "north-america", "Saint John’s", "🇦🇬", "A twin-island Caribbean nation famed for 365 beaches.", 0.1),
  c("044", "BS", "BHS", "Bahamas", "north-america", "Nassau", "🇧🇸", "An archipelago of around 700 islands in the Atlantic.", 0.4),
  c("052", "BB", "BRB", "Barbados", "north-america", "Bridgetown", "🇧🇧", "Birthplace of rum — and pop icon Rihanna.", 0.28),
  c("084", "BZ", "BLZ", "Belize", "north-america", "Belmopan", "🇧🇿", "Home to the Belize Barrier Reef — the second-largest in the world.", 0.41),
  c("124", "CA", "CAN", "Canada", "north-america", "Ottawa", "🇨🇦", "Has the longest coastline of any country — over 200,000 km.", 39),
  c("188", "CR", "CRI", "Costa Rica", "north-america", "San José", "🇨🇷", "Abolished its military in 1948. Hosts 5% of Earth’s biodiversity.", 5.1),
  c("192", "CU", "CUB", "Cuba", "north-america", "Havana", "🇨🇺", "The largest island in the Caribbean.", 11.3),
  c("212", "DM", "DMA", "Dominica", "north-america", "Roseau", "🇩🇲", "Home to the Boiling Lake — the world’s second-largest hot spring.", 0.07),
  c("214", "DO", "DOM", "Dominican Republic", "north-america", "Santo Domingo", "🇩🇴", "Santo Domingo is the oldest permanent European settlement in the Americas.", 11.2),
  c("222", "SV", "SLV", "El Salvador", "north-america", "San Salvador", "🇸🇻", "Central America’s smallest country — and the first to adopt Bitcoin as legal tender.", 6.3),
  c("308", "GD", "GRD", "Grenada", "north-america", "Saint George’s", "🇬🇩", "The ‘Isle of Spice’ — a leading producer of nutmeg.", 0.11),
  c("320", "GT", "GTM", "Guatemala", "north-america", "Guatemala City", "🇬🇹", "Heartland of the ancient Maya civilization, with 33 volcanoes.", 18),
  c("332", "HT", "HTI", "Haiti", "north-america", "Port-au-Prince", "🇭🇹", "First country founded by a successful slave revolution (1804).", 11.6),
  c("340", "HN", "HND", "Honduras", "north-america", "Tegucigalpa", "🇭🇳", "Home to the ancient Maya ruins of Copán.", 10.4),
  c("388", "JM", "JAM", "Jamaica", "north-america", "Kingston", "🇯🇲", "Birthplace of reggae music and Usain Bolt.", 2.8),
  c("484", "MX", "MEX", "Mexico", "north-america", "Mexico City", "🇲🇽", "Introduced chocolate, chili peppers, and corn to the world.", 128),
  c("558", "NI", "NIC", "Nicaragua", "north-america", "Managua", "🇳🇮", "Contains Central America’s largest lake, Lake Nicaragua.", 6.8),
  c("591", "PA", "PAN", "Panama", "north-america", "Panama City", "🇵🇦", "The Panama Canal links the Atlantic and Pacific oceans.", 4.4),
  c("659", "KN", "KNA", "Saint Kitts and Nevis", "north-america", "Basseterre", "🇰🇳", "The smallest sovereign state in the Western Hemisphere.", 0.05),
  c("662", "LC", "LCA", "Saint Lucia", "north-america", "Castries", "🇱🇨", "Features the Pitons — twin volcanic spires that are a UNESCO site.", 0.18),
  c("670", "VC", "VCT", "Saint Vincent and the Grenadines", "north-america", "Kingstown", "🇻🇨", "A multi-island nation in the southern Caribbean.", 0.11),
  c("780", "TT", "TTO", "Trinidad and Tobago", "north-america", "Port of Spain", "🇹🇹", "Birthplace of steelpan music and limbo dancing.", 1.5),
  c("840", "US", "USA", "United States", "north-america", "Washington, D.C.", "🇺🇸", "Home to 63 national parks, from Acadia to Zion.", 334, "USA"),

  // ——————————————————— SOUTH AMERICA (12) ———————————————————
  c("032", "AR", "ARG", "Argentina", "south-america", "Buenos Aires", "🇦🇷", "Has the world’s southernmost city — Ushuaia, at the tip of Tierra del Fuego.", 46),
  c("068", "BO", "BOL", "Bolivia", "south-america", "Sucre", "🇧🇴", "Contains Salar de Uyuni — the world’s largest salt flat.", 12),
  c("076", "BR", "BRA", "Brazil", "south-america", "Brasília", "🇧🇷", "Largest country in South America and home to 60% of the Amazon rainforest.", 215),
  c("152", "CL", "CHL", "Chile", "south-america", "Santiago", "🇨🇱", "A ribbon nation 4,300 km long — contains the world’s driest non-polar desert.", 19.6),
  c("170", "CO", "COL", "Colombia", "south-america", "Bogotá", "🇨🇴", "Second-most biodiverse country after Brazil.", 52),
  c("218", "EC", "ECU", "Ecuador", "south-america", "Quito", "🇪🇨", "Straddles the equator — home to the Galápagos Islands.", 18),
  c("328", "GY", "GUY", "Guyana", "south-america", "Georgetown", "🇬🇾", "Only English-speaking country in South America.", 0.8),
  c("600", "PY", "PRY", "Paraguay", "south-america", "Asunción", "🇵🇾", "Home to the Itaipu Dam — one of the world’s largest.", 6.8),
  c("604", "PE", "PER", "Peru", "south-america", "Lima", "🇵🇪", "Home to Machu Picchu — the iconic 15th-century Inca citadel.", 34),
  c("740", "SR", "SUR", "Suriname", "south-america", "Paramaribo", "🇸🇷", "Smallest sovereign nation in South America; about 94% is rainforest.", 0.62),
  c("858", "UY", "URY", "Uruguay", "south-america", "Montevideo", "🇺🇾", "The first country to legalize cannabis nationally.", 3.4),
  c("862", "VE", "VEN", "Venezuela", "south-america", "Caracas", "🇻🇪", "Home to Angel Falls — the world’s tallest uninterrupted waterfall.", 28),

  // ——————————————————— OCEANIA (14) ———————————————————
  c("036", "AU", "AUS", "Australia", "oceania", "Canberra", "🇦🇺", "The world’s smallest continent and sixth-largest country.", 26),
  c("242", "FJ", "FJI", "Fiji", "oceania", "Suva", "🇫🇯", "A Pacific archipelago of over 330 islands.", 0.9),
  c("296", "KI", "KIR", "Kiribati", "oceania", "South Tarawa", "🇰🇮", "The only country spanning all four hemispheres.", 0.13),
  c("584", "MH", "MHL", "Marshall Islands", "oceania", "Majuro", "🇲🇭", "Chain of over 1,000 islands and 29 atolls.", 0.04),
  c("583", "FM", "FSM", "Micronesia", "oceania", "Palikir", "🇫🇲", "607 islands stretching across the western Pacific.", 0.1),
  c("520", "NR", "NRU", "Nauru", "oceania", "Yaren", "🇳🇷", "World’s third-smallest country — the only one without an official capital.", 0.012),
  c("554", "NZ", "NZL", "New Zealand", "oceania", "Wellington", "🇳🇿", "More sheep than people, by a ratio of about six to one.", 5.1),
  c("585", "PW", "PLW", "Palau", "oceania", "Ngerulmud", "🇵🇼", "Famous for Jellyfish Lake — filled with millions of stingless jellyfish.", 0.018),
  c("598", "PG", "PNG", "Papua New Guinea", "oceania", "Port Moresby", "🇵🇬", "Home to more than 800 living languages.", 10),
  c("882", "WS", "WSM", "Samoa", "oceania", "Apia", "🇼🇸", "First country in the world to see each new day at the International Date Line.", 0.22),
  c("090", "SB", "SLB", "Solomon Islands", "oceania", "Honiara", "🇸🇧", "Scene of pivotal WWII battles in the Pacific.", 0.72),
  c("776", "TO", "TON", "Tonga", "oceania", "Nukuʻalofa", "🇹🇴", "The only Pacific nation never formally colonized.", 0.1),
  c("798", "TV", "TUV", "Tuvalu", "oceania", "Funafuti", "🇹🇻", "Fourth-smallest country in the world — at risk from sea-level rise.", 0.011),
  c("548", "VU", "VUT", "Vanuatu", "oceania", "Port Vila", "🇻🇺", "Often ranks as the world’s happiest country by wellbeing indices.", 0.32),
];

export const COUNTRIES_BY_ID = new Map(COUNTRIES.map((c) => [c.id, c]));

export const COUNTRIES_BY_CONTINENT: Record<ContinentId, CountryMeta[]> = {
  africa: [],
  europe: [],
  asia: [],
  "north-america": [],
  "south-america": [],
  oceania: [],
};
for (const country of COUNTRIES) {
  COUNTRIES_BY_CONTINENT[country.continent].push(country);
}
for (const list of Object.values(COUNTRIES_BY_CONTINENT)) {
  list.sort((a, b) => a.name.localeCompare(b.name));
}

export function getCountryById(id: string | number | undefined | null): CountryMeta | undefined {
  if (id === undefined || id === null) return undefined;
  const key = typeof id === "number" ? String(id).padStart(3, "0") : String(id).padStart(3, "0");
  return COUNTRIES_BY_ID.get(key);
}
