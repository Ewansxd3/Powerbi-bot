(async function capturarHojaPowerBI() {
    const BOT_TOKEN = "8725869702:AAFjrG_8xYOPjl34x34yJmopktMYAexP2n4";
    const CHAT_ID   = "7372090510";

    const viejo = document.getElementById('aviso-powerbi');
    if (viejo) viejo.remove();

    const aviso = document.createElement('div');
    aviso.id = 'aviso-powerbi';
    aviso.style.cssText = "position:fixed;top:25px;right:25px;background:#0284c7;color:#fff;padding:14px 22px;border-radius:10px;font-weight:bold;z-index:2147483647;box-shadow:0 10px 30px rgba(0,0,0,0.6);font-family:system-ui,sans-serif;max-width:420px;line-height:1.4;";
    aviso.innerText = "⏳ Iniciando captura...";
    document.body.appendChild(aviso);

    try {
        // 1. Cargar html2canvas vía fetch+eval (evita bloqueo de etiquetas <script> en Power BI)
        if (!window.html2canvas) {
            aviso.innerText = "📦 Descargando motor gráfico...";
            const rawLib = await fetch("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js").then(r => {
                if (!r.ok) throw new Error("No se pudo descargar html2canvas (" + r.status + ")");
                return r.text();
            });
            window.eval(rawLib);
        }

        // 2. Localizar el contenedor de gráficos
        aviso.innerText = "🖼️ Renderizando lienzo de Power BI...";
        const contenedor = document.querySelector('.visualContainerHost') || 
                           document.querySelector('.canvasArea') || 
                           document.querySelector('#pvExplorationHost') || 
                           document.body;

        const canvas = await window.html2canvas(contenedor, {
            useCORS: true,
            allowTaint: true,
            scale: 1.2,
            logging: false
        });

        // 3. Convertir a Blob
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(b => b ? resolve(b) : reject(new Error("Error al convertir imagen a Blob")), 'image/png');
        });

        // 4. Enviar a Telegram
        aviso.innerText = "🚀 Enviando imagen a Telegram...";
        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        formData.append('photo', blob, 'powerbi_captura.png');
        formData.append('caption', '📊 *Reporte Preventiva Prepago*\n⏰ ' + new Date().toLocaleTimeString());
        formData.append('parse_mode', 'Markdown');

        const respuesta = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        const resJson = await respuesta.json().catch(() => ({}));

        if (respuesta.ok && resJson.ok) {
            aviso.style.background = "#10b981";
            aviso.innerText = "✅ ¡Captura enviada a Telegram con éxito!";
            setTimeout(() => aviso.remove(), 4000);
        } else {
            throw new Error(resJson.description || ("Telegram HTTP " + respuesta.status));
        }
    } catch (err) {
        aviso.style.background = "#ef4444";
        aviso.innerHTML = `❌ <b>Error:</b> ${err.message || err}`;
        console.error("Detalle error PowerBI:", err);
        setTimeout(() => aviso.remove(), 9000);
    }
})();
