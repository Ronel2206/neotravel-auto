// Mettre ici l'URL du webhook n8n utilisé par le chatbot.
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

function buildBackendUrl(path: string) {
	if (!BACKEND_URL) {
		return null;
	}

	return `${BACKEND_URL.replace(/\/$/, "")}${path}`;
}

export type N8nChatResponse = {
	status: "ask_info" | "complete" | string;
	message: string;
	reply?: string;
	devisData: Record<string, unknown> | null;
	missingInformation?: string[];
	caseType?: "simple" | "complex";
	humanIntervention?: boolean;
	humanInterventionReason?: string;
	recap?: {
		title?: string;
		summary?: string;
		downloadLabel?: string;
		emailLabel?: string;
		emailSent?: boolean;
		emailTo?: string;
	};
};

export type DashboardMetrics = {
	weekLabel: string;
	title: string;
	volumeDevis: number;
	volumeChangeLabel: string;
	conversionRate: number;
	conversionChangeLabel: string;
	averageDelay: string;
	averageDelayChangeLabel: string;
	devisConfirmes: number;
	devisConfirmesChangeLabel: string;
	alerts: string[];
	sparklineVolume: number[];
	sparklineConversion: number[];
};

const DEFAULT_DASHBOARD_METRICS: DashboardMetrics = {
	weekLabel: "Semaine du 10 au 16 février 2025",
	title: "Vue d'ensemble",
	volumeDevis: 48,
	volumeChangeLabel: "+12% vs sem. préc.",
	conversionRate: 34,
	conversionChangeLabel: "-3% vs sem. préc.",
	averageDelay: "4 min",
	averageDelayChangeLabel: "-1min optimisé",
	devisConfirmes: 16,
	devisConfirmesChangeLabel: "+4 ce mois",
	alerts: ["3 devis sans réponse depuis plus de 5 jours — relance recommandée."],
	sparklineVolume: [22, 28, 26, 31, 38, 41, 48],
	sparklineConversion: [44, 43, 41, 40, 38, 36, 34],
};

function normalizeDashboardMetrics(payload: unknown): DashboardMetrics {
	if (!payload || typeof payload !== "object") {
		return DEFAULT_DASHBOARD_METRICS;
	}

	const candidate = payload as Partial<DashboardMetrics> & {
		metrics?: Partial<DashboardMetrics>;
		data?: Partial<DashboardMetrics>;
	};
	const source = candidate.metrics ?? candidate.data ?? candidate;

	return {
		weekLabel: source.weekLabel ?? DEFAULT_DASHBOARD_METRICS.weekLabel,
		title: source.title ?? DEFAULT_DASHBOARD_METRICS.title,
		volumeDevis: source.volumeDevis ?? DEFAULT_DASHBOARD_METRICS.volumeDevis,
		volumeChangeLabel: source.volumeChangeLabel ?? DEFAULT_DASHBOARD_METRICS.volumeChangeLabel,
		conversionRate: source.conversionRate ?? DEFAULT_DASHBOARD_METRICS.conversionRate,
		conversionChangeLabel: source.conversionChangeLabel ?? DEFAULT_DASHBOARD_METRICS.conversionChangeLabel,
		averageDelay: source.averageDelay ?? DEFAULT_DASHBOARD_METRICS.averageDelay,
		averageDelayChangeLabel: source.averageDelayChangeLabel ?? DEFAULT_DASHBOARD_METRICS.averageDelayChangeLabel,
		devisConfirmes: source.devisConfirmes ?? DEFAULT_DASHBOARD_METRICS.devisConfirmes,
		devisConfirmesChangeLabel: source.devisConfirmesChangeLabel ?? DEFAULT_DASHBOARD_METRICS.devisConfirmesChangeLabel,
		alerts: source.alerts?.length ? source.alerts : DEFAULT_DASHBOARD_METRICS.alerts,
		sparklineVolume: source.sparklineVolume?.length ? source.sparklineVolume : DEFAULT_DASHBOARD_METRICS.sparklineVolume,
		sparklineConversion: source.sparklineConversion?.length ? source.sparklineConversion : DEFAULT_DASHBOARD_METRICS.sparklineConversion,
	};
}

export async function sendChatPrompt(prompt: string): Promise<N8nChatResponse> {
	const backendUrl = buildBackendUrl("/api/agent/chat");
	const targetUrl = backendUrl ?? N8N_WEBHOOK_URL;

	if (!targetUrl) {
		throw new Error("NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_N8N_WEBHOOK_URL is not configured.");
	}

	const response = await fetch(targetUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(backendUrl ? { message: prompt } : { prompt }),
	});

	if (!response.ok) {
		throw new Error(`n8n error: ${response.status}`);
	}

	return (await response.json()) as N8nChatResponse;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics | null> {
	// Always fetch dashboard metrics via the backend proxy to avoid exposing webhook URLs.
	if (!BACKEND_URL) {
		return null;
	}

	const url = `${BACKEND_URL.replace(/\/$/, "")}/api/agent/dashboard`;
	const response = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });

	if (!response.ok) {
		throw new Error(`backend dashboard error: ${response.status}`);
	}

	const payload = await response.json();
	return normalizeDashboardMetrics(payload);
}
