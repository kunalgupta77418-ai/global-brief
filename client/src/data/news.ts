export type Evidence = "Confirmed by multiple sources" | "Single source" | "Disputed" | "Unverified";

export type Story = {
  id: string;
  kicker: string;
  title: string;
  dek: string;
  source: string;
  published: string;
  readingTime: string;
  topic: string;
  place: string;
  evidence: Evidence;
  summary: string;
  claims: { text: string; evidence: Evidence; sources: string[] }[];
  timeline: { date: string; title: string; text: string; source: string }[];
  lenses: { label: string; text: string; affected: string }[];
  perspectives: { outlet: string; frame: string; note: string }[];
  scenarios: { title: string; text: string; watch: string }[];
  posts: Post[];
};

export type Post = {
  id: string;
  author: string;
  initials: string;
  role: string;
  type: "Opinion" | "Evidence-backed argument" | "Question";
  body: string;
  time: string;
  agree: number;
  disagree: number;
  reply?: boolean;
  checked?: boolean;
};

export const stories: Story[] = [
  {
    id: "water-and-the-city",
    kicker: "GOVERNANCE / INDIA",
    title: "The water question is no longer a summer story",
    dek: "Across fast-growing cities, the argument is shifting from emergency tankers to who gets to plan the next decade of water.",
    source: "The Public Ledger",
    published: "07 November 2026",
    readingTime: "8 min read",
    topic: "Governance",
    place: "Bengaluru",
    evidence: "Confirmed by multiple sources",
    summary: "A cluster of new city water measures has put long-term supply, groundwater rules, and household demand on the same public agenda. The immediate proposals differ by ward, but the underlying issue is consistent: infrastructure has not kept pace with population and construction.",
    claims: [
      { text: "The city is combining new reuse projects with stricter groundwater monitoring.", evidence: "Confirmed by multiple sources", sources: ["Bengaluru Water Board brief", "The Public Ledger"] },
      { text: "Household demand has grown faster than the main distribution network in several zones.", evidence: "Single source", sources: ["Civic data note"] },
      { text: "The measures will end seasonal shortages this year.", evidence: "Unverified", sources: ["No verified source found"] },
    ],
    timeline: [
      { date: "2018", title: "A city grows around its water map", text: "Planning documents begin to show a widening gap between new built-up areas and dependable piped supply.", source: "Metropolitan planning report" },
      { date: "2023", title: "Groundwater becomes a public issue", text: "Resident groups and researchers bring borewell depletion into mainstream civic debate.", source: "State groundwater bulletin" },
      { date: "May 2026", title: "A dry season exposes the seams", text: "Several neighbourhoods report tanker dependence while reuse infrastructure remains unevenly connected.", source: "Civic data note" },
      { date: "October 2026", title: "The response moves upstream", text: "New proposals pair local reuse with monitoring and demand management instead of relying only on emergency supply.", source: "Bengaluru Water Board brief" },
    ],
    lenses: [
      { label: "Political", text: "The proposal asks city and state agencies to share a problem that has traditionally been managed in separate silos.", affected: "Ward committees, municipal officials, residents in peripheral layouts" },
      { label: "Economic", text: "Reuse requires upfront capital but may lower the cost of tanker dependence over time.", affected: "Small businesses, apartment associations, households without storage" },
      { label: "Social", text: "A rule that looks equal on paper can land differently where people have different access to private wells and storage.", affected: "Renters, informal settlements, women managing household water" },
      { label: "Environmental", text: "Monitoring is useful only if extraction data leads to limits, recharge, or enforcement.", affected: "Aquifers, peri-urban farmers, lake catchments" },
      { label: "Global / India-specific", text: "Bengaluru is a local version of a wider city question: how to plan water before the next emergency.", affected: "Rapidly urbanising cities across India" },
    ],
    perspectives: [
      { outlet: "The Public Ledger", frame: "Infrastructure first", note: "Emphasises the mismatch between construction and the distribution network." },
      { outlet: "Civic South", frame: "Groundwater rules", note: "Places more weight on measurement, enforcement, and neighbourhood-level oversight." },
      { outlet: "The Daily Current", frame: "Household demand", note: "Focuses on how conservation measures may change routines and bills." },
    ],
    scenarios: [
      { title: "The quiet retrofit", text: "Reuse projects connect in the highest-demand zones while the public debate becomes less crisis-driven.", watch: "Tender timelines, ward-level connection maps" },
      { title: "The patchwork holds", text: "Some neighbourhoods see improvement, but uneven enforcement keeps tanker dependence alive elsewhere.", watch: "Borewell permits, tanker prices, complaint data" },
    ],
    posts: [
      { id: "p1", author: "Asha Menon", initials: "AM", role: "Bengaluru resident", type: "Opinion", body: "The useful shift here is from asking people to save water to asking institutions to show the full map. A household cannot conserve its way out of a missing pipe.", time: "34 min ago", agree: 18, disagree: 3 },
      { id: "p2", author: "Rohan Kulkarni", initials: "RK", role: "Civil engineer", type: "Evidence-backed argument", body: "The infrastructure gap is real, but the word ‘shortage’ hides the distribution problem. The board’s own brief shows that some zones have capacity while others depend on tankers.", time: "1 hr ago", agree: 22, disagree: 5, checked: true },
      { id: "p3", author: "Nandita Rao", initials: "NR", role: "Student", type: "Question", body: "What would a resident actually be able to check in the next six months to know whether this plan is working?", time: "2 hr ago", agree: 9, disagree: 1 },
      { id: "p4", author: "Ishaan Thomas", initials: "IT", role: "Urban planner", type: "Opinion", body: "Watch the boring indicators: connection maps, permit records, and whether recharge work survives beyond a launch event.", time: "3 hr ago", agree: 14, disagree: 2, reply: true },
    ],
  },
  {
    id: "schools-and-screen-time",
    kicker: "SOCIAL ISSUES / INDIA",
    title: "Schools are writing the first draft of a screen-time policy",
    dek: "The debate is less about banning phones than deciding what attention should be protected for, and by whom.",
    source: "The Civic Review",
    published: "06 November 2026",
    readingTime: "6 min read",
    topic: "Social issues",
    place: "New Delhi",
    evidence: "Single source",
    summary: "A new set of school guidelines has reopened a familiar argument about phones, classroom attention, and student agency. The draft gives schools room to set local rules, but leaves the hardest question — enforcement without unequal punishment — to administrators.",
    claims: [
      { text: "The guidance leaves implementation to individual schools.", evidence: "Confirmed by multiple sources", sources: ["Education department note", "The Civic Review"] },
      { text: "Most schools will adopt an identical phone ban by the end of term.", evidence: "Unverified", sources: ["No verified source found"] },
    ],
    timeline: [
      { date: "2024", title: "Attention enters the policy conversation", text: "School leaders begin sharing local phone rules as part of wider conversations about classroom focus.", source: "Education department note" },
      { date: "August 2026", title: "Parents ask for consistency", text: "Parent groups call for clearer guidance across public and private schools.", source: "The Civic Review" },
      { date: "November 2026", title: "A flexible draft arrives", text: "The guidance sets principles but gives schools discretion over storage, exceptions, and enforcement.", source: "Education department note" },
    ],
    lenses: [
      { label: "Political", text: "A flexible rule lets schools adapt, but makes comparison and accountability harder.", affected: "School boards, principals, parent associations" },
      { label: "Economic", text: "Storage systems and digital alternatives may add cost where budgets are already tight.", affected: "Government schools, low-income families, school operators" },
      { label: "Social", text: "A blanket rule can protect attention but may overlook care responsibilities and accessibility needs.", affected: "Students with health needs, caregivers, teachers" },
      { label: "Environmental", text: "Limited direct impact identified.", affected: "Limited impact identified" },
      { label: "Global / India-specific", text: "The Indian question is how a diverse school system can create common guardrails without pretending every classroom is the same.", affected: "Students and teachers across varied school systems" },
    ],
    perspectives: [
      { outlet: "The Civic Review", frame: "Local discretion", note: "Focuses on the practical reality of schools setting their own rules." },
      { outlet: "Learning Line", frame: "Student agency", note: "Asks whether students have a meaningful role in designing the policy." },
      { outlet: "The Morning Desk", frame: "Classroom focus", note: "Highlights teacher reports about interruption and distraction." },
    ],
    scenarios: [
      { title: "Quiet consistency", text: "Schools converge on simple storage rules while keeping exceptions visible and limited.", watch: "Published school policies, exception rates" },
      { title: "Uneven enforcement", text: "The same guidance produces very different experiences depending on school resources and leadership.", watch: "Parent complaints, student council responses" },
    ],
    posts: [
      { id: "s1", author: "Mira Shah", initials: "MS", role: "Teacher", type: "Opinion", body: "A policy is only as fair as its exceptions. The school needs to say how a student can ask for one without turning it into a public performance.", time: "48 min ago", agree: 27, disagree: 4 },
      { id: "s2", author: "Arjun Bhat", initials: "AB", role: "Parent", type: "Evidence-backed argument", body: "The draft is useful because it does not pretend one rule can fit every campus. The harder work is publishing what each school actually decides.", time: "2 hr ago", agree: 16, disagree: 2, checked: true },
    ],
  },
  {
    id: "coastal-resilience-fund",
    kicker: "POLICY / GLOBAL CONTEXT",
    title: "A coastal fund sounds broad. The small print is where it matters",
    dek: "A new resilience package links local protection projects to a wider argument about who pays for adaptation.",
    source: "The Public Ledger",
    published: "05 November 2026",
    readingTime: "7 min read",
    topic: "Politics",
    place: "Chennai",
    evidence: "Confirmed by multiple sources",
    summary: "The package would bring together shoreline mapping, insurance pilots, and local infrastructure grants. Its headline number is attention-grabbing, but the practical test will be how funds are allocated between protection, relocation, and everyday maintenance.",
    claims: [
      { text: "The package combines mapping, local grants, and insurance pilots.", evidence: "Confirmed by multiple sources", sources: ["Finance ministry release", "Coastal cities note"] },
      { text: "The programme guarantees protection for every exposed settlement.", evidence: "Disputed", sources: ["Finance ministry release", "Coastal cities note"] },
    ],
    timeline: [
      { date: "2022", title: "Local maps reveal uneven exposure", text: "City-level work identifies risk that broad coastal categories had previously hidden.", source: "Coastal cities note" },
      { date: "2025", title: "Maintenance joins the debate", text: "Engineers and residents argue that small drainage and dune projects may matter as much as flagship walls.", source: "Coastal cities note" },
      { date: "November 2026", title: "A national package is announced", text: "The package creates multiple funding lanes but leaves the final allocation rules to implementation documents.", source: "Finance ministry release" },
    ],
    lenses: [
      { label: "Political", text: "Allocation rules will decide whether local governments can shape projects or only apply for them.", affected: "Coastal municipalities, state disaster agencies" },
      { label: "Economic", text: "Insurance pilots may spread risk, but premiums and eligibility will determine who benefits.", affected: "Fishers, small businesses, port communities" },
      { label: "Social", text: "Protection and relocation are not interchangeable when work, memory, and community networks are place-based.", affected: "Fishing communities, renters, informal settlements" },
      { label: "Environmental", text: "Hard barriers can reduce one risk while moving pressure along the coast.", affected: "Wetlands, mangroves, shore ecosystems" },
      { label: "Global / India-specific", text: "The package sits inside a global adaptation problem, but the delivery choices are local and political.", affected: "Coastal cities across India" },
    ],
    perspectives: [
      { outlet: "The Public Ledger", frame: "Delivery rules", note: "Questions who gets to decide where resilience money goes." },
      { outlet: "Coastal Cities Note", frame: "Local maintenance", note: "Focuses on smaller projects and the case for steady upkeep." },
      { outlet: "The Morning Desk", frame: "Headline funding", note: "Emphasises the size of the announcement and the international context." },
    ],
    scenarios: [
      { title: "Funds follow local maps", text: "Allocation begins with neighbourhood exposure rather than a one-size-fits-all coast line.", watch: "Guidance on eligibility and public mapping" },
      { title: "The headline outruns delivery", text: "The package attracts attention, but implementation remains slow and fragmented.", watch: "First-year disbursement, local tender notices" },
    ],
    posts: [
      { id: "c1", author: "Leela Krishnan", initials: "LK", role: "Researcher", type: "Opinion", body: "The funding is welcome, but ‘resilience’ should not become a way to avoid the harder conversation about who can stay and who is asked to move.", time: "1 hr ago", agree: 31, disagree: 6 },
      { id: "c2", author: "Dev Malik", initials: "DM", role: "Policy student", type: "Question", body: "Will the allocation rules be published before local bodies start proposing projects?", time: "4 hr ago", agree: 8, disagree: 0 },
    ],
  },
  {
    id: "the-cost-of-the-next-rupee",
    kicker: "ECONOMY / EVERYDAY LIFE",
    title: "The cost of the next rupee is becoming a household question",
    dek: "A policy decision on borrowing moves quickly through markets, slowly through family budgets, and differently for each borrower.",
    source: "The Daily Current",
    published: "04 November 2026",
    readingTime: "5 min read",
    topic: "Governance",
    place: "Mumbai",
    evidence: "Single source",
    summary: "The latest rate decision keeps the focus on a familiar trade-off: support growth without allowing price pressures to settle in. For households, the effect arrives through loans, savings, and the confidence to spend.",
    claims: [
      { text: "The decision leaves the benchmark rate unchanged.", evidence: "Confirmed by multiple sources", sources: ["Central bank statement", "The Daily Current"] },
      { text: "Home-loan rates will fall immediately.", evidence: "Disputed", sources: ["Central bank statement", "Bank circular"] },
    ],
    timeline: [
      { date: "Early 2026", title: "Inflation cools unevenly", text: "Headline pressure eases while food and housing costs remain more visible to households.", source: "Central bank statement" },
      { date: "October 2026", title: "Borrowers wait for a signal", text: "Banks and borrowers watch the next policy meeting for clarity on the cost of credit.", source: "The Daily Current" },
      { date: "November 2026", title: "The benchmark holds", text: "The decision keeps the current stance and repeats a cautious view of inflation risks.", source: "Central bank statement" },
    ],
    lenses: [
      { label: "Political", text: "The central bank must communicate a technical decision in terms that households can understand.", affected: "Borrowers, savers, elected officials" },
      { label: "Economic", text: "Holding rates keeps options open but does not make credit cheaper by itself.", affected: "Home-loan holders, small firms, first-time borrowers" },
      { label: "Social", text: "The same rate environment feels different to a student, a farmer, and a salaried borrower.", affected: "Students, farmers, home-loan holders" },
      { label: "Environmental", text: "Limited direct impact identified.", affected: "Limited impact identified" },
      { label: "Global / India-specific", text: "Domestic policy is shaped by global capital flows, but household consequences remain local.", affected: "Indian households and small businesses" },
    ],
    perspectives: [
      { outlet: "The Daily Current", frame: "Household transmission", note: "Explains how the decision may travel into borrowing and saving." },
      { outlet: "Market Ledger", frame: "Policy flexibility", note: "Focuses on what the decision keeps possible at the next meeting." },
      { outlet: "People’s Finance", frame: "Uneven impact", note: "Looks at who feels a rate change first and who does not." },
    ],
    scenarios: [
      { title: "A slow pass-through", text: "Banks adjust selectively while households continue to see mixed signals on loan costs.", watch: "Bank rate sheets, new-loan offers" },
      { title: "Confidence returns", text: "If inflation stays calmer, spending and borrowing decisions may become less hesitant.", watch: "Consumer surveys, credit growth" },
    ],
    posts: [
      { id: "r1", author: "Kabir Sethi", initials: "KS", role: "Home-loan holder", type: "Opinion", body: "The headline says unchanged, but the personal experience is still change: rent, school fees, and a loan all react on different clocks.", time: "2 hr ago", agree: 19, disagree: 3 },
      { id: "r2", author: "Sana Iyer", initials: "SI", role: "Economics student", type: "Evidence-backed argument", body: "A benchmark decision is not the same thing as an immediate retail rate move. That distinction is small in the headline and large in a budget.", time: "5 hr ago", agree: 12, disagree: 1, checked: true },
    ],
  },
  {
    id: "the-new-civic-contract",
    kicker: "VALUES / PUBLIC LIFE",
    title: "What we owe one another when the rules are unclear",
    dek: "A dispute over a public facility becomes a smaller, sharper question about fairness, access, and the language of shared life.",
    source: "The Civic Review",
    published: "02 November 2026",
    readingTime: "6 min read",
    topic: "Moral values",
    place: "Pune",
    evidence: "Disputed",
    summary: "A local access dispute has become a proxy for a larger argument about how public institutions balance formal rules with everyday need. The available record supports several parts of the timeline, but not a single settled account of intent.",
    claims: [
      { text: "The facility changed its access policy during a period of high demand.", evidence: "Confirmed by multiple sources", sources: ["Facility notice", "The Civic Review"] },
      { text: "The change was designed to exclude a specific group.", evidence: "Disputed", sources: ["Facility notice", "Resident statement"] },
    ],
    timeline: [
      { date: "September 2026", title: "Demand rises", text: "A public facility reports pressure on capacity and publishes a short-term access note.", source: "Facility notice" },
      { date: "October 2026", title: "Residents challenge the rule", text: "A group of residents asks for clearer reasons and a public review of the access change.", source: "Resident statement" },
      { date: "November 2026", title: "The dispute moves online", text: "Conflicting accounts circulate, making the original notice harder to separate from interpretation.", source: "The Civic Review" },
    ],
    lenses: [
      { label: "Political", text: "Trust depends on whether a public institution can explain a difficult rule and invite challenge.", affected: "Facility managers, local representatives, residents" },
      { label: "Economic", text: "Limited direct impact identified.", affected: "Limited impact identified" },
      { label: "Social", text: "A policy can be formally equal and still feel unequal when access needs vary.", affected: "Families, older residents, people with disabilities" },
      { label: "Environmental", text: "Limited direct impact identified.", affected: "Limited impact identified" },
      { label: "Global / India-specific", text: "The local argument echoes a wider civic question: how do public rules stay legitimate when needs conflict?", affected: "People using shared public institutions" },
    ],
    perspectives: [
      { outlet: "The Civic Review", frame: "Institutional trust", note: "Focuses on process, notice, and the public record." },
      { outlet: "Neighbourhood Paper", frame: "Everyday access", note: "Starts with how the change was experienced by residents." },
      { outlet: "The Morning Desk", frame: "Polarised debate", note: "Describes the language of the argument and its online spread." },
    ],
    scenarios: [
      { title: "A clearer rule", text: "The institution publishes criteria and a review process, lowering the temperature without ending disagreement.", watch: "Revised notice, meeting minutes" },
      { title: "The record stays contested", text: "The dispute continues because each side treats a different account as the starting point.", watch: "Independent review, correction requests" },
    ],
    posts: [
      { id: "v1", author: "Meera Joshi", initials: "MJ", role: "Resident", type: "Opinion", body: "Fairness is not only the outcome. It is also whether the people affected can see the reason and contest it without being labelled difficult.", time: "Yesterday", agree: 24, disagree: 5 },
      { id: "v2", author: "Adil Khan", initials: "AK", role: "Community volunteer", type: "Question", body: "Is there a public version of the original notice? A lot of the argument seems to be built from screenshots without context.", time: "Yesterday", agree: 11, disagree: 0 },
    ],
  },
];

export const topics = ["All stories", "Politics", "Governance", "Moral values", "Social issues"];

export const mostDiscussed = [
  { label: "01", title: "The water question is no longer a summer story", count: "42 voices", id: "water-and-the-city" },
  { label: "02", title: "Schools are writing the first draft of a screen-time policy", count: "29 voices", id: "schools-and-screen-time" },
  { label: "03", title: "What we owe one another when the rules are unclear", count: "21 voices", id: "the-new-civic-contract" },
];
