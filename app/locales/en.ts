const en = {
  navbar: {
    logo: "DURL Checker",
    theme: "Theme",
    language: "Language",
    logout: "Logout",
    login: "Login with Discord",
  },
  home: {
    title: "URL Link Verification & SEO Audit",
    description: "A tool to check 404, duplicate links, and SEO audit in one place",
    tpye: "Types of Testing",
    input: "URL to be checked",
    inputPlaceholder: "Paste URL to verify...",
    buttonCheck: "Check",
    buttonLoad: "Checking...",
    errorRequired: "Please enter at least 1 URL",
    errorInvalid: "Link is incorrectly formatted",
    errorDuplicate: "There are duplicate URLs in the list",
    errorNotFound: "One or more links are not found or do not exist",
    errorOther: "An error occurred with the URL(s). Please try again.",
  },
  result: {
    title: "Test results",
    noResult: "No results found",

    columnUrl: "URL",
    columnTestType: "Test type",
    columnHasIssue: "Has issues?",
    columnIssueSummary: "Issue details",

    statusHasIssue: "Has issues",
    statusNoIssue: "OK",

    selectedSummary: "Selected {{selected}} / {{total}} rows",

    filterLabel: "Filter",
    filterAll: "All",
    filter404: "404",
    filterDuplicate: "Duplicate",
    filterSeo: "SEO",

    groupBasic: "Basic",
    groupIndexing: "Indexing",
    groupStructure: "Structure",
    groupSocial: "Social",
    groupSchemaLinks: "Schema & Links",
    groupQuality: "Quality",
    groupOthers: "Others",

    menuLabel: "Row menu",
    selectVisible: "Select visible",
    clearSelection: "Clear selection",
    exportButton: "Export",
    selectAll: "Select all",
    duplicateProblemLabel: "Duplicate problem",
  },
  export: {
    title: "Export selected URLs",
    description: "Export {{count}} item(s). Select file format and click Export.",
    selectedCount: "{{count}} selected",
    formatJSON: "JSON",
    formatTXT: "TXT",
    noItems: "No items selected.",
    showing: "Showing {{start}}-{{end}} of {{total}}",
    pageLabel: "Page {{page}} / {{totalPages}}",
    prev: "Prev",
    next: "Next",
    cancel: "Cancel",
    export: "Export",
    btnExport: "Export",
    btnTrigger: "Export",
    pagePrefix: "Page",
  },
  info: {
    whatIsDropURLTitle: "What is DropURL?",
    whatIsDropURLDesc:
      "DropURL is a tool that helps you quickly scan and analyze URLs. It checks for broken links (404 errors), duplicate URLs, and basic SEO issues to keep your website clean, optimized, and error-free.",

    check404Title: "What is a 404 error?",
    check404Desc:
      "A 404 error occurs when a URL cannot be found. DropURL helps identify pages that are missing or unreachable so you can fix them before they affect user experience or SEO.",

    duplicateTitle: "What are duplicate URLs?",
    duplicateDesc:
      "Duplicate URLs point to the same content or repeat unnecessarily. They can confuse search engines, waste crawl budget, and hurt SEO performance. DropURL helps detect them instantly.",

    seoTitle: "Why check SEO issues?",
    seoDesc:
      "Basic SEO checks help ensure your URLs follow good structure, avoid issues, and remain optimized. DropURL highlights potential problems so you can keep your website performing well.",
  },
  discord: {
    helpTooltip: "Open Droppy chatbot / connect Discord",
    title: "Connect DropURL with Discord",
    description: "Configure integration so users can send URLs in Discord and DropURL will analyze and summarize with AI.",

    loginRequired: "You have not connected your Discord account to DropURL",
    loginInfo: "Please log in with Discord before using Droppy.",
    loginButton: "Login with Discord",

    connectedAs: "Connected as",

    webhookLabel: "Discord Webhook URL",
    webhookDesc: "Used when you want DropURL to send results back directly to a Discord channel via Webhook.",

    botTokenLabel: "Discord Bot Token (if using your own bot)",
    botTokenDesc: "Needed if you want your bot to call DropURL's API and reply to users automatically.",

    flowTitle: "Workflow Example",
    flow1: "User types !check https://example.com in Discord",
    flow2: "Bot calls /api/discord-check on DropURL",
    flow3: "DropURL scans 404 / Duplicate / SEO and summarizes with AI",
    flow4: "Bot sends summarized result back to Discord",

    cancel: "Cancel",
    save: "Save settings",
  },
  terms: {
    title: "Terms & Conditions",
    updated: "Last updated: 2025",

    intro:
      "Welcome to DropURL. By accessing or using our website, tools, and services, you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use immediately.",

    s1_title: "1. Service Description",
    s1_desc:
      "DropURL provides web-based tools for URL analysis, website crawling, SEO inspection, and related diagnostics. The service may include single URL checks, site-wide crawls, and AI-assisted summaries.",

    s2_title: "2. User Responsibilities",
    s2_list: [
      "Use the service only for lawful purposes.",
      "Do not attempt to overload, disrupt, or exploit the service.",
      "Do not crawl or analyze websites without proper authorization.",
      "Ensure that submitted URLs comply with applicable laws.",
    ],

    s3_title: "3. Crawling & Analysis Limitations",
    s3_desc:
      "DropURL performs automated requests to publicly accessible web resources. We do not guarantee full coverage, accuracy, or completeness of crawl results, especially for dynamic, restricted, or protected content.",

    s4_title: "4. AI-Generated Insights",
    s4_desc:
      "Any AI-generated analysis, recommendations, or summaries are provided for informational purposes only and should not be considered professional, legal, or technical advice.",

    s5_title: "5. Intellectual Property",
    s5_desc:
      "All branding, software, interfaces, and original content related to DropURL are the intellectual property of the DropURL project and may not be copied, modified, or redistributed without permission.",

    s6_title: "6. Limitation of Liability",
    s6_desc:
      "DropURL shall not be liable for any damages arising from the use of the service, except where such damages result directly from defects or errors in our system. All information and analysis provided are for reference purposes only and should not be considered professional, legal, or technical advice.",

    s7_title: "7. Service Availability & Changes",
    s7_desc:
      "We reserve the right to modify, suspend, or discontinue any part of the service at any time without prior notice.",

    s8_title: "8. Governing Law",
    s8_desc:
      "These Terms & Conditions shall be governed by and construed in accordance with the laws of Thailand.",

    s9_title: "9. Contact",
    s9_desc: "If you have any questions regarding these Terms, please contact us at ",
  },
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: 2025",

    intro1:
      "This Privacy Policy applies to all services and business processes carried out by DropURL, hereinafter referred to as the Data Controller.",

    intro2:
      "This policy explains how personal data is collected, processed, and protected when you use our website and services, including the purposes and methods of processing, as well as processing performed on behalf of our users.",

    s1_title: "1. Purpose of Processing Personal Data",
    s1_desc:
      "Processing of personal data is necessary to operate DropURL and to provide our services effectively. Personal data may be processed for the following purposes:",
    s1_list: [
      "Service operation and platform functionality",
      "User support and communication",
      "Service improvement and analytics",
      "Security, abuse prevention, and legal compliance",
    ],
    s1_note:
      "For marketing communications (such as email notifications), explicit consent is obtained in advance where required by law. By using DropURL, you acknowledge and accept the practices described in this Privacy Policy.",

    s2_title: "2. Data Controller",
    s2_desc: "Data Controller: DropURL",

    s3_title: "3. Personal Data Collected",
    s3_desc:
      "Depending on how you interact with DropURL, we may collect and process the following types of personal data:",
    s3_list: [
      "URLs and website data submitted for analysis",
      "Contact information when you reach out for support",
      "Technical data such as IP address, browser type, and usage logs",
    ],

    s4_title: "4. Data Storage and Data Sharing",
    s4_desc1:
      "Personal data is stored securely using trusted infrastructure and access controls. We do not sell or rent personal data to third parties.",
    s4_desc2:
      "Data may be shared with third-party service providers only when necessary to operate the service or comply with legal obligations.",

    s5_title: "5. Communication via Email",
    s5_desc1:
      "We may send service-related emails that are necessary for the operation of DropURL. These communications are considered a legitimate interest and do not require additional consent.",
    s5_desc2:
      "If marketing emails are used, they will only be sent with your explicit consent. You may unsubscribe at any time using the link provided in the email.",

    s6_title: "6. Your Rights",
    s6_desc:
      "You have the right to request access to, correction of, or deletion of your personal data, subject to applicable data protection laws.",

    s7_title: "7. Data Retention and Deletion",
    s7_desc:
      "Personal data is retained only for as long as necessary to fulfill the purposes for which it was collected, unless a longer retention period is required by law.",
  },
  mode: {
    single: "Single URL",
    crawl: "Site Crawl"
  },
  crawl: {
    depthLabel: "Depth",
    depthTooltip: "How deep the crawler should follow links from the starting page.",
    depth0: "Current page only",
    depth1: "Depth 1 (links on this page)",
    depth2: "Depth 2 (links of links)",
    sameDomainLabel: "Same domain only",
    sameDomainTooltip: "Only crawl links within the same website. Turn off to include external links.",
    errorCrawlMultiUrl: "Site Crawl with depth supports only one URL at a time."
  }
};

export default en;
