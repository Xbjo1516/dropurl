const th = {
  navbar: {
    logo: "DURL Checker",
    theme: "ธีม",
    language: "ภาษา",
  },
  home: {
    title: "ตรวจสอบและวิเคราะห์ลิงก์ URL",
    description: "เครื่องมือนี้ช่วยตรวจ 404, ลิงก์ซ้ำ และวิเคราะห์ SEO ในที่เดียว",
    tpye: "ประเภทการตรวจสอบ",
    input: "URL ที่ต้องการตรวจสอบ",
    inputPlaceholder: "วางลิงก์ที่ต้องการตรวจสอบ...",
    buttonCheck: "ตรวจสอบ",

    errorRequired: "กรุณากรอกอย่างน้อย 1 URL",
    errorInvalid: "เขียนลิงค์ผิดหรือไม่มีอยู่จริง",
    errorDuplicate: "มีลิงก์ที่ซ้ำกันอยู่",
    errorNotFound: "ลิงก์ไม่ถูกต้องหรือไม่มีอยู่จริง",
    errorOther: "URL เกิดข้อผิดพลาด กรุณากรอกใหม่",

    error: "กรุณากรอกอย่างน้อย 1 URL",
  },
  result: {
    title: "ผลการตรวจสอบ",
    noResult: "ไม่พบผลการตรวจสอบ",

    columnUrl: "ลิงก์",
    columnTestType: "ประเภทเทส",
    columnHasIssue: "มีปัญหาหรือไม่",
    columnIssueSummary: "ปัญหาติดที่ตรงไหน",

    statusHasIssue: "มีปัญหา",
    statusNoIssue: "ปกติ",

    selectedSummary: "เลือก {{selected}} / {{total}} รายการ",

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
    groupOthers: "อื่น ๆ",

    menuLabel: "เมนูของแถวนี้",
    selectVisible: "เลือกแสดง",
    clearSelection: "ล้างการเลือก",
    exportButton: "ส่งออก",
    selectAll: "เลือกทั้งหมด",
    duplicateProblemLabel: "Duplicate problem",
  },
  export: {
    title: "ส่งออกลิงก์ที่เลือก",
    description: "ส่งออก {{count}} รายการ เลือกรูปแบบไฟล์แล้วกดส่งออก",
    selectedCount: "{{count}} รายการที่เลือก",
    formatJSON: "JSON",
    formatTXT: "TXT",
    noItems: "ยังไม่มีรายการที่เลือก",
    showing: "แสดง {{start}}-{{end}} จาก {{total}}",
    pageLabel: "หน้า {{page}} / {{totalPages}}",
    prev: "ก่อนหน้า",
    next: "ถัดไป",
    cancel: "ยกเลิก",
    export: "ส่งออก",
    btnExport: "ส่งออก",
    btnTrigger: "ส่งออก",
    pagePrefix: "หน้า",
  },
  info: {
    whatIsDropURLTitle: "DropURL คืออะไร?",
    whatIsDropURLDesc:
      "DropURL คือเครื่องมือตรวจสอบ URL ที่ช่วยสแกนลิงก์อย่างรวดเร็ว ตรวจหา 404 ลิงก์ซ้ำ รวมถึงปัญหา SEO เบื้องต้น เพื่อให้เว็บไซต์ของคุณสะอาด ใช้งานได้ดี และไม่มีข้อผิดพลาด.",

    check404Title: "404 คืออะไร?",
    check404Desc:
      "ข้อผิดพลาด 404 เกิดขึ้นเมื่อ URL ไม่สามารถเข้าถึงได้ เช่น หน้าถูกลบ ย้าย หรือไม่เคยมีอยู่ DropURL ช่วยตรวจหาลิงก์ที่เสียก่อนที่จะสร้างผลกระทบต่อผู้ใช้หรือ SEO.",

    duplicateTitle: "ลิงก์ซ้ำ (Duplicate URLs) คืออะไร?",
    duplicateDesc:
      "ลิงก์ซ้ำคือ URL ที่ชี้ไปยังเนื้อหาเดียวกันหรือซ้ำโดยไม่จำเป็น ซึ่งทำให้เสิร์ชเอนจินสับสน เปลือง crawl budget และส่งผลเสียต่อ SEO — DropURL สามารถตรวจพบได้ทันที.",

    seoTitle: "ทำไมต้องตรวจ SEO?",
    seoDesc:
      "การตรวจ SEO เบื้องต้นช่วยให้ URL มีโครงสร้างที่ดี ลดข้อผิดพลาด และเพิ่มประสิทธิภาพของเว็บไซต์ DropURL ช่วยชี้จุดที่ควรแก้ไขเพื่อให้เว็บไซต์เติบโตได้ดีที่สุด.",
  },
  discord: {
    helpTooltip: "เปิดแชทบอท Droppy / เชื่อม Discord",
    title: "เชื่อม DropURL กับ Discord",
    description: "ตั้งค่าการเชื่อมต่อระหว่างบอท Discord กับ DropURL เพื่อให้ผู้ใช้ส่งลิงก์ใน Discord แล้วรับผลสรุปจาก AI",

    loginRequired: "คุณยังไม่ได้เชื่อมบัญชี Discord เข้ากับ DropURL",
    loginInfo: "กรุณาล็อกอินด้วย Discord ก่อน จากนั้นจึงจะสามารถตั้งค่า Webhook / Bot Token และใช้งานได้",
    loginButton: "เข้าสู่ระบบด้วย Discord",

    connectedAs: "เชื่อมต่อแล้วในชื่อ",

    webhookLabel: "Discord Webhook URL",
    webhookDesc: "ใช้ในกรณีที่ต้องการให้ DropURL ส่งผลกลับไปที่ช่อง (channel) โดยตรงผ่าน Webhook",

    botTokenLabel: "Discord Bot Token (ถ้าคุณมีบอทของตัวเอง)",
    botTokenDesc: "ใช้ในกรณีที่ต้องการให้บอทเรียก API ของ DropURL และตอบกลับผู้ใช้ได้",

    flowTitle: "Flow การทำงาน (ตัวอย่าง)",
    flow1: "ผู้ใช้พิมพ์ !check https://example.com ใน Discord",
    flow2: "บอทเรียก API /api/discord-check ที่ DropURL",
    flow3: "DropURL ตรวจ 404 / Duplicate / SEO และสรุปผลด้วย AI",
    flow4: "บอทส่งข้อความสรุปกลับไปใน Discord",

    cancel: "ยกเลิก",
    save: "บันทึกการตั้งค่า",
  },
};

export default th;
