export interface CityData {
  slug: string;
  name: string;
  nameUrdu: string;
  province: string;
  schools: string;
  description: string;
  localContext: string;
  neighborhoods: string[];
}

export const PAKISTAN_CITIES: CityData[] = [
  {
    slug: "karachi",
    name: "Karachi",
    nameUrdu: "کراچی",
    province: "Sindh",
    schools: "15,000+",
    description: "Pakistan ka sabse bara shehar",
    localContext: "Karachi ke private schools ke liye specially designed",
    neighborhoods: [
      "Gulshan-e-Iqbal", "DHA", "Clifton",
      "PECHS", "North Nazimabad", "Malir",
      "Korangi", "Landhi",
    ],
  },
  {
    slug: "lahore",
    name: "Lahore",
    nameUrdu: "لاہور",
    province: "Punjab",
    schools: "12,000+",
    description: "Punjab ki cultural capital",
    localContext: "Lahore ke madaris aur schools ke liye",
    neighborhoods: [
      "Gulberg", "DHA", "Model Town",
      "Johar Town", "Garden Town", "Iqbal Town",
      "Bahria Town", "Wapda Town",
    ],
  },
  {
    slug: "islamabad",
    name: "Islamabad",
    nameUrdu: "اسلام آباد",
    province: "Federal",
    schools: "3,000+",
    description: "Pakistan ki federal capital",
    localContext: "Islamabad aur Rawalpindi ke schools ke liye",
    neighborhoods: [
      "F-6", "F-7", "F-8", "G-9",
      "DHA", "Bahria Town", "E-7", "I-8",
    ],
  },
  {
    slug: "rawalpindi",
    name: "Rawalpindi",
    nameUrdu: "راولپنڈی",
    province: "Punjab",
    schools: "4,000+",
    description: "Twin city of Islamabad",
    localContext: "Rawalpindi ke schools ke liye affordable solution",
    neighborhoods: [
      "Saddar", "Chaklala", "Bahria Town",
      "Westridge", "Satellite Town", "Cantt",
    ],
  },
  {
    slug: "faisalabad",
    name: "Faisalabad",
    nameUrdu: "فیصل آباد",
    province: "Punjab",
    schools: "5,000+",
    description: "Pakistan ka textile hub",
    localContext: "Faisalabad ke growing private schools ke liye",
    neighborhoods: [
      "Canal Road", "Peoples Colony",
      "Gulberg", "Susan Road", "Jinnah Colony",
    ],
  },
  {
    slug: "multan",
    name: "Multan",
    nameUrdu: "ملتان",
    province: "Punjab",
    schools: "3,500+",
    description: "City of Saints",
    localContext: "Multan ke traditional schools ke liye modern solution",
    neighborhoods: [
      "Gulgasht Colony", "Model Town",
      "Cantt", "Shah Rukn-e-Alam Colony", "Boson Road",
    ],
  },
  {
    slug: "peshawar",
    name: "Peshawar",
    nameUrdu: "پشاور",
    province: "KPK",
    schools: "2,500+",
    description: "KPK ki cultural capital",
    localContext: "Peshawar ke schools ke liye easy-to-use system",
    neighborhoods: [
      "University Town", "Hayatabad",
      "Saddar", "Gulbahar", "Cantt", "Ring Road",
    ],
  },
];