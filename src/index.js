const fs = require("fs")
const path = require("path")
const PDFDocument = require("pdfkit")

const PROJECT_LINK = "https://github.com/kukumberman/node-pdf-creator"

const fonts = {
  default: "Regular",
  bold: "Bold"
}

const config = readConfig()
const doc = new PDFDocument({ bufferPages: true })

function readConfig() {
  const configName = process.argv.includes("--example") ? "config.example.json" : "config.json"
  const pathToConfig = path.resolve("src", configName)
  if (!fs.existsSync(pathToConfig)) {
    throw new Error(`Config file does not exist at path ${pathToConfig}`)
  }
  const jsonText = fs.readFileSync(pathToConfig)
  return JSON.parse(jsonText)
}

function loadFonts() {
  Object.entries(config.fonts).forEach(([k, v]) => {
    fonts[k] = v.name
    doc.registerFont(v.name, path.resolve(__dirname, v.src))
  })
}

function setMetadata() {
  doc.info.Author = "kukumberman"
  doc.info.Title = ""
  doc.info.Creator = PROJECT_LINK
  doc.info.Subject = ""
}

function addProjects(section) {
  doc
    .fontSize(16)
    .font(fonts.bold)
    .text(section.header, { align: "center", destination: section.header })
    .moveDown()

  if (typeof section.description === "string" && section.description.length > 0) {
    doc
      .fillColor("black")
      .fontSize(14)
      .font(fonts.default)
      .text(section.description)
      .moveDown(1.5)
  }

  section.projects.forEach(project => {
    doc
      .fillColor("black")
      .fontSize(14)
      .font(fonts.default)
      .text(project.name)
      .moveDown(0.5)

    doc
      .fillColor("blue")
      .fontSize(12)
      .list(project.links, { underline: true, bulletRadius: 2 })
      .moveDown()
  })
}

// todo: add support for rectangular avatar
function profileImage() {
  const center = doc.page.width * 0.5 - config.avatar.radius * 0.5

  const avatarCircle = {
    x: doc.page.width * 0.5,
    y: doc.page.margins.top + config.avatar.radius * 0.5,
    r: config.avatar.radius * 0.5,
  }

  const image = path.resolve(__dirname, config.avatar.src)
  
  doc.save()
  
  doc.circle(avatarCircle.x, avatarCircle.y, avatarCircle.r).clip()
  doc.image(image, center, doc.page.margins.top, { fit: [config.avatar.radius, config.avatar.radius]})
  doc
    .circle(avatarCircle.x, avatarCircle.y, avatarCircle.r)
    .lineWidth(1)
    .strokeColor("red")
    .stroke("black")
  
  doc.restore()

  doc.moveDown(2)
}

function profileLinks() {
  doc
    .font(fonts.default)
    .fontSize(14)
    .fillColor("blue")

  config.profile.links.forEach(link => {
    doc
      .text(link, { underline: true, align: "center" })
      .moveDown(0.5)
  })

  doc.moveDown(1)

  doc
    .lineGap(10)
    .fillColor("black")
    .font(fonts.bold)
    .fontSize(16)
    .text("Portfolio", { align: "center" })
    
  doc
    .font(fonts.default)
    .fontSize(14)

  config.sections.forEach(section => {
    doc
      .fillColor("blue")
      .text(section.header, { goTo: section.header, underline: true, align: "center" })
  })

  doc
    .lineGap(0)
    .moveDown(2)
    .fillColor("black")
    .text("Fun fact — this document was generated using Node.js", { align: "center" })
    .fillColor("blue")
    .text("Project Link", { align: "center", "link": PROJECT_LINK, underline: true })
}

function addPageNumbers() {
  for (let i = 0, length = doc.bufferedPageRange().count; i < length; i++) {
    doc.switchToPage(i)
    const mb = doc.page.margins.bottom
    doc.page.margins.bottom = 0
    
    doc
      .fillColor("black")
      .font(fonts.default)
      .fontSize(12)
      .text(`${i+1}`, 0, doc.page.height - mb, { align: "right" })

    doc.page.margins.bottom = mb
  }
}

function main() {
  doc.pipe(fs.createWriteStream(config.output))

  setMetadata()
  loadFonts()

  profileImage()
  profileLinks()

  config.sections.forEach(section => {
    doc.addPage()
    addProjects(section)
  })

  addPageNumbers()

  doc.end()
}

main()
