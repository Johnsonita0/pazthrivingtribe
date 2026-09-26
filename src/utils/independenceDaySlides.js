export const getIndependenceDaySlides = (anniversary) => {
  const history = [
    ['flag-design', '1959 · A FLAG SELECTED', 'A student’s design becomes Nigeria’s flag', 'Michael Taiwo Akinkunmi’s design was selected in 1959 for the new nation’s flag. Its green bands represent agriculture; white represents peace.', '/image/nigeria-independence-flag.svg', 'Nigeria green-white-green flag', 'contain'],
    ['independence-day', '1 OCTOBER 1960 · INDEPENDENCE', 'Nigeria takes its place as an independent nation', 'After decades of nationalist organizing, Nigeria became independent from Britain on 1 October 1960.', '/image/nigeria-independence-flag.svg', 'Nigeria green-white-green flag', 'contain'],
    ['first-flag-raising', 'LAGOS · 1 OCTOBER 1960', 'The green-white-green flag is raised', 'At midnight, the new flag marked the beginning of Nigeria’s independence and a new chapter in its history.', '/image/nigeria-independence-flag.svg', 'Nigeria green-white-green flag', 'contain'],
    ['coat-of-arms-motto', 'UNITY AND FAITH · PEACE AND PROGRESS', 'A national motto for a new republic', 'The coat of arms carries the motto “Unity and Faith, Peace and Progress,” expressing the hopes of a diverse federation.', '/image/nigeria-coat-of-arms.png', 'The Coat of Arms of Nigeria', 'contain'],
    ['coat-of-arms-rivers', 'THE NIGER AND THE BENUE', 'Two rivers meet in the national emblem', 'The white Y on the shield represents the Niger and Benue rivers, whose meeting point lies at Lokoja.', '/image/nigeria-coat-of-arms.png', 'The Coat of Arms of Nigeria', 'contain'],
    ['national-shield', 'A REPUBLICAN EMBLEM', 'The black shield and white Y', 'The black shield and white Y form the central design of Nigeria’s coat of arms, adopted after independence.', '/image/nigeria-coat-of-arms.png', 'The Coat of Arms of Nigeria', 'contain'],
    ['azikiwe-president', '1963 · THE FIRST REPUBLIC', 'Nnamdi Azikiwe becomes Nigeria’s first president', 'When Nigeria became a republic in 1963, Nnamdi Azikiwe became its first president.', '/image/nnamdi-azikiwe.jpg', 'Portrait of Nnamdi Azikiwe', 'cover'],
    ['azikiwe-journalism', 'A VOICE FOR SELF-GOVERNMENT', 'Azikiwe used journalism to argue for independence', 'Through newspapers and political organizing, Nnamdi Azikiwe helped make self-government a defining national cause.', '/image/nnamdi-azikiwe.jpg', 'Portrait of Nnamdi Azikiwe', 'cover'],
    ['azikiwe-governor-general', '1960–1963 · A NEW STATE', 'Azikiwe serves as governor-general', 'After independence, Azikiwe became Nigeria’s governor-general before the country became a republic in 1963.', '/image/nnamdi-azikiwe.jpg', 'Portrait of Nnamdi Azikiwe', 'cover'],
    ['azikiwe-republic', 'A REPUBLIC FROM 1963', 'A new constitutional chapter begins', 'Nigeria became a republic on 1 October 1963, three years after independence.', '/image/nnamdi-azikiwe.jpg', 'Portrait of Nnamdi Azikiwe', 'cover'],
    ['tafawa-prime-minister', '1960 · FIRST PRIME MINISTER', 'Tafawa Balewa leads the independent government', 'Abubakar Tafawa Balewa became Nigeria’s first Prime Minister at independence in 1960.', '/image/tafawa-balewa-note.jpg', 'Tafawa Balewa on the Nigerian five-naira banknote', 'contain'],
    ['tafawa-independence-speech', 'A PROMISE FOR THE FUTURE', 'Balewa speaks at independence', 'At the handover of power, Prime Minister Tafawa Balewa spoke of his confidence in the future of the country.', '/image/tafawa-balewa-note.jpg', 'Tafawa Balewa on the Nigerian five-naira banknote', 'contain'],
    ['tafawa-banknote', 'A FACE ON THE FIVE-NAIRA NOTE', 'A national leader remembered in everyday life', 'Tafawa Balewa’s portrait appears on Nigeria’s five-naira banknote, keeping the first Prime Minister part of daily civic life.', '/image/tafawa-balewa-note.jpg', 'Tafawa Balewa on the Nigerian five-naira banknote', 'contain'],
    ['tafawa-federation', 'BUILDING A FEDERATION', 'Balewa’s government navigates a diverse nation', 'Nigeria’s first federal government brought together regions with distinct histories, languages, and traditions.', '/image/tafawa-balewa-note.jpg', 'Tafawa Balewa on the Nigerian five-naira banknote', 'contain'],
    ['abuja-capital', '1991 · A NEW CAPITAL', 'The federal capital moves to Abuja', 'Abuja became Nigeria’s capital in 1991, replacing Lagos and placing the federal seat nearer the country’s centre.', '/image/aso-rock.jpg', 'Aso Rock in Abuja', 'cover'],
    ['aso-rock-landmark', 'ABUJA · A NATIONAL LANDMARK', 'Aso Rock rises above the capital', 'The granite monolith is one of Abuja’s most recognizable landmarks and gives its name to the nearby presidential complex.', '/image/aso-rock.jpg', 'Aso Rock in Abuja', 'cover'],
    ['abuja-federal-seat', 'A FEDERAL CITY', 'Abuja becomes the home of national institutions', 'Since the capital moved in 1991, Abuja has grown around the institutions that serve Nigeria’s federal republic.', '/image/aso-rock.jpg', 'Aso Rock in Abuja', 'cover'],
    ['zuma-rock', 'MADALLA · NIGER STATE', 'Zuma Rock: a striking landmark near Abuja', 'The large inselberg near Madalla is often called the “Gateway to Abuja” and is one of Nigeria’s best-known natural landmarks.', '/image/zuma-rock.jpg', 'Zuma Rock in Nigeria', 'cover'],
    ['yoruba-royal-crown', 'CULTURAL HERITAGE · YORUBA KINGDOMS', 'Royal crowns carry history and authority', 'Beaded Yoruba crowns are regalia of kingship, crafted with symbols that connect leadership, community, and tradition.', '/image/yoruba-crown.jpg', 'A Yoruba royal crown', 'cover'],
    ['federal-unity', 'MANY PEOPLES · ONE FEDERATION', 'Nigeria’s story is still being written together', 'From the flag to the national motto, shared symbols express the continuing work of unity across Nigeria’s many communities.', '/image/nigeria-coat-of-arms.png', 'The Coat of Arms of Nigeria', 'contain']
  ];

  return history.map(([id, eyebrow, title, tagline, image, imageAlt, imageFit]) => ({
    id,
    eyebrow,
    title,
    tagline,
    image,
    imageAlt,
    imageFit,
    anniversary
  }));
};