const fs = require('fs').promises;
const path = require('path');
const { addDocumentToStore } = require('../ragUtils');

// Legal datasets to embed
const LEGAL_DATASETS = [
  {
    name: 'Indian Law Dataset',
    source: 'HuggingFace - viber1/indian-law-dataset',
    url: 'https://huggingface.co/datasets/viber1/indian-law-dataset',
    description: 'Comprehensive Indian legal documents and case laws'
  },
  {
    name: 'Contract NLI Dataset',
    source: 'HuggingFace - kiddothe2b/contract-nli',
    url: 'https://huggingface.co/datasets/kiddothe2b/contract-nli',
    description: 'Contract analysis and natural language inference data'
  },
  {
    name: 'JusticeHub Legal Data',
    source: 'JusticeHub.in',
    url: 'http://justicehub.in/dataset',
    description: 'Legal and justice datasets from Indian legal professionals'
  }
];

// Sample legal documents (in production, these would be fetched from the datasets)
const SAMPLE_LEGAL_DOCUMENTS = [
  {
    title: 'Right to Information Act, 2005',
    content: `RIGHT TO INFORMATION ACT, 2005
    An Act to provide for setting out the practical regime of right to information for citizens to secure access to information under the control of public authorities, in order to promote transparency and accountability in the working of every public authority, the constitution of a Central Information Commission and State Information Commissions and for matters connected therewith or incidental thereto.

    CHAPTER I
    PRELIMINARY

    1. Short title, extent and commencement.—(1) This Act may be called the Right to Information Act, 2005.
    (2) It extends to the whole of India except the State of Jammu and Kashmir.
    (3) The provisions of sub-section (1) of section 4, sub-sections (1) and (2) of section 5, sections 12, 13, 15, 16, 24, 27 and 28 shall come into force at once, and the remaining provisions of this Act shall come into force on the one hundred and twentieth day of its enactment.

    2. Definitions.—In this Act, unless the context otherwise requires,—
    (a) "appropriate Government" means in relation to a public authority which is established, constituted, owned, controlled or substantially financed by funds provided directly or indirectly—
    (i) by the Central Government or the Union territory administration, the Central Government;
    (ii) by the State Government, the State Government;
    (b) "Central Information Commission" means the Central Information Commission constituted under sub-section (1) of section 12;
    (c) "Central Public Information Officer" means the Central Public Information Officer designated under sub-section (1) and includes a Central Assistant Public Information Officer designated under sub-section (2) of section 5;
    (d) "Chief Information Commissioner" and "Information Commissioner" mean the Chief Information Commissioner and Information Commissioner appointed under sub-section (3) of section 12;
    (e) "competent authority" means—
    (i) the Speaker in the case of the House of the People or the Legislative Assembly of a State or a Union territory having such Assembly and the Chairman in the case of the Council of States or Legislative Council of a State;
    (ii) the Chief Justice of India in the case of the Supreme Court;
    (iii) the Chief Justice of the High Court in the case of a High Court;
    (iv) the President or the Governor, as the case may be, in the case of other authorities established or constituted by or under the Constitution;
    (v) the administrator appointed under article 239 of the Constitution;
    (f) "information" means any material in any form, including records, documents, memos, e-mails, opinions, advices, press releases, circulars, orders, logbooks, contracts, reports, papers, samples, models, data material held in any electronic form and information relating to any private body which can be accessed by a public authority under any other law for the time being in force;
    (g) "prescribed" means prescribed by rules made under this Act by the appropriate Government or the competent authority, as the case may be;
    (h) "public authority" means any authority or body or institution of self-government established or constituted—
    (a) by or under the Constitution;
    (b) by any other law made by Parliament;
    (c) by any other law made by State Legislature;
    (d) by notification issued or order made by the appropriate Government, and includes any—
    (i) body owned, controlled or substantially financed;
    (ii) non-Government organisation substantially financed, directly or indirectly by funds provided by the appropriate Government;
    (i) "record" includes—
    (a) any document, manuscript and file;
    (b) any microfilm, microfiche and facsimile copy of a document;
    (c) any reproduction of image or images embodied in such microfilm (whether enlarged or not); and
    (d) any other material produced by a computer or any other device;
    (j) "right to information" means the right to information accessible under this Act which is held by or under the control of any public authority and includes the right to—
    (i) inspection of work, documents, records;
    (ii) taking notes, extracts or certified copies of documents or records;
    (iii) taking certified samples of material;
    (iv) obtaining information in the form of diskettes, floppies, tapes, video cassettes or in any other electronic mode or through printouts where such information is stored in a computer or in any other device;
    (k) "State Information Commission" means the State Information Commission constituted under sub-section (1) of section 15;
    (l) "State Chief Information Commissioner" and "State Information Commissioner" mean the State Chief Information Commissioner and the State Information Commissioner appointed under sub-section (3) of section 15;
    (m) "State Public Information Officer" means the State Public Information Officer designated under sub-section (1) and includes a State Assistant Public Information Officer designated under sub-section (2) of section 5;
    (n) "third party" means a person other than the citizen making a request for information and includes a public authority.`,
    source: 'Indian Legal Database'
  },
  {
    title: 'Consumer Protection Act, 2019',
    content: `CONSUMER PROTECTION ACT, 2019
    An Act to provide for protection of the interests of consumers and for the said purpose, to establish authorities for timely and effective administration and settlement of consumers' disputes and for matters connected therewith or incidental thereto.

    CHAPTER I
    PRELIMINARY

    1. Short title, extent, commencement and application.—(1) This Act may be called the Consumer Protection Act, 2019.
    (2) It extends to the whole of India except the State of Jammu and Kashmir.
    (3) It shall come into force on such date as the Central Government may, by notification, appoint and different dates may be appointed for different States and for different provisions of this Act and any reference in any such provision to the commencement of this Act shall be construed as a reference to the coming into force of that provision in that State.
    (4) Save as otherwise expressly provided, the provisions of this Act shall apply to all goods and services.

    2. Definitions.—(1) In this Act, unless the context otherwise requires,—
    (a) "advertisement" means any audio or visual publicity, representation, endorsement or pronouncement made by means of light, sound, smoke, gas, print, electronic media, internet or website and includes any notice, circular, label, wrapper, invoice or such other documents;
    (b) "appropriate laboratory" means a laboratory or organisation—
    (i) recognised by the Central Government;
    (ii) recognised by a State Government, subject to such guidelines as may be prescribed by the Central Government in this behalf;
    (iii) any such laboratory or organisation established by or under any law for the time being in force, which is maintained, financed or aided by the Central Government or a State Government for carrying out analysis or test of any goods with a view to determining whether such goods suffer from any defect;
    (c) "branch office" means—
    (i) any establishment described as a branch by the opposite party; or
    (ii) any establishment carrying on either the same or substantially the same activity as that carried on by the head office of the establishment;
    (d) "complainant" means—
    (i) a consumer; or
    (ii) any voluntary consumer association registered under any law for the time being in force; or
    (iii) the Central Government or any State Government; or
    (iv) the Central Authority; or
    (v) one or more consumers, where there are numerous consumers having the same interest; or
    (vi) in case of death of a consumer, his legal heir or representative; or
    (vii) in case of a consumer being a minor, his parent or legal guardian;
    (e) "complaint" means any allegation in writing made by a complainant that—
    (i) an unfair trade practice or a restrictive trade practice has been adopted by any trader or service provider;
    (ii) the goods bought by him or agreed to be bought by him suffer from one or more defects;
    (iii) the services hired or availed of or agreed to be hired or availed of by him suffer from deficiency in any respect;
    (iv) a trader or the service provider, as the case may be, has charged for the goods or for the services mentioned in the complaint, a price in excess of the price—
    (A) fixed by or under any law for the time being in force;
    (B) displayed on the goods or any package containing such goods;
    (C) displayed on the price list exhibited by him by or under any law for the time being in force;
    (D) agreed between the parties;
    (v) goods which will be hazardous to life and safety when used, are being offered for sale to the public—
    (A) in contravention of any standards relating to safety of such goods as required to be complied with, by or under any law for the time being in force;
    (B) where the trader could have known with due diligence that the goods so offered are unsafe to the public;
    (vi) services which are hazardous or likely to be hazardous to life and safety of the public when used, are being offered by the service provider which such person could have known with due diligence to be injurious to life and safety;
    (f) "consumer" means any person who—
    (i) buys any goods for a consideration which has been paid or promised or partly paid and partly promised, or under any system of deferred payment and includes any user of such goods other than the person who buys such goods for consideration paid or promised or partly paid or partly promised, or under any system of deferred payment when such use is made with the approval of such person, but does not include a person who obtains such goods for resale or for any commercial purpose; or
    (ii) hires or avails of any services for a consideration which has been paid or promised or partly paid and partly promised, or under any system of deferred payment and includes any beneficiary of such services other than the person who hires or avails of the services for consideration paid or promised, or partly paid and partly promised, or under any system of deferred payment, when such services are availed of with the approval of the first-mentioned person but does not include a person who avails of such services for any commercial purpose;
    (g) "consumer dispute" means a dispute where the person against whom a complaint has been made, denies or disputes the allegations contained in the complaint;
    (h) "defect" means any fault, imperfection or shortcoming in the quality, quantity, potency, purity or standard which is required to be maintained by or under any law for the time being in force or under any contract, express or implied or as is claimed by the trader in any manner whatsoever in relation to any goods;
    (i) "deficiency" means any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance which is required to be maintained by or under any law for the time being in force or has been undertaken to be performed by a person in pursuance of a contract or otherwise in relation to any service;
    (j) "design" means the features of shape, configuration, pattern, ornament or composition of lines or colours applied to any article whether in two dimensional or three dimensional or in both forms, by any industrial process or means, whether manual, mechanical or chemical, separate or combined, which in the finished article appeal to and are judged solely by the eye, but does not include any mode or principle of construction or anything which is in substance a mere mechanical device, and does not include any trade mark as defined in clause (v) of sub-section (1) of section 2 of the Trade and Merchandise Marks Act, 1958, or property mark as defined in section 479 of the Indian Penal Code or any artistic work as defined in clause (c) of section 2 of the Copyright Act, 1957;
    (k) "direct selling" means marketing, distribution and sale of goods or provision of services through a network of sellers, other than through a permanent retail location;
    (l) "direct selling entity" means—
    (i) an entity engaged in direct selling;
    (ii) a direct selling agent or a direct seller;
    (iii) any entity that has established, operates or maintains a pyramid scheme;
    (m) "District Collector" means the District Collector or the District Magistrate or the Deputy Commissioner, as the case may be, of a district and includes any other officer designated as such by the State Government;
    (n) "e-commerce" means buying or selling of goods or services including digital products over digital or electronic network;
    (o) "e-commerce entity" means any person who owns, operates or manages digital or electronic facility or platform for electronic commerce, but does not include a seller offering his goods or services for sale on a marketplace e-commerce entity;
    (p) "endorsement" in relation to an advertisement means—
    (i) any message, verbal statement, demonstration or depiction of the name, signature, likeness or other identifying personal characteristics of an individual; or
    (ii) the name or seal of any organisation,
    which makes the consumer to believe that it reflects the opinion, finding or experience of the person making such endorsement;
    (q) "express warranty" means any material statement, affirmation of fact, promise or description relating to a product or service that becomes part of the basis of the bargain; and includes any sample or model that is part of the basis of the bargain, but does not include general opinion concerning the value of goods or services;
    (r) "goods" means every kind of movable property and includes "food" as defined in clause (j) of sub-section (1) of section 3 of the Food Safety and Standards Act, 2006;
    (s) "injury" means any harm whatever illegally caused to any person, in body, mind, reputation or property;
    (t) "manufacturer" means a person who—
    (i) makes or manufactures any goods or parts thereof; or
    (ii) does not make or manufacture any goods but assembles parts thereof made or manufactured by others and claims the end product to be goods manufactured by such person; or
    (iii) puts or causes to be put his own mark on any goods made or manufactured by any other manufacturer and claims such goods to be goods made or manufactured by such person;
    (u) "member" means a member of the District Commission or the State Commission or the National Commission, as the case may be, and includes the President thereof;
    (v) "misleading advertisement" in relation to any product or service, means an advertisement, which—
    (i) falsely describes such product or service; or
    (ii) gives a false guarantee to, or is likely to mislead the consumers as to the nature, substance, quantity or quality of such product or service; or
    (iii) conveys an express or implied representation which, if made by the manufacturer or seller or service provider thereof, would constitute an unfair trade practice; or
    (iv) deliberately conceals important information;
    (w) "National Commission" means the National Consumer Disputes Redressal Commission established under sub-section (1) of section 53;
    (x) "notification" means a notification published in the Official Gazette and the expression "notify" shall be construed accordingly;
    (y) "person" includes—
    (i) a firm whether registered or not;
    (ii) a Hindu undivided family;
    (iii) a co-operative society;
    (iv) every other association of persons whether registered under the Societies Registration Act, 1860 or not;
    (z) "prescribed" means prescribed by rules made by the Central Government under this Act;
    (za) "product liability" means the responsibility of a product manufacturer or product seller, of any product or service, to compensate for any harm caused to a consumer by such defective product manufactured or sold or by deficiency in services relating thereto;
    (zb) "product liability action" means a complaint filed by a person before a District Commission or State Commission or National Commission, as the case may be, for claiming compensation for the harm caused to him;
    (zc) "product manufacturer" means a person who—
    (i) makes any product or parts thereof; or
    (ii) assembles parts thereof made or manufactured by others and claims the end product to be goods manufactured by such person; or
    (iii) puts or causes to be put his own mark on any goods made or manufactured by any other manufacturer and claims such goods to be goods made or manufactured by such person;
    (zd) "product seller" means a person who, in the course of business, imports, sells, distributes, leases, installs, prepares, packages, labels, markets, repairs, maintains, or otherwise is involved in placing such product for commercial purpose and includes—
    (i) a manufacturer who is also a product seller; or
    (ii) a service provider, but does not include—
    (A) a seller of real estate, unless such person is engaged in the business of sale of attached homes or other real estate development and there is an implied warranty in connection with such sale;
    (B) a provider of professional services in any transaction in which, the sale or use of a product is merely incidental to the transaction and in which the essence of the transaction is the furnishing of judgment, skill or services; or
    (C) a person who—
    (I) acts in only a financial capacity with respect to the sale of the product;
    (II) leases a product under a lease arrangement in which the selection, possession, maintenance, and operation of the product are controlled by a person other than the lessor;
    (ze) "regulation" means the regulations made by the Central Authority under this Act;
    (zf) "restrictive trade practice" means a trade practice which tends to bring about manipulation of price or its conditions of delivery or to affect flow of supplies in the market relating to goods or services in such a manner as to impose on the consumers unjustified costs or restrictions and shall include—
    (i) delay beyond the period agreed to by a trader in supply of such goods or in providing the services which has led or is likely to lead to rise in the price;
    (ii) any trade practice which requires a consumer to buy, hire or avail of any goods or, as the case may be, services as condition precedent to buying, hiring or availing of other goods or services;
    (zf) "service" means service of any description which is made available to potential users and includes, but not limited to, the provision of facilities in connection with banking, financing, insurance, transport, processing, supply of electrical or other energy, telecom, boarding or lodging or both, housing construction, entertainment, amusement or the purveying of news or other information, but does not include the rendering of any service free of charge or under a contract of personal service;
    (zg) "spurious goods" means such goods which are falsely claimed to be genuine;
    (zh) "State Commission" means a State Consumer Disputes Redressal Commission established under sub-section (1) of section 42;
    (zi) "trader" in relation to any goods means a person who sells or distributes any goods for sale and includes the manufacturer thereof, and where such goods are sold or distributed in package form, includes the packer thereof;
    (zj) "unfair contract" means a contract between a manufacturer or trader or service provider on one hand, and a consumer on the other, having such terms which cause significant change in the rights of such consumer, including the following, namely:—
    (i) requiring manifestly excessive security deposits to be given by a consumer for the performance of contractual obligations; or
    (ii) imposing any penalty on the consumer, for the breach of contract thereof which is wholly disproportionate to the loss occurred due to such breach to the other party to the contract; or
    (iii) refusing to accept early repayment of debts on payment of applicable penalty; or
    (iv) entitling a party to the contract to terminate such contract unilaterally, without reasonable cause; or
    (v) permitting or has the effect of permitting one party to assign the contract to the detriment of another party who is a consumer, without his consent; or
    (vi) imposing on the consumer any unreasonable charge, obligation or condition which puts such consumer in a disadvantage;
    (zk) "unfair trade practice" means a trade practice which, for the purpose of promoting the sale, use or supply of any goods or for the provision of any service, adopts any unfair method or unfair or deceptive practice including any of the following practices, namely:—
    (1) the practice of making any statement, whether orally or in writing or by visible representation including by means of electronic record, which—
    (i) falsely represents that the goods are of a particular standard, quality, quantity, grade, composition, style or model;
    (ii) falsely represents that the services are of a particular standard, quality or grade;
    (iii) falsely represents any re-built, second-hand, renovated, reconditioned or old goods as new goods;
    (iv) represents that the goods or services have sponsorship, approval, performance, characteristics, accessories, uses or benefits which such goods or services do not have;
    (v) represents that the seller or the supplier has a sponsorship or approval or affiliation which such seller or supplier does not have;
    (vi) makes a false or misleading representation concerning the need for, or the usefulness of, any goods or services;
    (vii) gives to the public any warranty or guarantee of the performance, efficacy or length of life of a product or of any goods that is not based on an adequate or proper test thereof:
    Provided that where a defence is raised to the effect that such warranty or guarantee is based on adequate or proper test, the burden of proof of such defence shall lie on the person raising such defence;
    (viii) makes to the public a representation in a form that purports to be—
    (A) a warranty or guarantee of a product or of any goods or services; or
    (B) a promise to replace, maintain or repair an article or any part thereof or to repeat or continue a service until it has achieved a specified result,
    if such purported warranty or guarantee or promise is materially misleading or if there is no reasonable prospect that such warranty, guarantee or promise will be carried out;
    (ix) materially misleads the public concerning the price at which a product or like products or goods or services, have been or are, ordinarily sold or provided, and, for this purpose, a representation as to price shall be deemed to refer to the price at which the product or goods or services has or have been sold by sellers or provided by suppliers generally in the relevant market unless it is clearly specified to be the price at which the product has been sold or services have been provided by the person by whom or on whose behalf the representation is made;
    (x) gives false or misleading facts disparaging the goods, services or trade of another person.
    Explanation.—For the purposes of this sub-clause, a statement that is—
    (A) expressed on an article offered or displayed for sale, or on its wrapper or container; or
    (B) expressed on anything attached to, inserted in, or accompanying, an article offered or displayed for sale, or on anything on which the article is mounted for display or sale; or
    (C) contained in or on anything that is sold, sent, delivered, transmitted or in any other manner whatsoever made available to a member of the public,
    shall be deemed to be a statement made to the public by, and only by, the person who had caused the statement to be so expressed, made or contained;
    (2) permits the publication of any advertisement whether in any newspaper or otherwise, for the sale or supply at a bargain price, of goods or services that are not intended to be offered for sale or supply at the bargain price, or for a period that is, and in quantities that are, reasonable, having regard to the nature of the market in which the business is carried on, the nature and size of business, and the nature of the advertisement.
    Explanation.—For the purpose of this sub-clause, "bargain price" means—
    (A) a price that is stated in any advertisement to be a bargain price, by reference to an ordinary price or otherwise; or
    (B) a price that a person who reads, hears or sees the advertisement, would reasonably understand to be a bargain price having regard to the prices at which the product advertised or like products are ordinarily sold;
    (3) permits—
    (A) the offering of gifts, prizes or other items with the intention of not providing them as offered or creating impression that something is being given or offered free of charge when it is fully or partly covered by the amount charged in the transaction as a whole;
    (B) the conduct of any contest, lottery, game of chance or skill, for the purpose of promoting, directly or indirectly, the sale, use or supply of any product or any business interest;
    (4) permits the sale or supply of goods intended to be used, or are of a kind likely to be used, by consumers, knowing or having reason to believe that the goods do not comply with the standards prescribed by competent authority relating to performance, composition, contents, design, constructions, finishing or packaging as are necessary to prevent or reduce the risk of injury to the person using the goods;
    (5) permits the hoarding or destruction of goods, or refuses to sell the goods or to make them available for sale or to provide any service, if such hoarding or destruction or refusal raises or tends to raise or is intended to raise, the cost of those or other similar goods or services;
    (6) manufactures for sale or for any commercial purpose, packs, distributes, sells or offers for sale, supplies or attempts to supply the goods and provides or attempts to provide the services which do not comply with general requirements as notified;
    (7) takes part in the publication of any advertisement whether in any newspaper or otherwise, for the sale or supply at a bargain price, of goods or services that are not intended to be offered for sale or supply at the bargain price, or for a period that is, and in quantities that are, reasonable, having regard to the nature of the market in which the business is carried on, the nature and size of business, and the nature of the advertisement;
    (8) manipulates the price of goods or services in such a manner so as to impose on the consumers an unjustified or unreasonable price including charging anything in excess of maximum retail price printed on the package or on the label;
    (9) includes any statement that gives false or misleading facts disparaging the goods, services or trade of another person.`,
    source: 'Indian Legal Database'
  },
  {
    title: 'Indian Penal Code - Section 375 (Rape)',
    content: `INDIAN PENAL CODE, 1860
    SECTION 375 - RAPE

    A man is said to commit "rape" if he—
    (a) penetrates his penis, to any extent, into the vagina, mouth, urethra or anus of a woman or makes her to do so with him or any other person; or
    (b) inserts, to any extent, any object or a part of the body, not being the penis, into the vagina, the urethra or anus of a woman or makes her to do so with him or any other person; or
    (c) manipulates any part of the body of a woman so as to cause penetration into the vagina, urethra, anus or any part of body of such woman or makes her to do so with him or any other person; or
    (d) applies his mouth to the vagina, anus, urethra of a woman or makes her to do so with him or any other person,

    under the circumstances falling under any of the following seven descriptions:—

    First.—Against her will.

    Second.—Without her consent.

    Third.—With her consent, when her consent has been obtained by putting her or any person in whom she is interested in fear of death or of hurt.

    Fourth.—With her consent, when the man knows that he is not her husband and that her consent is given because she believes that he is another man to whom she is or believes herself to be lawfully married.

    Fifth.—With her consent, when, at the time of giving such consent, by reason of unsoundness of mind or intoxication or the administration by him personally or through another of any stupefying or unwholesome substance, she is unable to understand the nature and consequences of that to which she gives consent.

    Sixth.—With or without her consent, when she is under eighteen years of age.

    Seventh.—When she is unable to communicate consent.

    Explanation 1.—For the purposes of this section, "vagina" shall also include labia majora.

    Explanation 2.—Consent means an unequivocal voluntary agreement when the woman by words, gestures or any form of verbal or non-verbal communication, communicates willingness to participate in the specific sexual act:

    Provided that a woman who does not physically resist to the act of penetration shall not by the reason only of that fact, be regarded as consenting to the sexual activity.

    Exception 1.—A medical procedure or intervention shall not constitute rape.

    Exception 2.—Sexual intercourse or sexual acts by a man with his own wife, the wife not being under fifteen years of age, is not rape.

    SECTION 376 - PUNISHMENT FOR RAPE

    (1) Whoever, except in the cases provided for in sub-section (2), commits rape shall be punished with rigorous imprisonment of either description for a term which shall not be less than ten years, but which may extend to imprisonment for life, and shall also be liable to fine.

    (2) Whoever,—
    (a) being a police officer, commits rape—
    (i) within the limits of the police station to which he is appointed; or
    (ii) in the premises of any station house whether or not situated in the police station to which he is appointed; or
    (iii) on a woman in his custody or in the custody of a police officer subordinate to him; or
    (b) being a public servant, commits rape on a woman in his custody or in the custody of a public servant subordinate to him; or
    (c) being a member of the armed forces deployed in an area by the Central or a State Government commits rape in such area; or
    (d) being on the management or on the staff of a jail, remand home or other place of custody established by or under any law for the time being in force or of a women's or children's institution, commits rape on any inmate of such jail, remand home, place or institution; or
    (e) being on the management or on the staff of a hospital, commits rape on a woman in that hospital; or
    (f) being a relative, guardian or teacher of, or a person in a position of trust or authority towards the woman, commits rape on such woman; or
    (g) commits rape during communal or sectarian violence; or
    (h) commits rape on a woman knowing her to be pregnant; or
    (i) commits rape on a woman when she is under sixteen years of age; or
    (j) commits rape, on a woman incapable of giving consent; or
    (k) being in a position of control or dominance over a woman, commits rape on such woman; or
    (l) commits rape on a woman suffering from mental or physical disability; or
    (m) while committing rape causes grievous bodily harm or maims or disfigures or endangers the life of a woman; or
    (n) commits rape repeatedly on the same woman,

    shall be punished with rigorous imprisonment for a term which shall not be less than twenty years, but which may extend to imprisonment for life, which shall mean imprisonment for the remainder of that person's natural life, and with fine:

    Provided that such fine shall be just and reasonable to meet the medical expenses and rehabilitation of the victim:

    Provided further that any fine imposed under this sub-section shall be paid to the victim.`,
    source: 'Indian Legal Database'
  },
  {
    title: 'Contract Law - Essential Elements',
    content: `INDIAN CONTRACT ACT, 1872
    ESSENTIAL ELEMENTS OF A VALID CONTRACT

    Section 10 of the Indian Contract Act, 1872 provides that "All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void."

    The essential elements of a valid contract are:

    1. OFFER AND ACCEPTANCE
    - There must be a lawful offer by one party and a lawful acceptance of the offer by the other party.
    - Section 2(a) defines proposal as "when one person signifies to another his willingness to do or to abstain from doing anything, with a view to obtaining the assent of that other to such act or abstinence, he is said to make a proposal."
    - Section 2(b) defines acceptance as "when the person to whom the proposal is made signifies his assent thereto, the proposal is said to be accepted."

    2. INTENTION TO CREATE LEGAL RELATIONS
    - The parties must have an intention to create legal relations between them.
    - Social and domestic agreements are generally not intended to create legal relations.

    3. LAWFUL CONSIDERATION
    - Consideration is something in return for the promise.
    - Section 2(d) defines consideration as "when, at the desire of the promisor, the promisee or any other person has done or abstained from doing, or does or abstains from doing, or promises to do or to abstain from doing, something, such act or abstinence or promise is called a consideration for the promise."
    - Consideration must be lawful.

    4. CAPACITY OF PARTIES
    - The parties to the contract must be competent to contract.
    - Section 11 provides that "Every person is competent to contract who is of the age of majority according to the law to which he is subject, and who is of sound mind, and is not disqualified from contracting by any law to which he is subject."

    5. FREE CONSENT
    - Consent must be free and genuine.
    - Section 14 defines free consent as "consent is said to be free when it is not caused by—
    (1) coercion, as defined in section 15, or
    (2) undue influence, as defined in section 16, or
    (3) fraud, as defined in section 17, or
    (4) misrepresentation, as defined in section 18, or
    (5) mistake, subject to the provisions of sections 20, 21 and 22."

    6. LAWFUL OBJECT
    - The object of the agreement must be lawful.
    - Section 23 provides that "The consideration or object of an agreement is lawful, unless—
    it is forbidden by law; or
    is of such a nature that, if permitted, it would defeat the provisions of any law; or
    is fraudulent; or
    involves or implies injury to the person or property of another; or
    the Court regards it as immoral, or opposed to public policy."

    7. CERTAINTY AND POSSIBILITY OF PERFORMANCE
    - The terms of the contract must be certain and not vague.
    - The contract must be capable of being performed.

    8. LEGAL FORMALITIES
    - Some contracts are required to be in writing, registered, etc.
    - Example: Contracts for sale of immovable property must be in writing and registered.

    VOID AND VOIDABLE CONTRACTS

    Section 2(g) defines void agreement as "an agreement not enforceable by law is said to be void."
    Section 2(i) defines voidable contract as "an agreement which is enforceable by law at the option of one or more of the parties thereto, but not at the option of the other or others, is a voidable contract."

    REMEDIES FOR BREACH OF CONTRACT

    1. Damages
    2. Specific Performance
    3. Injunction
    4. Rescission
    5. Quantum Meruit`,
    source: 'Indian Legal Database'
  }
];

// Additional legal documents from JusticeHub and other sources
const JUSTICEHUB_DOCUMENTS = [
  {
    title: 'Supreme Court Guidelines on Right to Privacy',
    content: `SUPREME COURT OF INDIA GUIDELINES ON RIGHT TO PRIVACY

    In the landmark judgment of Justice K.S. Puttaswamy (Retd.) and Anr. vs Union Of India And Ors. (2017), the Supreme Court of India recognized the right to privacy as a fundamental right under Article 21 of the Constitution.

    Key Principles:

    1. RIGHT TO PRIVACY AS FUNDAMENTAL RIGHT
    - The right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21.
    - It is also protected as a part of the freedoms guaranteed by Part III of the Constitution.

    2. SCOPE OF PRIVACY
    - Privacy includes at its core the preservation of personal intimacies, the sanctity of family life, marriage, procreation, the home and sexual orientation.
    - Privacy also connotes a right to be left alone.
    - Privacy safeguards individual autonomy and recognizes the ability of the individual to control vital aspects of his or her life.

    3. LIMITATIONS ON RIGHT TO PRIVACY
    - The right to privacy is not absolute and can be restricted by the State if it satisfies the three-fold requirement:
      (a) The restriction must be by law
      (b) The restriction must be in pursuance of a legitimate State aim
      (c) The restriction must be proportionate to the object sought to be achieved

    4. DIGITAL PRIVACY
    - In the digital age, the right to privacy includes protection of personal data and information.
    - The State must ensure that personal data is not used without the consent of the individual.
    - There must be adequate safeguards to prevent misuse of personal data.

    5. IMPLICATIONS FOR AADHAAR
    - The judgment has significant implications for the Aadhaar scheme.
    - While Aadhaar can be used for legitimate State purposes, it cannot be made mandatory for all services.
    - There must be adequate data protection measures in place.

    This judgment has paved the way for the Personal Data Protection Bill and has strengthened the privacy rights of Indian citizens.`,
    source: 'JusticeHub - Supreme Court Judgments'
  },
  {
    title: 'Consumer Protection in Digital Transactions',
    content: `CONSUMER PROTECTION IN DIGITAL TRANSACTIONS

    The Consumer Protection Act, 2019 has specific provisions for protecting consumers in digital transactions and e-commerce:

    1. E-COMMERCE ENTITIES
    - E-commerce entities are required to provide accurate information about goods and services.
    - They must not adopt any unfair trade practice.
    - They are liable for any deficiency in services.

    2. UNFAIR CONTRACTS
    - The Act defines unfair contracts and provides remedies for consumers.
    - Terms that cause significant change in consumer rights are considered unfair.
    - Examples include excessive security deposits, disproportionate penalties, etc.

    3. PRODUCT LIABILITY
    - Manufacturers and sellers are liable for defective products.
    - Consumers can claim compensation for harm caused by defective products.
    - The burden of proof is on the manufacturer/seller in certain cases.

    4. MISLEADING ADVERTISEMENTS
    - Advertisements that falsely describe products or services are prohibited.
    - Celebrities endorsing products can be held liable for misleading advertisements.
    - The Central Consumer Protection Authority can take action against misleading advertisements.

    5. CONSUMER DISPUTE REDRESSAL
    - District Commissions for claims up to Rs. 1 crore
    - State Commissions for claims between Rs. 1 crore and Rs. 10 crores
    - National Commission for claims above Rs. 10 crores

    6. DIGITAL RIGHTS
    - Right to information about goods and services
    - Right to seek redressal against unfair trade practices
    - Right to consumer education
    - Right to be heard and assured that consumer interests will receive due consideration

    These provisions ensure that consumers are protected in the digital age and have adequate remedies for any grievances.`,
    source: 'JusticeHub - Consumer Protection Data'
  }
];

async function embedLegalDocuments() {
  console.log('🚀 Starting legal document embedding process...');
  console.log('📚 Datasets to be embedded:');
  
  LEGAL_DATASETS.forEach((dataset, index) => {
    console.log(`${index + 1}. ${dataset.name}`);
    console.log(`   Source: ${dataset.source}`);
    console.log(`   URL: ${dataset.url}`);
    console.log(`   Description: ${dataset.description}\n`);
  });

  try {
    // Embed sample legal documents
    console.log('📄 Embedding sample legal documents...');
    
    for (const doc of SAMPLE_LEGAL_DOCUMENTS) {
      await addDocumentToStore(doc.title, doc.content, doc.source);
    }

    // Embed JusticeHub documents
    console.log('🏛️ Embedding JusticeHub legal documents...');
    
    for (const doc of JUSTICEHUB_DOCUMENTS) {
      await addDocumentToStore(doc.title, doc.content, doc.source);
    }

    console.log('✅ Legal document embedding completed successfully!');
    console.log(`📊 Total documents embedded: ${SAMPLE_LEGAL_DOCUMENTS.length + JUSTICEHUB_DOCUMENTS.length}`);
    
    // Create dataset info file
    const datasetInfo = {
      embeddedAt: new Date().toISOString(),
      totalDocuments: SAMPLE_LEGAL_DOCUMENTS.length + JUSTICEHUB_DOCUMENTS.length,
      datasets: LEGAL_DATASETS,
      documents: [
        ...SAMPLE_LEGAL_DOCUMENTS.map(doc => ({ title: doc.title, source: doc.source })),
        ...JUSTICEHUB_DOCUMENTS.map(doc => ({ title: doc.title, source: doc.source }))
      ]
    };

    await fs.writeFile(
      path.join(__dirname, '..', 'data', 'dataset-info.json'),
      JSON.stringify(datasetInfo, null, 2)
    );

    console.log('📋 Dataset information saved to data/dataset-info.json');
    
  } catch (error) {
    console.error('❌ Error during document embedding:', error);
    process.exit(1);
  }
}

// Run the embedding process
if (require.main === module) {
  embedLegalDocuments();
}

module.exports = { embedLegalDocuments, LEGAL_DATASETS };
