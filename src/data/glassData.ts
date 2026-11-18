import { Mission, QuizQuestion, StationData } from '../types/simulation';

export const STATIONS_DATA: StationData[] = [
  {
    id: 0,
    code: 'STATION 01',
    shortName: '1. Batch House',
    title: 'สถานีเตรียมและผสมวัตถุดิบ (Batch House & Charger)',
    subtitle: 'Silos, Intensive Pan Mixer & Screw Batch Charger',
    principle:
      'วัตถุดิบหลัก ได้แก่ ทรายแก้ว (SiO₂ ~72%), โซดาแอช (Na₂CO₃ ~13%), หินปูน (CaCO₃ ~10%) และเศษแก้วรีไซเคิล (Cullet) จะถูกชั่งตวงด้วยระบบ Load Cell ความละเอียดสูง คลุกเคล้าในเครื่องผสมความเร็วสูง (Intensive Mixer) แล้วป้อนเข้าเตาหลอมอย่างต่อเนื่องตามระดับน้ำแก้ว',
    keyTakeaway:
      'ทุกๆ 10% ของเศษแก้วรีไซเคิล (Cullet) ที่ผสมเพิ่มลงไป จะช่วยลดการใช้พลังงานเชื้อเพลิงเตาหลอมได้ประมาณ 2.5–3% และลดการปล่อยก๊าซ CO₂ จากปฏิกิริยาการสลายตัวของคาร์บอเนต',
    formula: {
      expression: 'SiO₂ (72%) + Na₂CO₃ (13%) + CaCO₃ (10%) + Cullet → Soda-Lime Glass + CO₂↑',
      caption: 'สมการวัตถุดิบหลักของการผลิตแก้วโซดาไลม์ (Soda-Lime Silicate Glass)',
    },
    specs: [
      { label: 'ความแม่นยำการชั่ง', val: '±0.1% Full Scale' },
      { label: 'ความชื้น Batch', val: '2.5% – 3.5%' },
      { label: 'เวลาผสมต่อรอบ', val: '180 วินาที' },
      { label: 'สัดส่วน Cullet', val: '0% – 50%' },
    ],
    pmCheckpoints: [
      'สอบเทียบ (Calibrate) เซนเซอร์ Load Cell ถังชั่งวัตถุดิบทุกสัปดาห์',
      'ตรวจสอบการสึกหรอของใบพัดกวนในเครื่อง Intensive Mixer และรางสกรู Batch Charger',
      'ตรวจเช็กชุดแม่เหล็กแยกโลหะ (Magnetic Separator) บนสายพาน Cullet ป้องกันเศษเหล็กเข้าเตา',
    ],
    commonDefects: [
      {
        name: 'ก้อนหินในเนื้อแก้ว (Stones)',
        cause: 'เม็ดทรายขนาดใหญ่เกินมาตรฐานหรือผสม Batch ไม่สม่ำเสมอ',
        remedy: 'ตรวจสอบตะแกรงร่อนทรายและเวลาคลุกเคล้าใน Intensive Mixer',
      },
      {
        name: 'สีแก้วเพี้ยน (Color Shift)',
        cause: 'เศษเหล็กหรือโลหะปนเปื้อนมากับสายพาน Cullet',
        remedy: 'ตรวจสอบและทำความสะอาด Magnetic Separator',
      },
    ],
    presetControls: { culletRatio: 40, furnaceTemp: 1510 },
    x: 20,
    w: 170,
  },
  {
    id: 1,
    code: 'STATION 02',
    shortName: '2. Melting Furnace',
    title: 'เตาหลอมและรางลำเลียงน้ำแก้ว (Melting Furnace & Forehearth)',
    subtitle: 'Regenerative Melting Furnace & Conditioning Channel',
    principle:
      'เตาหลอมแบบแลกเปลี่ยนความร้อน (Regenerative) สลับฝั่งหัวเผาทุก 20 นาทีเพื่อนำความร้อนจากไอเสียกลับมาอุ่นอากาศ หลอมวัตถุดิบที่ ~1,520°C จากนั้นน้ำแก้วจะไหลเข้าโซน Refining เพื่อไล่ฟองอากาศออก และลดอุณหภูมิในราง Forehearth เหลือ ~1,150°C เพื่อคุมความหนืดให้คงที่',
    keyTakeaway:
      'ความหนืดของน้ำแก้ว (Viscosity) แปรผกผันกับอุณหภูมิ หากเตาเย็นเกินไปน้ำแก้วจะหนืดจนฟองก๊าซลอยตัวออกไม่ทัน (เกิดตำหนิ Blister/Seed) แต่หากร้อนเกินไปจะสิ้นเปลืองเชื้อเพลิงและอิฐทนไฟสึกหรอเร็ว',
    formula: {
      expression: 'log₁₀ η (Poise) ≈ 3.12 ที่อุณหภูมิ 1,520°C (Gob Conditioning)',
      caption: 'ความสัมพันธ์แบบ Arrhenius ระหว่างอุณหภูมิและความหนืดของน้ำแก้ว',
    },
    specs: [
      { label: 'อุณหภูมิโซนหลอม', val: '1,500 – 1,550 °C' },
      { label: 'อุณหภูมิ Forehearth', val: '1,120 – 1,180 °C' },
      { label: 'รอบสลับหัวเผา', val: 'ทุก 20 – 30 นาที' },
      { label: 'อายุการใช้งานเตา', val: '8 – 12 ปี (ต่อเนื่อง)' },
    ],
    pmCheckpoints: [
      'ส่องกล้องวัดอุณหภูมิผนังอิฐทนไฟ (Refractory Thermography) ตรวจจุดร้อนผิดปกติ',
      'ทำความสะอาดหัวฉีดก๊าซ (Burner Nozzles) และตรวจวาล์วสลับทิศทาง (Reversing Valve)',
      'ตรวจสอบแท่งอิเล็กโทรดโมลิบดีนัม (Electric Boosting) และระดับน้ำแก้ว (Glass Level Sensor)',
    ],
    commonDefects: [
      {
        name: 'ฟองอากาศ (Blisters / Seeds)',
        cause: 'อุณหภูมิหลอมต่ำกว่าเกณฑ์ หรือความดันก๊าซหัวเผาแกว่ง',
        remedy: 'ปรับอุณหภูมิเตาเข้าสู่ช่วง 1,510–1,540°C และควบคุมแรงดันก๊าซให้เสถียร',
      },
      {
        name: 'เส้นลายคลื่น (Cord / Striae)',
        cause: 'การผสมเนื้อน้ำแก้วในโซน Refining ไม่สม่ำเสมอ',
        remedy: 'ตรวจสอบกระแสความร้อนในบ่อหลอมและระบบ Electric Boosting',
      },
    ],
    presetControls: { furnaceTemp: 1430 },
    x: 205,
    w: 235,
  },
  {
    id: 2,
    code: 'STATION 03',
    shortName: '3. Gob Feeder',
    title: 'ชุดป้อนและตัดก้อนน้ำแก้ว (Gob Feeder & Shears)',
    subtitle: 'Reciprocating Plunger, Orifice Ring & Shear Mechanism',
    principle:
      'ที่ปลายสุดของราง Forehearth แท่งลูกสูบ (Plunger) จะเคลื่อนที่ขึ้นลงสัมพันธ์กับใบมีดกลไก (Shears) เพื่อตัดลำน้ำแก้วที่ไหลผ่านรู Orifice Ring ให้กลายเป็นก้อนแก้วทรงกระบอก (Gob) ที่มีน้ำหนักและอุณหภูมิแม่นยำ ก่อนส่งลงรางเข้าสู่แม่พิมพ์',
    keyTakeaway:
      'จังหวะความเร็วในการตัดก้อน Gob (cuts/min) ต้องสมดุลกับความสามารถในการระบายความร้อนของแม่พิมพ์ หากตัดเร็วเกินไป แม่พิมพ์จะสะสมความร้อนจนชิ้นงานเสียรูปทรง',
    formula: {
      expression: 'Mass Flow (kg/hr) = Gob Weight (g) × Cutting Speed (cuts/min) × 0.06',
      caption: 'อัตราการดึงน้ำแก้ว (Pull Rate) สัมพันธ์โดยตรงกับน้ำหนักและอัตราการตัด Gob',
    },
    specs: [
      { label: 'ความคลาดเคลื่อนน้ำหนัก', val: '±0.5 กรัม' },
      { label: 'อุณหภูมิก้อน Gob', val: '1,080 – 1,150 °C' },
      { label: 'ความเร็วตัด (Speed)', val: '20 – 80 cuts/min' },
      { label: 'สารหล่อเย็นใบมีด', val: 'Water-Soluble Oil' },
    ],
    pmCheckpoints: [
      'ตรวจสอบความคมและระยะขบของใบมีด Shears เพื่อป้องกันรอยแผล (Shear Mark) บนก้อนแก้ว',
      'ตรวจระบบหัวฉีดน้ำหล่อเย็นและสารหล่อลื่นใบมีดไม่ให้อุดตัน',
      'ตรวจเช็กความสึกหรอของ Orifice Ring และกลไก Servo ของ Plunger',
    ],
    commonDefects: [
      {
        name: 'รอยแผลใบมีด (Shear Mark)',
        cause: 'ใบมีด Shears ทื่อ หรือน้ำหล่อเย็นใบมีดน้อยเกินไป',
        remedy: 'เปลี่ยนใบมีดและปรับอัตราการฉีดสารหล่อเย็น',
      },
      {
        name: 'น้ำหนักแก้วไม่สม่ำเสมอ',
        cause: 'อุณหภูมิ Forehearth แกว่งทำให้ความหนืดเปลี่ยน',
        remedy: 'ปรับเสถียรภาพอุณหภูมิ Forehearth และระยะชัก Plunger',
      },
    ],
    presetControls: { gobSpeed: 70 },
    x: 455,
    w: 120,
  },
  {
    id: 3,
    code: 'STATION 04',
    shortName: '4. Forming Machine',
    title: 'เครื่องจักรขึ้นรูปผลิตภัณฑ์แก้ว (Forming Machine)',
    subtitle: 'H-28 Paste Mold / Rotary Press / IS Machine',
    principle:
      'ขึ้นรูปก้อน Gob ให้เป็นผลิตภัณฑ์ตามต้องการ: (1) H-28 Paste Mold หมุนเป่าในพิมพ์เปียกและลนไฟปากแก้ว (Fire Polishing) สำหรับแก้วน้ำผนังบาง (2) Rotary Press ใช้หัวกดอัดสำหรับจานชามแก้วหนา (3) IS Machine เป่า 2 จังหวะสำหรับขวดโหล',
    keyTakeaway:
      'ลมหล่อเย็นแม่พิมพ์ (Mold Cooling Air) เป็นหัวใจสำคัญในการดึงความร้อนออกจากน้ำแก้วอย่างสม่ำเสมอ หากแรงดันลมตก แม่พิมพ์จะร้อนจัดจนแก้วติดพิมพ์และเสียรูปทรง (Deformed)',
    specs: [
      { label: 'อุณหภูมิแม่พิมพ์', val: '450 – 520 °C' },
      { label: 'แรงดันลมเป่า', val: '2.2 – 3.5 bar' },
      { label: 'ลมหล่อเย็นแม่พิมพ์', val: 'Cooling Blower Air' },
      { label: 'อุณหภูมิแก้วออกพิมพ์', val: '580 – 620 °C' },
    ],
    pmCheckpoints: [
      'ตรวจสอบแรงดันพัดลมหล่อเย็นแม่พิมพ์ (Cooling Air) และท่อจ่ายลมเข้าแต่ละ Section',
      'ทำความสะอาดและเคลือบสารหล่อลื่นแม่พิมพ์ (Mold Swabbing) ตามรอบเวลา',
      'ตรวจเช็กหัวเผา Fire Polishing (สำหรับ H-28) และระบบไฮดรอลิกหัวกด Plunger',
    ],
    commonDefects: [
      {
        name: 'รูปทรงบิดเบี้ยว (Deformed / Bent)',
        cause: 'ลมหล่อเย็นแม่พิมพ์ตก หรือความเร็วตัด Gob สูงเกินขีดจำกัดแม่พิมพ์',
        remedy: 'ตรวจสอบแรงดัน Cooling Air และปรับความเร็วตัด Gob ให้อยู่ในช่วง 40–55 cuts/min',
      },
      {
        name: 'รอยย่นบนผิวแก้ว (Washboard / Waves)',
        cause: 'แม่พิมพ์เย็นเกินไปหรือความหนืดน้ำแก้วสูง',
        remedy: 'ปรับสมดุลอุณหภูมิแม่พิมพ์และอุณหภูมิก้อน Gob',
      },
    ],
    presetControls: { formingMode: 'is' },
    presetFaults: { coolingAir: true },
    x: 590,
    w: 175,
  },
  {
    id: 4,
    code: 'STATION 05',
    shortName: '5. Annealing Lehr',
    title: 'เตาอบลดความเครียด (Annealing Lehr Tunnel)',
    subtitle: 'Continuous Recirculating Tunnel Lehr',
    principle:
      'แก้วที่เพิ่งขึ้นรูปมีความเค้นสะสมภายในสูงจึงต้องเข้าเตาอุโมงค์สายพาน เพื่อปรับอุณหภูมิให้สม่ำเสมอที่ Annealing Point (~550°C) คลายความตึงเครียดของโมเลกุล แล้วค่อยๆ ลดอุณหภูมิผ่าน Strain Point (~500°C) ลงเหลือ ~65°C อย่างควบคุม',
    keyTakeaway:
      'ช่วงอุณหภูมิ 550°C → 500°C คือช่วงวิกฤต (Critical Annealing Range) หากลดอุณหภูมิเร็วเกินไปในโซนนี้ จะเกิดความเค้นตกค้างถาวร (>50 nm/cm) ทำให้แก้วแตกร้าวได้เองแม้ได้รับแรงกระแทกเพียงเล็กน้อย',
    formula: {
      expression: 'Annealing Point (~550°C) ──[Slow Controlled Cool]──▶ Strain Point (~500°C) ──▶ Exit (~65°C)',
      caption: 'เส้นโค้งอบลดความเครียดมาตรฐานสำหรับแก้วโซดาไลม์',
    },
    specs: [
      { label: 'Annealing Point', val: '545 – 560 °C' },
      { label: 'Strain Point', val: '495 – 510 °C' },
      { label: 'อุณหภูมิทางออก', val: '60 – 75 °C' },
      { label: 'ระยะเวลาในเตา', val: '45 – 90 นาที' },
    ],
    pmCheckpoints: [
      'ตรวจสอบการทำงานของพัดลมหมุนเวียนอากาศ (Recirculation Fans) ทุกโซนอุณหภูมิ',
      'ตรวจเช็กความตึงและการเดินแนวตรงของสายพานลวดถัก (Wire Mesh Belt)',
      'สอบเทียบหัววัดอุณหภูมิ Thermocouple ตลอดความยาวอุโมงค์ 6 โซน',
    ],
    commonDefects: [
      {
        name: 'ความเค้นตกค้างสูง / แตกร้าว (Thermal Stress Crack)',
        cause: 'อัตราการเย็นตัวในเตา Lehr เร็วเกินไป (Fast Cooling)',
        remedy: 'ปรับอัตราการเย็นตัวเป็น Standard หรือ Slow และตรวจสอบพัดลมหมุนเวียนอากาศ',
      },
    ],
    presetControls: { annealingRate: 'fast' },
    x: 780,
    w: 230,
  },
  {
    id: 5,
    code: 'STATION 06',
    shortName: '6. Surface Coating',
    title: 'ระบบเคลือบผิวกันรอย (Hot-End & Cold-End Coating)',
    subtitle: 'Tin Oxide Vapor Hood & Polyethylene Sprayer',
    principle:
      'พ่นไอสารประกอบดีบุก (SnCl₄) ที่ผิวแก้วร้อน (~550°C) เป็นชั้นฐานยึดเกาะ (Hot-End Coating) และพ่นสารโพลีเอทิลีนหรือแว็กซ์สูตรน้ำหลังออกจากเตา Lehr (Cold-End Coating) เพื่อเพิ่มความลื่น ลดการเสียดสีและรอยขีดข่วนบนสายพานลำเลียง',
    keyTakeaway:
      'ชั้นฟิล์มดีบุกออกไซด์ (SnO₂) และโพลีเอทิลีนทำงานร่วมกันเพื่อลดค่าสัมประสิทธิ์แรงเสียดทาน (COF < 0.15) ช่วยรักษาความแข็งแรงเชิงกลของผิวแก้วตลอดสายพานความเร็วสูง',
    formula: {
      expression: 'SnCl₄ (vapor) + 2H₂O ──(550°C)──▶ SnO₂ (film on glass) + 4HCl↑',
      caption: 'ปฏิกิริยาการเคลือบชั้นฐาน Hot-End Coating ด้วยไอดีบุกเตตระคลอไรด์',
    },
    specs: [
      { label: 'Hot-End Temp', val: '520 – 560 °C' },
      { label: 'Cold-End Temp', val: '85 – 115 °C' },
      { label: 'ความหนาชั้นฟิล์ม', val: '20 – 40 CTU' },
      { label: 'ค่าสัมประสิทธิ์เสียดทาน', val: 'COF < 0.15' },
    ],
    pmCheckpoints: [
      'ล้างทำความสะอาดหัวฉีดสเปรย์ Cold-End ป้องกันคราบแว็กซ์อุดตัน',
      'ตรวจระบบดูดไอสารเคมี (Exhaust Scrubber) บริเวณอุโมงค์ Hot-End Coating',
      'สุ่มวัดค่าความหนาฟิล์มด้วยเครื่อง Hot-End Coating Meter ทุกกะ',
    ],
    commonDefects: [
      {
        name: 'รอยขีดข่วนจากการกระแทก (Scuffing / Abrasion)',
        cause: 'หัวฉีด Cold-End อุดตัน หรืออุณหภูมิแก้วสูงเกินจนสารเคลือบระเหย',
        remedy: 'ล้างหัวฉีดสเปรย์และควบคุมอุณหภูมิแก้วเข้าโซนเคลือบที่ 85–115°C',
      },
    ],
    x: 1025,
    w: 135,
  },
  {
    id: 6,
    code: 'STATION 07',
    shortName: '7. Cold-End QC & Cullet',
    title: 'ตรวจสอบคุณภาพอัตโนมัติและบดเศษแก้ว (QC & Cullet Loop)',
    subtitle: 'Optical/Laser Inspection, Polariscope & Cullet Crusher',
    principle:
      'ตรวจสอบ 100% ด้วยกล้องความเร็วสูงและเลเซอร์เพื่อหาฟองอากาศ รอยร้าว และขนาดที่เพี้ยน พร้อมสุ่มตรวจความเค้นด้วยแสงโพลาไรซ์ ชิ้นงานดีจะถูกบรรจุลงกล่อง/พาเลท ส่วนชิ้นงานเสียจะถูกดีดลงเครื่องบด (Cullet Crusher) ส่งกลับไปหลอมใหม่ที่สถานี 1',
    keyTakeaway:
      'แก้วเป็นวัสดุที่รีไซเคิลได้ 100% อย่างไม่มีที่สิ้นสุด (Closed-Loop Recycling) ของเสียทุกชิ้นที่ถูกดีดออกที่จุด QC จะถูกบดเป็น Cullet ส่งกลับเข้า Batch House ทันทีโดยไม่สูญเสียคุณภาพเนื้อแก้ว',
    formula: {
      expression: 'Pack-to-Melt Efficiency (%) = (จำนวนชิ้นงานดีที่บรรจุ ÷ จำนวนก้อน Gob ทั้งหมด) × 100',
      caption: 'ดัชนีวัดประสิทธิภาพหลักของโรงงานผลิตแก้วอุตสาหกรรม (เป้าหมาย ≥ 92%)',
    },
    specs: [
      { label: 'ความเร็วตรวจสอบ', val: 'สูงสุด 400 ชิ้น/นาที' },
      { label: 'เกณฑ์ความเค้นสูงสุด', val: '< 50 nm/cm' },
      { label: 'ขนาดเศษแก้วบด', val: '10 – 25 mm' },
      { label: 'อัตราการรีไซเคิล', val: '100% Closed-Loop' },
    ],
    pmCheckpoints: [
      'ทำความสะอาดเลนส์กล้อง Optical Camera และหัวสแกนเลเซอร์ทุกกะการทำงาน',
      'ทดสอบระบบดีดคัดแยก (Reject Pusher) ด้วยชิ้นงานตัวอย่างที่มีตำหนิมาตรฐาน (Test Samples)',
      'ตรวจสอบค้อนบด (Crusher Hammers) และสายพานลำเลียง Cullet กลับสู่ Batch House',
    ],
    commonDefects: [
      {
        name: 'ของเสียหลุดรอด (False Accept)',
        cause: 'เลนส์กล้องสกปรก หรือลมดีดคัดแยก (Reject Air) แรงดันตก',
        remedy: 'ทำความสะอาดเลนส์และทดสอบระบบ Reject Pusher ด้วยชิ้นงานมาตรฐาน',
      },
    ],
    x: 1175,
    w: 205,
  },
];

export const MISSIONS_DATA: Mission[] = [
  {
    id: 'mission-blister',
    number: '01',
    title: 'แก้ปัญหาฟองอากาศพุ่งสูงในเตาหลอม',
    difficulty: 'ระดับพื้นฐาน',
    stationIndex: 1,
    scenario:
      'พนักงานกะก่อนหน้าปรับลดอุณหภูมิเตาหลอมลงเหลือ 1,425°C เพื่อประหยัดเชื้อเพลิง ส่งผลให้น้ำแก้วหนืดเกินไป ฟองอากาศลอยออกไม่ทัน และอัตราการผลิตดี (Pack-to-Melt Efficiency) ตกต่ำกว่าเกณฑ์',
    objectiveSummary: 'ปรับค่าเพื่อให้ Pack-to-Melt Efficiency ≥ 94% และความหนืดอยู่ในช่วง 3.00 – 3.25 log₁₀ Poise',
    hint: 'ลองเพิ่มอุณหภูมิเตาหลอม (Furnace Temp) กลับเข้าสู่ช่วงเหมาะสม 1,510–1,540°C และสังเกตค่า Viscosity ที่ลดลง',
    explanation:
      'ที่อุณหภูมิ 1,510–1,540°C ความหนืดน้ำแก้วจะลดลงสู่ช่วงเหมาะสม (~3.12 log₁₀ Poise) ทำให้ฟองก๊าซในโซน Refining ลอยตัวแตกออกสู่ผิวหน้าได้สมบูรณ์',
    initialControls: {
      furnaceTemp: 1425,
      culletRatio: 15,
      gobSpeed: 45,
      annealingRate: 'standard',
      formingMode: 'h28',
    },
    initialFaults: { coolingAir: false, gasPressure: false },
    checkSuccess: (m) =>
      m.efficiencyPct >= 94 && m.viscosityLogPoise >= 3.0 && m.viscosityLogPoise <= 3.25,
  },
  {
    id: 'mission-stress',
    number: '02',
    title: 'สยบความเค้นสะสมจากกล้องโพลาไรซ์',
    difficulty: 'ระดับพื้นฐาน',
    stationIndex: 4,
    scenario:
      'ฝ่าย QC ตรวจพบแถบสีรุ้งจัดจ้านในกล้อง Polariscope และแก้วแตกร้าวเองหลังออกจากเตา Annealing Lehr โดยมีค่าความเค้นตกค้างสูงเกิน 130 nm/cm',
    objectiveSummary: 'ลดความเค้นตกค้าง (Thermal Stress) ให้ต่ำกว่า 30 nm/cm และรักษา Efficiency ≥ 94%',
    hint: 'ตรวจสอบอัตราการเย็นตัวในเตาอบ (Annealing Rate) ที่ตั้งไว้เป็น Fast Cooling ซึ่งลดอุณหภูมิผ่านจุด 550°C → 500°C เร็วเกินไป',
    explanation:
      'การปรับ Annealing Rate เป็น Standard หรือ Slow ช่วยให้โมเลกุลแก้วคลายความตึงเครียดในช่วง 550°C–500°C ส่งผลให้แถบสีรุ้งในกล้อง Polariscope หายไปและค่าความเค้นต่ำกว่า 30 nm/cm',
    initialControls: {
      furnaceTemp: 1525,
      culletRatio: 25,
      gobSpeed: 45,
      annealingRate: 'fast',
      formingMode: 'h28',
    },
    initialFaults: { coolingAir: false, gasPressure: false },
    checkSuccess: (m) => m.thermalStressNm < 30 && m.efficiencyPct >= 94,
  },
  {
    id: 'mission-green-energy',
    number: '03',
    title: 'ลดพลังงานจำเพาะและคาร์บอนตามเป้าโรงงานสีเขียว',
    difficulty: 'ระดับกลาง',
    stationIndex: 0,
    scenario:
      'โรงงานได้รับนโยบายลดการใช้พลังงานและก๊าซเรือนกระจก โดยต้องลดพลังงานจำเพาะ (Specific Energy) ให้ต่ำกว่า 4.15 GJ/ton พร้อมคงคุณภาพการผลิตระดับสูง',
    objectiveSummary: 'ลดพลังงานจำเพาะ < 4.15 GJ/ton, ลด CO₂ ≥ 12% และคง Pack-to-Melt Efficiency ≥ 94%',
    hint: 'เพิ่มสัดส่วนเศษแก้วรีไซเคิล (Cullet Ratio) ให้สูงขึ้นถึง 40–50% และหลีกเลี่ยงการตั้งอุณหภูมิเตาสูงเกินจำเป็น',
    explanation:
      'เศษแก้ว Cullet ผ่านการหลอมมาแล้วจึงใช้พลังงานหลอมละลายน้อยกว่าวัตถุดิบใหม่ การใช้ Cullet 40–50% ช่วยลดพลังงานจำเพาะต่ำกว่า 4.15 GJ/ton และลด CO₂ ได้ถึง 12–15%',
    initialControls: {
      furnaceTemp: 1560,
      culletRatio: 5,
      gobSpeed: 45,
      annealingRate: 'standard',
      formingMode: 'press',
    },
    initialFaults: { coolingAir: false, gasPressure: false },
    checkSuccess: (m) =>
      m.specificEnergyGJ < 4.15 && m.co2SavePct >= 12 && m.efficiencyPct >= 94,
  },
  {
    id: 'mission-crisis',
    number: '04',
    title: 'กู้คืนสายการผลิตจากวิกฤตสาธารณูปโภคซ้อน',
    difficulty: 'ระดับสูง',
    stationIndex: 3,
    scenario:
      'เกิดเหตุขัดข้องพร้อมกันทั้งลมหล่อเย็นแม่พิมพ์ตก (35%) ความดันก๊าซหัวเผาแกว่ง และความเร็วตัด Gob ตั้งไว้สูงถึง 75 cuts/min ทำให้สายการผลิตแจ้งเตือน ALARM และของเสียพุ่งสูงกว่า 50%',
    objectiveSummary: 'แก้ไขเหตุขัดข้องสาธารณูปโภคทั้งหมด ปรับสมดุล Gob Speed และฟื้นฟู Efficiency ≥ 95%',
    hint: 'กด Reset Faults เพื่อกู้คืนลมหล่อเย็นและแรงดันก๊าซ ลด Gob Speed ลงสู่ช่วง 40–55 cuts/min และตรวจสอบ Annealing Rate',
    explanation:
      'การกู้คืนระบบสาธารณูปโภคควบคู่กับการปรับ Gob Speed ให้สมดุลกับแม่พิมพ์และปรับเตาอบลดความเครียด ช่วยดึงประสิทธิภาพสายการผลิตกลับสู่ระดับมาตรฐาน (≥95%) ได้อย่างรวดเร็ว',
    initialControls: {
      furnaceTemp: 1470,
      culletRatio: 20,
      gobSpeed: 75,
      annealingRate: 'fast',
      formingMode: 'is',
    },
    initialFaults: { coolingAir: true, gasPressure: true },
    checkSuccess: (m, _c, f) =>
      !f.coolingAir && !f.gasPressure && m.efficiencyPct >= 95 && m.thermalStressNm < 35,
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    stationName: '1. Batch House',
    question: 'วัตถุดิบหลักที่มีสัดส่วนมากที่สุด (ประมาณ 72%) ในการผลิตแก้วโซดาไลม์ (Soda-Lime Glass) คือข้อใด?',
    options: [
      'โซดาแอช (Na₂CO₃)',
      'ทรายแก้วซิลิกา (SiO₂)',
      'หินปูน (CaCO₃)',
      'อลูมินา (Al₂O₃)',
    ],
    correctIndex: 1,
    explanation:
      'ทรายแก้วซิลิกา (SiO₂) เป็นโครงสร้างหลักของเนื้อแก้ว (~72%) โดยมีโซดาแอชช่วยลดจุดหลอมเหลวและหินปูนช่วยเพิ่มความทนทานทางเคมี',
  },
  {
    id: 2,
    stationName: '1. Batch House',
    question: 'การเพิ่มสัดส่วนเศษแก้วรีไซเคิล (Cullet Ratio) ในสูตรผสมวัตถุดิบส่งผลดีต่อเตาหลอมอย่างไร?',
    options: [
      'ช่วยลดการใช้พลังงานเชื้อเพลิงและลดการปล่อยก๊าซ CO₂',
      'ทำให้อุณหภูมิหลอมเหลวต้องเพิ่มขึ้นสูงกว่า 1,600°C',
      'เพิ่มปริมาณฟองอากาศในโซน Refining',
      'ทำให้ความแข็งแรงของแก้วลดลงอย่างถาวร',
    ],
    correctIndex: 0,
    explanation:
      'Cullet ผ่านปฏิกิริยาเคมีและหลอมเป็นเนื้อแก้วมาแล้ว ทุก 10% ของ Cullet ช่วยลดพลังงานเชื้อเพลิงเตาหลอมได้ราว 2.5–3% และลด CO₂',
  },
  {
    id: 3,
    stationName: '2. Melting Furnace',
    question: 'หน้าที่หลักของห้องสะสมความร้อน (Regenerator) ในเตาหลอมแก้วอุตสาหกรรมคืออะไร?',
    options: [
      'บดเศษแก้วเสียให้มีขนาดเล็กลง',
      'สลับฝั่งหัวเผาเพื่อนำความร้อนจากไอเสียกลับมาอุ่นอากาศเผาไหม้',
      'เป่าลมเย็นเพื่อลดอุณหภูมิผลิตภัณฑ์แก้วให้เหลือ 65°C',
      'เคลือบผิวดีบุกออกไซด์ป้องกันรอยขีดข่วน',
    ],
    correctIndex: 1,
    explanation:
      'เตาหลอม Regenerative จะสลับฝั่งหัวเผาทุก 20–30 นาที เพื่อใช้ความร้อนสะสมในอิฐ Checker Brick จากไอเสียมาอุ่นอากาศขาเข้า ทำให้ประหยัดเชื้อเพลิงมหาศาล',
  },
  {
    id: 4,
    stationName: '2. Melting Furnace',
    question: 'หากอุณหภูมิเตาหลอมต่ำกว่าเกณฑ์มาตรฐาน (เช่น 1,410°C) จะเกิดผลกระทบใดชัดเจนที่สุด?',
    options: [
      'น้ำแก้วเหลวจนไหลทะลักออกจากแม่พิมพ์',
      'น้ำแก้วมีความหนืดสูงเกินไป ทำให้ฟองอากาศลอยตัวออกไม่ทัน (เกิดตำหนิ Blister)',
      'ความเค้นตกค้างในกล้องโพลาไรซ์ลดลงเป็นศูนย์',
      'ความเร็วในการตัดก้อน Gob เพิ่มขึ้นอัตโนมัติ',
    ],
    correctIndex: 1,
    explanation:
      'ความหนืดของน้ำแก้วแปรผกผันกับอุณหภูมิ เมื่ออุณหภูมิต่ำเกินไปความหนืดจะสูงจนฟองก๊าซไม่สามารถลอยตัวขึ้นสู่ผิวหน้าในโซน Refining ได้',
  },
  {
    id: 5,
    stationName: '3. Gob Feeder',
    question: 'อุปกรณ์ใดที่ทำหน้าที่ตัดลำน้ำแก้วให้เป็นก้อนทรงกระบอก (Gob) ที่มีน้ำหนักแม่นยำก่อนส่งเข้าแม่พิมพ์?',
    options: [
      'Intensive Pan Mixer และ Screw Charger',
      'Reciprocating Plunger และใบมีดกลไก Shears',
      'Recirculation Fans และ Wire Mesh Belt',
      'Optical Camera และ Reject Pusher',
    ],
    correctIndex: 1,
    explanation:
      'แท่งลูกสูบ Plunger จะเคลื่อนที่ขึ้นลงสัมพันธ์กับใบมีด Shears ที่ปลายราง Forehearth เพื่อตัดก้อน Gob ให้ได้น้ำหนักคลาดเคลื่อนไม่เกิน ±0.5 กรัม',
  },
  {
    id: 6,
    stationName: '4. Forming Machine',
    question: 'เครื่องขึ้นรูปชนิดใดที่ใช้การหมุนเป่าในแม่พิมพ์เปียก (Paste Mold) ร่วมกับการลนไฟปากแก้ว (Fire Polishing) สำหรับแก้วน้ำผนังบาง?',
    options: [
      'H-28 Paste Mold Machine',
      'Rotary Press Machine',
      'IS Machine (Individual Section)',
      'Cullet Crusher Machine',
    ],
    correctIndex: 0,
    explanation:
      'เครื่อง H-28 Paste Mold นิยมใช้ผลิตแก้วน้ำผนังบางและแก้วไวน์ไร้รอยตะเข็บ โดยใช้หัวเผา Fire Polishing ลนไฟขอบปากแก้วให้เรียบเนียน',
  },
  {
    id: 7,
    stationName: '4. Forming Machine',
    question: 'หากเกิดเหตุขัดข้อง "ลมหล่อเย็นแม่พิมพ์ตก (Mold Cooling Air Drop)" จะส่งผลต่อผลิตภัณฑ์อย่างไร?',
    options: [
      'แม่พิมพ์เย็นจัดจนแก้วแข็งตัวก่อนเป่า',
      'แม่พิมพ์สะสมความร้อนสูงเกินไป ทำให้แก้วเสียรูปทรง (Deformed)',
      'ชั้นเคลือบผิว Cold-End หนาเกินมาตรฐาน',
      'สัดส่วน Cullet ในถังไซโลลดลงทันที',
    ],
    correctIndex: 1,
    explanation:
      'ลมหล่อเย็นทำหน้าที่ดึงความร้อนออกจากแม่พิมพ์ หากแรงดันลมตก แม่พิมพ์จะร้อนจัดจนชิ้นงานแก้วไม่สามารถคงรูปทรงเมื่อออกจากพิมพ์ได้',
  },
  {
    id: 8,
    stationName: '5. Annealing Lehr',
    question: 'ช่วงอุณหภูมิวิกฤตในเตาอบลดความเครียด (Annealing Lehr) ที่ต้องควบคุมให้แก้วเย็นตัวอย่างช้าๆ เพื่อคลายความเค้นคือช่วงใด?',
    options: [
      '1,550°C → 1,150°C',
      '950°C → 800°C',
      '550°C (Annealing Point) → 500°C (Strain Point)',
      '100°C → 25°C',
    ],
    correctIndex: 2,
    explanation:
      'ช่วง Annealing Point (~550°C) ถึง Strain Point (~500°C) คือช่วงที่โครงสร้างโมเลกุลแก้วค่อยๆ คลายความตึงเครียด หากเย็นตัวเร็วเกินไปจะเกิดความเค้นถาวร',
  },
  {
    id: 9,
    stationName: '6. Surface Coating',
    question: 'วัตถุประสงค์หลักของระบบเคลือบผิว Hot-End (SnCl₄) และ Cold-End (Polyethylene/Wax) คือข้อใด?',
    options: [
      'เปลี่ยนสีเนื้อแก้วให้เป็นสีอำพัน',
      'เพิ่มความลื่น ลดแรงเสียดทานและป้องกันรอยขีดข่วนบนสายพานลำเลียง',
      'เพิ่มน้ำหนักของก้อน Gob ให้ได้ตามมาตรฐาน',
      'ช่วยลดอุณหภูมิในเตาหลอมให้ต่ำลง 200°C',
    ],
    correctIndex: 1,
    explanation:
      'ชั้นฟิล์มดีบุกออกไซด์และโพลีเอทิลีนทำงานร่วมกันเพื่อลดค่าสัมประสิทธิ์แรงเสียดทาน (COF < 0.15) ป้องกันรอยขีดข่วนที่ทำให้ความแข็งแรงแก้วลดลง',
  },
  {
    id: 10,
    stationName: '7. Cold-End QC & Cullet',
    question: 'เมื่อส่องตรวจสอบชิ้นงานแก้วผ่านกล้องโพลาไรซ์ (Polariscope) แล้วพบแถบสีรุ้งจัดจ้านและค่าความเค้น > 50 nm/cm แสดงถึงสิ่งใด?',
    options: [
      'ชิ้นงานแก้วผ่านเกณฑ์มาตรฐาน Grade A',
      'ชิ้นงานมีความเค้นตกค้างสูง เสี่ยงต่อการแตกร้าวฉับพลัน',
      'ชิ้นงานมีชั้นเคลือบผิว Cold-End สมบูรณ์แบบ',
      'ชิ้นงานมีสัดส่วนทรายแก้วซิลิกาสูงเกิน 90%',
    ],
    correctIndex: 1,
    explanation:
      'ปรากฏการณ์ Photoelastic Birefringence ในกล้องโพลาไรซ์จะแสดงแถบสีรุ้งเข้มเมื่อเนื้อแก้วมีความเค้นตกค้างสูงเกินเกณฑ์มาตรฐาน (< 50 nm/cm)',
  },
];
