(async function capturarHojaPowerBI() {
    // ==========================================
    // CREDENCIALES CONFIGURADAS
    // ==========================================
    const BOT_TOKEN = "8725869702:AAFjrG_8xYOPjl34x34yJmopktMYAexP2n4";
    const CHAT_ID   = "7372090510";

    // Cartel visual de estado en pantalla
    const aviso = document.createElement('div');
    aviso.style.cssText = "position:fixed;top:25px;right:25px;background:#0284c7;color:#fff;padding:12px 22px;border-radius:10px;font-weight:bold;z-index:2147483647;box-shadow:0 10px 30px rgba(0,0,0,0.6);font-family:system-ui,sans-serif;";
    aviso.innerText = "📸 Procesando captura del reporte...";
    document.body.appendChild(aviso);

    // Cargar html2canvas en memoria si no está presente
    if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    try {
        // Localizar el contenedor principal de los gráficos de Power BI
        const contenedor = document.querySelector('.visualContainerHost') || 
                           document.querySelector('.canvasArea') || 
                           document.querySelector('#pvExplorationHost') || 
                           document.body;

        aviso.innerText = "🖼️ Renderizando imagen...";

        const canvas = await window.html2canvas(contenedor, {
            useCORS: true,
            allowTaint: true,
            scale: 1.5,
            logging: false
        });

        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
        
        aviso.innerText = "🚀 Enviando captura a @TsukasaPowerBot...";

        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        formData.append('photo', blob, 'powerbi_captura.png');
        formData.append('caption', '📊 *Reporte Preventiva Prepago*\n⏰ Hora de captura: ' + new Date().toLocaleTimeString());
        formData.append('parse_mode', 'Markdown');

        const respuesta = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        if (respuesta.ok) {
            aviso.style.background = "#10b981";
            aviso.innerText = "✅ ¡Captura enviada a Telegram!";
        } else {
            throw new Error("Error en respuesta de Telegram");
        }
    } catch (e) {
        aviso.style.background = "#ef4444";
        aviso.innerText = "❌ Error al generar o enviar la captura.";
    }

    setTimeout(() => aviso.remove(), 4000);
})();
