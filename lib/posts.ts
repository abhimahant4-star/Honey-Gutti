/* ------------------------------------------------------------------
 * STARTER BLOG POSTS
 * Blog posts are now written in the admin panel (/admin/blog) and saved in
 * the database. These 3 starter posts can be added there with one click
 * ("Import starter posts"). Please have the client review the health wording.
 * ------------------------------------------------------------------ */

export type StarterPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  image?: string;
  tone: "honey" | "leaf" | "pack";
  body: string;
};

export const starterPosts: StarterPost[] = [
  {
    "slug": "herbs-in-honey-ghutti",
    "title": "Meet the herbs in Honey Ghutti",
    "description": "Tulsi, Vasa, Mulethi, Sonth and more: a simple guide to the Ayurvedic herbs in every 10 ml of Honey Ghutti Cough Remedy.",
    "date": "2026-10-27",
    "tags": [
      "Ingredients",
      "Ayurveda"
    ],
    "tone": "leaf",
    "body": "Honey Ghutti Cough Remedy is a honey-based Ayurvedic syrup. The pack lists exactly what goes into every 10 ml, and we think you should know what each herb is and why it is there.\n\n## The herbs, one by one\n\n- Tulsi (Ocimum sanctum), 200 mg: holy basil, found in many Indian homes and traditionally used in Ayurveda for cough, cold and throat comfort.\n- Vasa (Adhatoda vasica), 200 mg: one of the best-known Ayurvedic herbs for the chest, traditionally used for cough.\n- Yashtimadhu or Mulethi (Glycyrrhiza glabra), 200 mg: liquorice root, traditionally used to soothe the throat.\n- Sonth (Zingiber officinale), 100 mg: dry ginger, a warming spice long used for cough and cold.\n- Kantakari (Solanum xanthocarpum), 100 mg: traditionally used in Ayurvedic cough preparations.\n- Trikatu, 50 mg: the classic Ayurvedic blend of dry ginger, black pepper and long pepper (pippali).\n- Navsar, 200 mg: a traditional ingredient of Ayurvedic cough syrups.\n- Sat Pudina (Mentha piperita), 6 mg, and Nilgiri (Eucalyptus globulus), 0.006 ml: mint and eucalyptus, which give the fresh, cooling feel.\n\n## Why a honey base?\n\nHoney has been used with herbs in Indian homes for generations. It makes the syrup pleasant to take and is itself a traditional choice for the throat. That is where the name comes from: हनी की घुट्टी, खांसी की छुट्टी.\n\n## What the pack says\n\nThe pack describes Honey Ghutti as a fast relief, non-drowsy formula for all types of cough and respiratory disease, fortified with Tulsi, Mulethi and Banaphsa. It is made by Kamdhenu Ayurvedic Pharmacy, Baddi (HP), under Mfg. Lic. No. HP-207-AY.\n\n> Always read the label before use. If you are pregnant, breastfeeding, diabetic, taking other medicines or have a long-term health condition, ask your doctor first."
  },
  {
    "slug": "how-to-take-honey-ghutti",
    "title": "How to take Honey Ghutti: dosage and simple tips",
    "description": "The dose printed on the pack, how to take it with hot water, and when it is time to see a doctor about a cough.",
    "date": "2026-10-26",
    "tags": [
      "How to use"
    ],
    "image": "/images/pack-english.jpg",
    "tone": "honey",
    "body": "## The dose on the pack\n\nFor adults, the pack says: 2 to 3 teaspoons (TSF), 3 times a day, with hot water, or as directed by the physician.\n\n- Shake the bottle well before every use.\n- Measure with a proper teaspoon or measuring cap, not a kitchen spoon of any size.\n- Mix with a little hot (not boiling) water, or take it and then sip warm water.\n- Close the cap tightly and store in a cool, dry place away from sunlight.\n\n## Children and special cases\n\nThe pack does not give a separate children's dose, so please ask your doctor before giving it to a child.\n\n> Never give honey, or anything made with honey, to a baby under 1 year old.\n\n## When to see a doctor\n\nHome care is fine for a simple cough, but please see a doctor quickly if:\n\n- the cough lasts more than 2–3 weeks, or keeps coming back\n- there is high fever, chest pain, wheezing or difficulty breathing\n- you cough up blood, or notice weight loss or night sweats\n- the person is very young, elderly, or has asthma, diabetes or heart disease"
  },
  {
    "slug": "cough-season-home-care",
    "title": "Simple home habits for cough and cold season",
    "description": "Warm water, steam, rest and a few easy habits that help the whole family through cough and cold season.",
    "date": "2026-10-25",
    "tags": [
      "Home care",
      "Seasonal"
    ],
    "tone": "pack",
    "body": "Changes in weather, dust and pollution often bring coughs and colds, especially in winter and the monsoon. A few everyday habits can make those days easier.\n\n## Everyday habits that help\n\n- Drink warm water through the day and keep the throat moist.\n- Gargle with warm salt water in the morning and at night.\n- Take steam for a few minutes; a little care keeps it safe, especially around children.\n- Rest well. Sleep is when the body recovers.\n- Eat simple, warm, home-cooked food.\n- Avoid smoke, incense smoke in closed rooms, and very cold drinks.\n- Wash hands often and cover your mouth when you cough or sneeze to protect others.\n\n## Keep a few things ready at home\n\nA thermometer, a measuring spoon, and the medicines your family doctor has recommended. If you use an Ayurvedic syrup like Honey Ghutti, keep it in a cool, dry place and check the expiry date.\n\n> If a cough lasts more than 2–3 weeks, or comes with high fever or breathing difficulty, please see a doctor."
  }
];
