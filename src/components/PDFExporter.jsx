// src/components/PDFExporter.jsx
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// mm <-> px helpers (96 CSS px ≈ 25.4 mm)
const MM_PER_PX = 25.4 / 96;          // ≈ 0.264583 mm per px
const PX_PER_MM = 96 / 25.4;          // ≈ 3.779527 px per mm

export async function exportPDF(elementId, filename = 'export.pdf') {
    const srcEl = document.getElementById(elementId);
    if (!srcEl) {
        console.warn(`[exportPDF] element #${elementId} niet gevonden`);
        return;
    }

    // 1) PDF-maten & doel-breedte in px (we layouten de kloon exact op PDF-breedte)
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWmm = pdf.internal.pageSize.getWidth();
    const pageHmm = pdf.internal.pageSize.getHeight();

    const marginMm  = 10;
    const renderWmm = pageWmm - marginMm * 2;  // ~190mm
    const renderHmm = pageHmm - marginMm * 2;  // ~277mm

    const renderWpx = Math.round(renderWmm * PX_PER_MM); // ~718 px
    // Hoogte wordt automatisch; we slice later toch per pagina

    // 2) Kloon buiten de layout, layout op PDF-breedte
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-99999px';
    wrapper.style.top = '0';
    wrapper.style.zIndex = '-1';
    wrapper.style.background = '#fff';
    wrapper.style.width = `${renderWpx}px`; // <-- cruciaal: layout direct op PDF-breedte

    const clone = srcEl.cloneNode(true);
    const cloneId = elementId + '__clone_for_pdf';
    clone.id = cloneId;
    clone.style.width = '100%';     // mee schalen met wrapper-breedte
    clone.style.boxSizing = 'border-box';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // 3) Canvas renderen met constraints uit in de kloon
    const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,                 // scherpte
        useCORS: true,
        allowTaint: false,
        width: renderWpx,         // render exact op onze layout-breedte
        windowWidth: renderWpx,
        // hoogte automatisch uit de content
        onclone: (doc) => {
            const el = doc.getElementById(cloneId);
            if (!el) return;

            // voorouders van de kloon: geen overflows/hoogte-limieten
            let p = el.parentElement;
            while (p) {
                p.style.overflow = 'visible';
                p.style.maxHeight = 'none';
                p.style.height = 'auto';
                p = p.parentElement;
            }

            // binnen de kloon: overflow zichtbaar, geen fixed/sticky/transform/max-height
            const all = el.querySelectorAll('*');
            all.forEach((node) => {
                const cs = doc.defaultView.getComputedStyle(node);
                if (cs.overflow !== 'visible') node.style.overflow = 'visible';
                if (cs.maxHeight && cs.maxHeight !== 'none') node.style.maxHeight = 'none';
                if (cs.height && /(px|vh|rem)/.test(cs.height)) node.style.height = 'auto';
                if (cs.transform && cs.transform !== 'none') node.style.transform = 'none';
                if (cs.position === 'fixed' || cs.position === 'sticky') {
                    node.style.position = 'static';
                    node.style.top = 'auto';
                }
            });

            // optioneel: lichte font-boost als je nog nét groter wil
            // el.style.fontSize = '105%';
            // (meestal niet nodig nu we op PDF-breedte layouten)
        },
        logging: false,
    });

    // 4) Opruimen
    document.body.removeChild(wrapper);

    // 5) Slicen naar A4
    const imgWpx = canvas.width;   // ≈ renderWpx * 2
    const imgHpx = canvas.height;

    // px/mm factor: we layoutten op renderWpx pixels die precies renderWmm mm breed worden
    const pxPerMm = imgWpx / renderWmm;            // consistente schaal
    const pageHpx = renderHmm * pxPerMm;           // px-hoogte per PDF-pagina (binnen marges)

    // Handmatige page-breaks op originele bron
    const srcRect   = srcEl.getBoundingClientRect();
    const fullHpx   = Math.max(srcEl.scrollHeight, srcEl.clientHeight); // bronhoogte in px
    // schaal van BRON px naar CANVAS px: we willen verhouding bron→kloon→canvas,
    // maar omdat we de kloon op renderWpx hebben gezet, is horizontale schaal al vast.
    // Voor verticale schaal nemen we verhouding canvas/cloneClientHeight:
    const cloneClientH = clone.scrollHeight || clone.clientHeight || fullHpx;
    const scaleY = imgHpx / cloneClientH;

    const breakPositions = Array.from(srcEl.querySelectorAll('.page-break')).map((n) => {
        const rTop = n.getBoundingClientRect().top - srcRect.top + srcEl.scrollTop;
        return Math.max(0, Math.round(rTop * scaleY));
    });

    const cutSet = new Set();
    for (let y = pageHpx; y < imgHpx; y += pageHpx) cutSet.add(Math.round(y));
    breakPositions.forEach((y) => cutSet.add(y));
    const cuts = Array.from(cutSet).filter((y) => y > 0 && y < imgHpx).sort((a, b) => a - b);

    const slices = [];
    let lastY = 0;
    for (const cutY of [...cuts, imgHpx]) {
        const h = cutY - lastY;
        if (h <= 0) continue;
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width  = imgWpx;
        pageCanvas.height = h;
        const ctx = pageCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, lastY, imgWpx, h, 0, 0, imgWpx, h);
        slices.push(pageCanvas);
        lastY = cutY;
    }

    slices.forEach((c, i) => {
        const imgData = c.toDataURL('image/jpeg', 0.95);
        const sliceHmm = c.height / pxPerMm; // exacte mm-hoogte voor deze slice
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', marginMm, marginMm, renderWmm, Math.min(renderHmm, sliceHmm));
    });

    pdf.save(filename);
}

export default { exportPDF };
