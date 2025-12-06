const en = {
  navbar: {
    logo: "DURL Checker",
    theme: "Theme",
    language: "Language",
  },
  home: {
    title: "URL Link Verification & SEO Audit",
    description: "A tool to check 404, duplicate links, and SEO audit in one place",
    tpye: "Types of Testing",
    input: "URL to be checked",
    inputPlaceholder: "Paste URL to verify...",
    buttonCheck: "Check",
    errorRequired: "Please enter at least 1 URL",
    errorInvalid: "Link is incorrectly formatted or does not exist",
    errorDuplicate: "There are duplicate URLs in the list",
    errorNotFound: "One or more links are not found or do not exist",
    errorOther: "An error occurred with the URL(s). Please try again.",

    error: "Please enter at least 1 URL",
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
    loginInfo: "Please log in with Discord to enable Webhook / Bot Token setup and Discord bot integration.",
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
};

export default en;
