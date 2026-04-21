const API_KEY = '20ddfa3b9ce347ae91f27a8cb94e2d4f';
const BASE_URL = 'https://api.football-data.org/v4';
const PROXY = 'https://corsproxy.io/?';

const COMPETITIONS = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL'];

async function load(type) {
    const content = document.getElementById("content");
    content.innerHTML = '<div class="loading">جاري جلب المباريات...</div>';

    document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    try {
        const today = new Date().toISOString().split('T')[0];
        const allMatches = [];

        for (const comp of COMPETITIONS) {
            const apiUrl = type === 'liveMatches'
                ? `${BASE_URL}/competitions/${comp}/matches?status=LIVE`
                : `${BASE_URL}/competitions/${comp}/matches?dateFrom=${today}&dateTo=${today}`;

            const res = await fetch(PROXY + encodeURIComponent(apiUrl), {
                headers: { 'X-Auth-Token': API_KEY }
            });

            if (!res.ok) continue;
            const data = await res.json();
            if (data.matches) allMatches.push(...data.matches);
        }

        if (allMatches.length === 0) {
            content.innerHTML = '<p class="no-matches">لا توجد مباريات متاحة حالياً</p>';
            return;
        }

        renderMatches(allMatches);

    } catch (err) {
        console.error(err);
        content.innerHTML = '<div class="error">فشل الاتصال بالسيرفر!</div>';
    }
}

function renderMatches(matches) {
    const content = document.getElementById("content");
    content.innerHTML = matches.map(match => {
        const home = match.score?.fullTime?.home ?? '-';
        const away = match.score?.fullTime?.away ?? '-';
        const elapsed = match.minute ? `(${match.minute}')` : '';
        const statusMap = {
            'SCHEDULED': 'لم تبدأ',
            'LIVE': '🔴 مباشر',
            'IN_PLAY': '🔴 جارية',
            'PAUSED': 'استراحة',
            'FINISHED': 'انتهت',
            'POSTPONED': 'مؤجلة',
            'CANCELLED': 'ملغية',
        };
        const status = statusMap[match.status] || match.status;

        return `
        <div class="match-item">
            <div class="league-name">${match.competition?.name || ''}</div>
            <div class="match-teams">
                <span class="team">${match.homeTeam?.shortName || match.homeTeam?.name}</span>
                <span class="score">${home} - ${away}</span>
                <span class="team">${match.awayTeam?.shortName || match.awayTeam?.name}</span>
            </div>
            <div class="match-status">${status} ${elapsed}</div>
        </div>`;
    }).join('');
}

window.onload = () => load('todayMatches');
