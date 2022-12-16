export default defineNuxtPlugin(() => {
  if (process.client) {
    ;(function (win, doc) {
      if (!win.addEventListener) return
      function setFont() {
        // var html = document.documentElement;
        // var k = 640;
        // html.style.fontSize = html.clientWidth / k * 100 + "px";
        let screenWidth = document.querySelector('html')!.offsetWidth
        const baseSz = 100
        const pageWidth = 750
        if (screenWidth > 640) screenWidth = 640

        let fZ = (baseSz * screenWidth) / pageWidth
        // if (fZ > 85) fZ = 85
        // if (fZ > 50) fZ = 50
        if (fZ > 48) fZ = 48
        document.querySelector('html')!.style.fontSize = `${fZ}px`
      }
      setFont()
      setTimeout(() => {
        setFont()
      }, 300)
      doc.addEventListener('DOMContentLoaded', setFont, false)
      win.addEventListener('resize', setFont, false)
      win.addEventListener('load', setFont, false)
    })(window, document)
  }
})
