"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardMetrics, fetchDashboardMetrics } from "@/app/lib/api";

type KpiCard = {
	title: string;
	value: string;
	changeLabel: string;
	changeTone: "positive" | "negative" | "neutral";
	sparkline?: number[];
	accent: string;
};

const KPI_CARDS: KpiCard[] = [
	{ title: "Volume devis", value: "48", changeLabel: "+12% vs sem. préc.", changeTone: "positive", sparkline: [22, 28, 26, 31, 38, 41, 48], accent: "#4E35D5" },
	{ title: "Taux conversion", value: "34%", changeLabel: "-3% vs sem. préc.", changeTone: "negative", sparkline: [44, 43, 41, 40, 38, 36, 34], accent: "#D93025" },
	{ title: "Délai moyen", value: "4 min", changeLabel: "-1min optimisé", changeTone: "positive", accent: "#0F9D58" },
	{ title: "Devis confirmés", value: "16", changeLabel: "+4 ce mois", changeTone: "positive", accent: "#0F9D58" },
];

const FALLBACK_METRICS: DashboardMetrics = {
	weekLabel: "En attente des données n8n",
	title: "Dashboard KPI",
	volumeDevis: 48,
	volumeChangeLabel: "+12% vs sem. préc.",
	conversionRate: 34,
	conversionChangeLabel: "-3% vs sem. préc.",
	averageDelay: "4 min",
	averageDelayChangeLabel: "-1min optimisé",
	devisConfirmes: 16,
	devisConfirmesChangeLabel: "+4 ce mois",
	alerts: ["Connectez le webhook n8n pour afficher les informations réelles."],
	sparklineVolume: [22, 28, 26, 31, 38, 41, 48],
	sparklineConversion: [44, 43, 41, 40, 38, 36, 34],
};

function Sparkline({ values, stroke, dashed = false }: { values: number[]; stroke: string; dashed?: boolean }) {
	const width = 180;
	const height = 42;
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;
	const points = values
		.map((value, index) => {
			const x = (index / Math.max(values.length - 1, 1)) * width;
			const y = height - ((value - min) / range) * (height - 4) - 2;
			return `${x},${y}`;
		})
		.join(" ");

	return (
		<svg viewBox={`0 0 ${width} ${height}`} width="100%" height="42" aria-hidden="true">
			<polyline
				fill="none"
				stroke={stroke}
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray={dashed ? "7 6" : undefined}
				points={points}
			/>
		</svg>
	);
}

function MetricCard({
	title,
	value,
	changeLabel,
	changeTone,
	sparkline,
	stroke,
	dashed,
}: {
	title: string;
	value: string;
	changeLabel: string;
	changeTone: "positive" | "negative" | "neutral";
	sparkline?: number[];
	stroke?: string;
	dashed?: boolean;
}) {
	const changeColor = changeTone === "negative" ? "#D93025" : changeTone === "positive" ? "#0F9D58" : "#6b7280";

	return (
		<div
			style={{
				border: "1px solid #e0d7ff",
				borderRadius: "20px",
				background: "#ffffff",
				padding: "20px 18px 14px",
				boxShadow: "0 8px 24px rgba(78, 53, 213, 0.06)",
				minHeight: "160px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				boxSizing: "border-box",
			}}
		>
			<div>
				<div style={{ fontSize: "14px", fontWeight: 700, color: "#8A79D4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "8px" }}>
					{title}
				</div>
				<div style={{ fontSize: "40px", lineHeight: 1, fontWeight: 700, color: "#111827" }}>
					{value}
				</div>
				<div style={{ marginTop: "10px", fontSize: "15px", fontWeight: 600, color: changeColor, display: "flex", alignItems: "center", gap: "8px" }}>
					<span aria-hidden="true">↗</span>
					{changeLabel}
				</div>
			</div>

			{sparkline ? (
				<div style={{ marginTop: "14px", padding: "10px 10px 4px", borderRadius: "14px", background: "#f3efff" }}>
					<Sparkline values={sparkline} stroke={stroke ?? "#4E35D5"} dashed={dashed} />
				</div>
			) : null}
		</div>
	);
}

export default function DashboardStats() {
	const [metrics, setMetrics] = useState<DashboardMetrics>(FALLBACK_METRICS);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadMetrics() {
			try {
				const data = await fetchDashboardMetrics();
				if (!isMounted) {
					return;
				}

				setMetrics(data);
				setError(null);
			} catch (loadError) {
				if (!isMounted) {
					return;
				}

				setMetrics(FALLBACK_METRICS);
				setError(loadError instanceof Error ? loadError.message : "Impossible de charger les données n8n.");
			}
		}

		loadMetrics();

		return () => {
			isMounted = false;
		};
	}, []);

	const cards = useMemo(
		() => [
			{ title: "Volume devis", value: String(metrics.volumeDevis), changeLabel: metrics.volumeChangeLabel, changeTone: "positive" as const, sparkline: metrics.sparklineVolume, accent: "#4E35D5", stroke: "#4E35D5" },
			{ title: "Taux conversion", value: `${metrics.conversionRate}%`, changeLabel: metrics.conversionChangeLabel, changeTone: "negative" as const, sparkline: metrics.sparklineConversion, accent: "#D93025", stroke: "#D93025", dashed: true },
			{ title: "Délai moyen", value: metrics.averageDelay, changeLabel: metrics.averageDelayChangeLabel, changeTone: "positive" as const, accent: "#0F9D58" },
			{ title: "Devis confirmés", value: String(metrics.devisConfirmes), changeLabel: metrics.devisConfirmesChangeLabel, changeTone: "positive" as const, accent: "#0F9D58" },
		],
		[metrics],
	);

	return (
		<main
			style={{
				minHeight: "100%",
				padding: "28px 24px 40px",
				boxSizing: "border-box",
				background: "linear-gradient(180deg, #fbfaff 0%, #ffffff 44%, #fbfafc 100%)",
				fontFamily: "Inter, sans-serif",
				color: "#111827",
			}}
		>
			<div style={{ maxWidth: "1100px", margin: "0 auto" }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "end",
						gap: "16px",
						flexWrap: "wrap",
						marginBottom: "18px",
					}}
				>
					<div>
						<div style={{ fontSize: "32px", fontWeight: 700, color: "#111827" }}>{metrics.title}</div>
						<div style={{ fontSize: "18px", fontWeight: 500, color: "#7C6FD6", marginTop: "4px" }}>
							{metrics.weekLabel}
						</div>
					</div>
					<div
						style={{
							padding: "12px 16px",
							borderRadius: "16px",
							background: "#f7f4ff",
							border: "1px solid #e0d7ff",
							fontSize: "14px",
							fontWeight: 600,
							color: "#4E35D5",
						}}
					>
						Données connectées au webhook n8n
					</div>
				</div>

				{error ? (
					<div
						style={{
							marginBottom: "16px",
							padding: "12px 14px",
							borderRadius: "14px",
							background: "#fff7ed",
							border: "1px solid #fed7aa",
							color: "#9a3412",
							fontSize: "14px",
						}}
					>
						{error}
					</div>
				) : null}

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
						gap: "14px",
					}}
				>
					{cards.map((card) => (
						<MetricCard key={card.title} {...card} />
					))}
				</div>

				<div
					style={{
						marginTop: "26px",
						display: "grid",
						gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 0.9fr)",
						gap: "14px",
					}}
				>
					<div
						style={{
							borderRadius: "18px",
							padding: "20px",
							background: "#ffffff",
							border: "1px solid #ece8ff",
							boxShadow: "0 8px 24px rgba(78, 53, 213, 0.05)",
						}}
					/>

					<div
						style={{
							borderRadius: "18px",
							padding: "20px",
							background: "#fff8e8",
							border: "1px solid #f4c54d",
							boxShadow: "0 8px 24px rgba(217, 153, 0, 0.06)",
						}}
					>
						<div style={{ fontSize: "16px", fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>
							Alerte visuelle
						</div>
						<div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
							<div style={{ color: "#d97706", fontSize: "20px", lineHeight: 1, marginTop: "1px" }}>⚠</div>
							<div style={{ color: "#111827", fontSize: "15px", fontWeight: 600, lineHeight: 1.55 }}>
								{metrics.alerts[0]}
							</div>
						</div>
					</div>
				</div>

				{/* Branche ici le webhook n8n qui alimente les KPI du dashboard front end. */}
			</div>
		</main>
	);
}