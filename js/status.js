import { PROXY } from "./config.js";

const statusPanel = document.getElementById("status-panel");

async function checkEndpoint(name, endpoint) {
    const start = performance.now();

    try {
        const res = await fetch(`${PROXY}/${endpoint}`);
        const time = Math.round(performance.now() - start);

        const json = await res.json();

        if (json.fallback) {
            return {
                name,
                status: "warn",
                time,
                message: "Fallback"
            };
        }

        return {
            name,
            status: "ok",
            time,
            message: "OK"
        };

    } catch (err) {
        return {
            name,
            status: "error",
            time: null,
            message: "Erreur"
        };
    }
}

export async function updateStatusPanel() {
    const results = await Promise.all([
        checkEndpoint("CheckWX METAR", "metar"),
        checkEndpoint("CheckWX TAF", "taf"),
        checkEndpoint("OpenSky FIDS", "fids"),
        checkEndpoint("Backend Render", "sonos")
    ]);

    statusPanel.innerHTML = results.map(r => `
        <div class="status-item status-${r.status}">
            <span>${r.name}</span>
            <span>${r.time ? r.time + " ms" : r.message}</span>
        </div>
    `).join("");
}

// Mise à jour toutes les 30 secondes
setInterval(updateStatusPanel, 30000);
